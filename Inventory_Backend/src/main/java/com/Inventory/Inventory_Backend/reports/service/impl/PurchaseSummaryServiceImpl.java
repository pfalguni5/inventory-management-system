package com.Inventory.Inventory_Backend.reports.service.impl;

import com.Inventory.Inventory_Backend.reports.dto.PurchaseSummaryRequestDTO;
import com.Inventory.Inventory_Backend.reports.dto.PurchaseSummaryResponseDTO;
import com.Inventory.Inventory_Backend.reports.dto.PurchaseSummaryRowDTO;
import com.Inventory.Inventory_Backend.reports.repository.PurchaseInvoiceReportRepository;
import com.Inventory.Inventory_Backend.reports.service.PurchaseSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseSummaryServiceImpl implements PurchaseSummaryService {
    private final PurchaseInvoiceReportRepository repository;

    @Override
    public PurchaseSummaryResponseDTO getPurchaseSummary(Long businessId, PurchaseSummaryRequestDTO request) {

        // Validate inputs
        if (businessId == null) {
            throw new RuntimeException("Business ID is required");
        }
        if (request.getFromDate() == null || request.getToDate() == null) {
            throw new RuntimeException("Both fromDate and toDate are required");
        }

        List<PurchaseSummaryRowDTO> rows = repository.getPurchaseSummary(
                businessId,
                request.getFromDate(),
                request.getToDate());

        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTaxable = BigDecimal.ZERO;
        BigDecimal totalGST = BigDecimal.ZERO;
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (PurchaseSummaryRowDTO row : rows) {
            totalDiscount = totalDiscount.add(row.getDiscount() != null ? row.getDiscount() : BigDecimal.ZERO);
            totalTaxable = totalTaxable.add(row.getTaxableValue() != null ? row.getTaxableValue() : BigDecimal.ZERO);
            totalGST = totalGST.add(row.getGst() != null ? row.getGst() : BigDecimal.ZERO);
            totalAmount = totalAmount.add(row.getTotalAmount() != null ? row.getTotalAmount() : BigDecimal.ZERO);
        }

        return PurchaseSummaryResponseDTO.builder()
                .rows(rows)
                .totalInvoices(rows.size())
                .totalDiscount(totalDiscount)
                .totalTaxableValue(totalTaxable)
                .totalGST(totalGST)
                .totalAmount(totalAmount)
                .build();
    }
}
