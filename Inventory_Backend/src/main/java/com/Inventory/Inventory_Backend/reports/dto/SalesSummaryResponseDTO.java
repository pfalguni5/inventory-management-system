package com.Inventory.Inventory_Backend.reports.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class SalesSummaryResponseDTO {

    private List<SalesSummaryRowDTO> rows;

    private Integer totalInvoices;
    private BigDecimal totalDiscount;
    private BigDecimal totalTaxableValue;
    private BigDecimal totalGST;
    private BigDecimal totalAmount;

}
