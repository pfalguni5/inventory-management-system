package com.Inventory.Inventory_Backend.reports.service;

import com.Inventory.Inventory_Backend.reports.dto.PurchaseSummaryRequestDTO;
import com.Inventory.Inventory_Backend.reports.dto.PurchaseSummaryResponseDTO;

public interface PurchaseSummaryService {
    PurchaseSummaryResponseDTO getPurchaseSummary(Long businessId, PurchaseSummaryRequestDTO request);
}
