package com.Inventory.Inventory_Backend.reports.service;

import com.Inventory.Inventory_Backend.reports.dto.SalesSummaryRequestDTO;
import com.Inventory.Inventory_Backend.reports.dto.SalesSummaryResponseDTO;

public interface SalesSummaryService {
    SalesSummaryResponseDTO getSalesSummary(Long businessId, SalesSummaryRequestDTO request);
}
