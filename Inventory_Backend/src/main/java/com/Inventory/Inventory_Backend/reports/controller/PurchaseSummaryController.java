package com.Inventory.Inventory_Backend.reports.controller;

import com.Inventory.Inventory_Backend.common.BusinessContext;
import com.Inventory.Inventory_Backend.reports.dto.PurchaseSummaryRequestDTO;
import com.Inventory.Inventory_Backend.reports.dto.PurchaseSummaryResponseDTO;
import com.Inventory.Inventory_Backend.reports.service.PurchaseSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PurchaseSummaryController {
    private final PurchaseSummaryService service;
    private final BusinessContext businessContext;

    @PostMapping("/purchase-summary")
    public ResponseEntity<PurchaseSummaryResponseDTO> getPurchaseSummary(
            @RequestBody PurchaseSummaryRequestDTO request) {
        // Get businessId from context (automatically set by BusinessFilter from
        // X-Business-Id header)
        Long businessId = businessContext.getBusinessId();

        // Validate businessId is present
        if (businessId == null) {
            throw new RuntimeException("Business ID is missing in request");
        }

        // Call service with businessId
        PurchaseSummaryResponseDTO response = service.getPurchaseSummary(businessId, request);

        return ResponseEntity.ok(response);
    }
}
