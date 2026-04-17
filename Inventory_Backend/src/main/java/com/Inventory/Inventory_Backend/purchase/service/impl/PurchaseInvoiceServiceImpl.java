package com.Inventory.Inventory_Backend.purchase.service.impl;

import com.Inventory.Inventory_Backend.item.repository.ItemRepository;
import com.Inventory.Inventory_Backend.party.repository.PartyRepository;
import com.Inventory.Inventory_Backend.party.entity.PartyType;
import com.Inventory.Inventory_Backend.purchase.dto.PurchaseInvoiceItemDTO;
import com.Inventory.Inventory_Backend.purchase.dto.PurchaseInvoiceRequestDTO;
import com.Inventory.Inventory_Backend.purchase.dto.PurchaseInvoiceResponseDTO;
import com.Inventory.Inventory_Backend.purchase.entity.PurchaseInvoice;
import com.Inventory.Inventory_Backend.purchase.entity.PurchaseInvoiceItem;
import com.Inventory.Inventory_Backend.purchase.exception.DuplicateBillNumberException;
import com.Inventory.Inventory_Backend.purchase.exception.PurchaseInvoiceNotFoundException;
import com.Inventory.Inventory_Backend.purchase.mapper.PurchaseInvoiceMapper;
import com.Inventory.Inventory_Backend.purchase.repository.PurchaseInvoiceRepository;
import com.Inventory.Inventory_Backend.purchase.service.PurchaseInvoiceService;
import com.Inventory.Inventory_Backend.stock.service.StockService;
import com.Inventory.Inventory_Backend.notification.service.NotificationService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PurchaseInvoiceServiceImpl implements PurchaseInvoiceService {

    private final PurchaseInvoiceRepository invoiceRepository;
    private final PartyRepository partyRepository;
    private final ItemRepository itemRepository;
    private final PurchaseInvoiceMapper mapper;
    private final StockService stockService;
    private final NotificationService notificationService;

    @PersistenceContext
    private EntityManager entityManager;

    // ================= CREATE =================
    @Override
    @Transactional
    public PurchaseInvoiceResponseDTO createPurchaseInvoice(
            Long businessId,
            PurchaseInvoiceRequestDTO request) {

        validatePartyBelongsToBusiness(request.getPartyId(), businessId);
        validateBillNumberIsUnique(businessId, request.getBillNumber());
        validateAllItemsBelongToBusiness(request.getItems(), businessId);

        PurchaseInvoice invoice = mapper.toEntity(request);

        invoice.setBusinessId(businessId);
        invoice.setItems(new ArrayList<>());

        calculateInvoiceTotals(invoice, request);
        updateInvoiceStatus(invoice);

        invoiceRepository.save(invoice);
        System.out.println("Items count: " + invoice.getItems().size());
        for (PurchaseInvoiceItem item : invoice.getItems()) {
            stockService.increaseStock(
                    businessId,
                    item.getItemId(),
                    item.getQuantity(),
                    invoice.getId());
        }

        return mapper.toResponseDTO(invoice);
    }

    // ================= GET =================
    @Override
    public PurchaseInvoiceResponseDTO getPurchaseInvoiceById(Long businessId, Long id) {

        PurchaseInvoice invoice = invoiceRepository
                .findByIdWithItemsAndParty(id, businessId)
                .orElseThrow(() -> new PurchaseInvoiceNotFoundException(id, businessId));

        return mapper.toResponseDTO(invoice);
    }

    @Override
    public List<PurchaseInvoiceResponseDTO> getAllPurchaseInvoices(Long businessId) {

        return mapper.toResponseDTOList(
                invoiceRepository.findByBusinessIdAndIsDeletedFalseOrderByCreatedAtDesc(businessId));
    }

    // ================= UPDATE =================
    @Override
    @Transactional
    public PurchaseInvoiceResponseDTO updatePurchaseInvoice(
            Long businessId,
            Long id,
            PurchaseInvoiceRequestDTO request) {

        PurchaseInvoice invoice = invoiceRepository
                .findByIdWithItemsAndParty(id, businessId)
                .orElseThrow(() -> new PurchaseInvoiceNotFoundException(id, businessId));

        // ===== PAYMENT-ONLY UPDATE =====
        // If request has no items, this is a payment recording operation - only update
        // amountPaid and balance
        if (request.getItems() == null || request.getItems().isEmpty()) {
            // Just update the payment amount and recalculate balance
            String oldPaymentStatus = invoice.getStatus();

            invoice.setAmountPaid(request.getAmountPaid() == null ? BigDecimal.ZERO : request.getAmountPaid());
            // Recalculate balance keeping grandTotal unchanged
            BigDecimal grandTotal = invoice.getGrandTotal() != null ? invoice.getGrandTotal() : BigDecimal.ZERO;
            invoice.setBalance(grandTotal.subtract(invoice.getAmountPaid()));
            updateInvoiceStatus(invoice);

            PurchaseInvoice saved = invoiceRepository.save(invoice);

            // EVENT-DRIVEN: Trigger notification when payment status changes
            try {
                notificationService.onPurchasePaymentStatusChanged(businessId, id, oldPaymentStatus, saved.getStatus());
            } catch (Exception e) {
                System.err.println("Error in onPurchasePaymentStatusChanged: " + e.getMessage());
            }

            return mapper.toResponseDTO(saved);
        }

        // ===== FULL INVOICE UPDATE =====
        validatePartyBelongsToBusiness(request.getPartyId(), businessId);
        validateBillNumberIsUniqueForUpdate(businessId, request.getBillNumber(), id);
        validateAllItemsBelongToBusiness(request.getItems(), businessId);

        String oldPaymentStatus = invoice.getStatus();

        // step 1: restore old stock first
        for (PurchaseInvoiceItem item : invoice.getItems()) {
            stockService.decreaseStock(
                    businessId,
                    item.getItemId(),
                    item.getQuantity(),
                    invoice.getId());
        }

        // ===== EXPLICITLY DELETE OLD ITEMS FROM DATABASE =====
        invoice.getItems().clear();
        invoiceRepository.flush(); // Force JPA to execute the delete immediately

        // update fields
        invoice.setPartyId(request.getPartyId());
        invoice.setBillNumber(request.getBillNumber());

        calculateInvoiceTotals(invoice, request);
        updateInvoiceStatus(invoice);

        PurchaseInvoice saved = invoiceRepository.save(invoice);

        // EVENT-DRIVEN: Trigger notification when payment status changes
        try {
            notificationService.onPurchasePaymentStatusChanged(businessId, id, oldPaymentStatus, saved.getStatus());
        } catch (Exception e) {
            System.err.println("Error in onPurchasePaymentStatusChanged: " + e.getMessage());
        }

        // step 2: apply new stock
        for (PurchaseInvoiceItem item : saved.getItems()) {
            stockService.increaseStock(
                    businessId,
                    item.getItemId(),
                    item.getQuantity(),
                    saved.getId());
        }

        return mapper.toResponseDTO(saved);
    }

    // ================= DELETE =================
    @Override
    @Transactional
    public void deletePurchaseInvoice(Long businessId, Long id) {

        PurchaseInvoice invoice = invoiceRepository
                .findByIdAndBusinessIdAndIsDeletedFalse(id, businessId)
                .orElseThrow(() -> new PurchaseInvoiceNotFoundException(id, businessId));

        if (invoice.getAmountPaid() != null &&
                invoice.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Cannot delete purchase with payment");
        }

        invoice.setIsDeleted(true);
        invoiceRepository.save(invoice);
    }

    // ================= CANCEL =================
    @Override
    @Transactional
    public PurchaseInvoiceResponseDTO cancelInvoice(Long businessId, Long id) {

        PurchaseInvoice invoice = invoiceRepository
                .findByIdAndBusinessIdAndIsDeletedFalse(id, businessId)
                .orElseThrow(() -> new PurchaseInvoiceNotFoundException(id, businessId));

        for (PurchaseInvoiceItem item : invoice.getItems()) {
            stockService.decreaseStock(
                    businessId,
                    item.getItemId(),
                    item.getQuantity(),
                    invoice.getId());
        }

        invoice.setStatus("CANCELLED");

        return mapper.toResponseDTO(invoiceRepository.save(invoice));
    }

    // ================= VALIDATIONS =================

    private void validatePartyBelongsToBusiness(Long partyId, Long businessId) {

        var party = partyRepository
                .findByIdAndBusinessIdAndIsActiveTrue(partyId, businessId)
                .orElseThrow(() -> new IllegalArgumentException("Party not found"));

        // ✅ ENUM FIX
        if (party.getType() != PartyType.SUPPLIER &&
                party.getType() != PartyType.BOTH) {

            throw new IllegalArgumentException("Only SUPPLIER allowed");
        }
    }

    private void validateBillNumberIsUnique(Long businessId, String billNumber) {

        if (invoiceRepository.existsByBusinessIdAndBillNumberAndIsDeletedFalse(
                businessId, billNumber)) {

            throw new DuplicateBillNumberException(billNumber);
        }
    }

    private void validateBillNumberIsUniqueForUpdate(Long businessId,
            String billNumber,
            Long id) {

        if (invoiceRepository.existsByBusinessIdAndBillNumberAndIdNotAndIsDeletedFalse(
                businessId, billNumber, id)) {

            throw new DuplicateBillNumberException(billNumber);
        }
    }

    private void validateAllItemsBelongToBusiness(List<PurchaseInvoiceItemDTO> items,
            Long businessId) {

        for (PurchaseInvoiceItemDTO dto : items) {
            if (!itemRepository.existsByIdAndBusinessIdAndIsActiveTrue(
                    dto.getItemId(), businessId)) {

                throw new IllegalArgumentException("Item not found: " + dto.getItemId());
            }
        }
    }

    // ================= CALCULATIONS =================

    private void calculateInvoiceTotals(PurchaseInvoice invoice,
            PurchaseInvoiceRequestDTO request) {

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (PurchaseInvoiceItemDTO item : request.getItems()) {
            // Base amount for this item (quantity * rate)
            BigDecimal itemBase = item.getQuantity().multiply(item.getRate())
                    .setScale(2, RoundingMode.HALF_UP);

            // Discount for this item
            BigDecimal itemDiscount = item.getDiscount() != null ? item.getDiscount() : BigDecimal.ZERO;
            totalDiscount = totalDiscount.add(itemDiscount);

            // Subtotal after discount
            BigDecimal itemSubtotal = itemBase.subtract(itemDiscount)
                    .setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(itemSubtotal);

            // Tax for this item (calculated on discounted amount)
            BigDecimal gstRate = item.getGstRate() != null ? item.getGstRate() : BigDecimal.ZERO;
            BigDecimal itemTax = itemSubtotal.multiply(gstRate)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            totalTax = totalTax.add(itemTax);

            PurchaseInvoiceItem entity = mapper.toItemEntity(item);
            // multi tenant safety
            entity.setBusinessId(invoice.getBusinessId());

            // ===== SET ITEM-LEVEL TOTAL =====
            entity.setTotal(itemSubtotal.add(itemTax));

            // ===== IMPORTANT: Set ID to null for new items during updates =====
            entity.setId(null);

            invoice.addItem(entity);
        }

        BigDecimal grandTotal = subtotal.add(totalTax);

        invoice.setSubtotal(subtotal);
        invoice.setTotalDiscount(totalDiscount);
        invoice.setTotalTax(totalTax);
        invoice.setGrandTotal(grandTotal);
        invoice.setAmountPaid(
                request.getAmountPaid() == null ? BigDecimal.ZERO : request.getAmountPaid());
        // ===== SET BALANCE =====
        invoice.setBalance(grandTotal.subtract(invoice.getAmountPaid()));
    }

    // ================= STATUS UPDATE =================
    private void updateInvoiceStatus(PurchaseInvoice invoice) {
        // Don't override cancelled status
        if ("CANCELLED".equalsIgnoreCase(invoice.getStatus())) {
            return;
        }

        BigDecimal amountPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO;
        BigDecimal grandTotal = invoice.getGrandTotal() != null ? invoice.getGrandTotal() : BigDecimal.ZERO;

        if (amountPaid.compareTo(grandTotal) >= 0) {
            // Full payment received
            invoice.setStatus("paid");
            // Resolve payment notifications for this invoice
            try {
                notificationService.resolvePurchasePaymentNotifications(invoice.getBusinessId(), invoice.getId());
            } catch (Exception e) {
                log.warn("Failed to resolve payment notifications for purchase invoice: " + invoice.getId(), e);
            }
        } else if (amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            // Partial payment received
            invoice.setStatus("partial");
        } else {
            // No payment received
            invoice.setStatus("pending");
        }
    }
}