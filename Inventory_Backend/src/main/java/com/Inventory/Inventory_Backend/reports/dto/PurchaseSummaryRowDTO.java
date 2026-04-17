package com.Inventory.Inventory_Backend.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class PurchaseSummaryRowDTO {
    private String invoiceNo;
    private LocalDate invoiceDate;
    private String supplierName;
    private String supplierGSTIN;
    private BigDecimal discount;
    private BigDecimal taxableValue;
    private BigDecimal gst;
    private BigDecimal totalAmount;
}
