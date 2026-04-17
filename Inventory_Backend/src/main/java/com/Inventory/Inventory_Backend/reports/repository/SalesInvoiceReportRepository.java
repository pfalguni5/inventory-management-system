package com.Inventory.Inventory_Backend.reports.repository;

import com.Inventory.Inventory_Backend.reports.dto.SalesSummaryRowDTO;
import com.Inventory.Inventory_Backend.sales.entity.SalesInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalesInvoiceReportRepository extends JpaRepository<SalesInvoice, Long> {
    @Query("""
                SELECT new com.Inventory.Inventory_Backend.reports.dto.SalesSummaryRowDTO(
                    si.invoiceNumber,
                    si.invoiceDate,
                    p.name,
                    p.gstin,
                    si.totalDiscount,
                    (si.subtotal - si.totalDiscount),
                    (si.totalCgst + si.totalSgst + si.totalIgst),
                    si.grandTotal
                )
                FROM SalesInvoice si
                JOIN Party p ON si.partyId = p.id
                WHERE si.businessId = :businessId
                AND si.invoiceDate BETWEEN :fromDate AND :toDate
                AND si.isDeleted = false
                ORDER BY si.invoiceDate DESC
            """)
    List<SalesSummaryRowDTO> getSalesSummary(
            @Param("businessId") Long businessId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);
}
