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

        validatePartyBelongsToBusiness(request.getPartyId(), businessId);
        validateBillNumberIsUniqueForUpdate(businessId, request.getBillNumber(), id);
        validateAllItemsBelongToBusiness(request.getItems(), businessId);

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
        BigDecimal totalTax = BigDecimal.ZERO;

        for (PurchaseInvoiceItemDTO item : request.getItems()) {
            // Subtotal for this item
            BigDecimal itemSubtotal = item.getQuantity().multiply(item.getRate());
            subtotal = subtotal.add(itemSubtotal);

            // Tax for this item (can be CGST, SGST, or IGST depending on intraState flag)
            BigDecimal gstRate = item.getGstRate() != null ? item.getGstRate() : BigDecimal.ZERO;
            BigDecimal itemTax = itemSubtotal.multiply(gstRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
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
        } else if (amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            // Partial payment received
            invoice.setStatus("partial");
        } else {
            // No payment received
            invoice.setStatus("pending");
        }
    }
}