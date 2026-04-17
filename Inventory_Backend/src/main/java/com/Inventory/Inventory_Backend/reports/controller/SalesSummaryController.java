package com.Inventory.Inventory_Backend.reports.controller;

import com.Inventory.Inventory_Backend.common.BusinessContext;
import com.Inventory.Inventory_Backend.reports.dto.SalesSummaryRequestDTO;
import com.Inventory.Inventory_Backend.reports.dto.SalesSummaryResponseDTO;
import com.Inventory.Inventory_Backend.reports.service.SalesSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalesSummaryController {
    private final SalesSummaryService service;
    private final BusinessContext businessContext;

    @PostMapping("/sales-summary")
    public ResponseEntity<SalesSummaryResponseDTO> getSalesSummary(
            @RequestBody SalesSummaryRequestDTO request) {
        // Get businessId from context (automatically set by BusinessFilter from
        // X-Business-Id header)
        Long businessId = businessContext.getBusinessId();

        // Validate businessId is present
        if (businessId == null) {
            throw new RuntimeException("Business ID is missing in request");
        }

        // Call service with businessId
        SalesSummaryResponseDTO response = service.getSalesSummary(businessId, request);

        return ResponseEntity.ok(response);
    }
}
