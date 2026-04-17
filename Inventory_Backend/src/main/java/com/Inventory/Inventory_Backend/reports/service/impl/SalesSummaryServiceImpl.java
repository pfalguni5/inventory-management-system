package com.Inventory.Inventory_Backend.reports.service.impl;

import com.Inventory.Inventory_Backend.reports.dto.SalesSummaryRequestDTO;
import com.Inventory.Inventory_Backend.reports.dto.SalesSummaryResponseDTO;
import com.Inventory.Inventory_Backend.reports.dto.SalesSummaryRowDTO;
import com.Inventory.Inventory_Backend.reports.repository.SalesInvoiceReportRepository;
import com.Inventory.Inventory_Backend.reports.service.SalesSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesSummaryServiceImpl implements SalesSummaryService {
    private final SalesInvoiceReportRepository repository;

    @Override
    public SalesSummaryResponseDTO getSalesSummary(Long businessId, SalesSummaryRequestDTO request) {

        // Validate inputs
        if (businessId == null) {
            throw new RuntimeException("Business ID is required");
        }
        if (request.getFromDate() == null || request.getToDate() == null) {
            throw new RuntimeException("Both fromDate and toDate are required");
        }

        List<SalesSummaryRowDTO> rows = repository.getSalesSummary(
                businessId,
                request.getFromDate(),
                request.getToDate());

        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTaxable = BigDecimal.ZERO;
        BigDecimal totalGST = BigDecimal.ZERO;
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (SalesSummaryRowDTO row : rows) {
            totalDiscount = totalDiscount.add(row.getDiscount() != null ? row.getDiscount() : BigDecimal.ZERO);
            totalTaxable = totalTaxable.add(row.getTaxableValue() != null ? row.getTaxableValue() : BigDecimal.ZERO);
            totalGST = totalGST.add(row.getGst() != null ? row.getGst() : BigDecimal.ZERO);
            totalAmount = totalAmount.add(row.getTotalAmount() != null ? row.getTotalAmount() : BigDecimal.ZERO);
        }

        return SalesSummaryResponseDTO.builder()
                .rows(rows)
                .totalInvoices(rows.size())
                .totalDiscount(totalDiscount)
                .totalTaxableValue(totalTaxable)
                .totalGST(totalGST)
                .totalAmount(totalAmount)
                .build();
    }
}
