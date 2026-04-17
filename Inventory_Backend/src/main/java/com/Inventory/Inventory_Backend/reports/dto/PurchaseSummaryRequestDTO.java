package com.Inventory.Inventory_Backend.reports.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PurchaseSummaryRequestDTO {
    private LocalDate fromDate;
    private LocalDate toDate;
}
