package com.Inventory.Inventory_Backend.reports.repository;

import com.Inventory.Inventory_Backend.reports.dto.PurchaseSummaryRowDTO;
import com.Inventory.Inventory_Backend.purchase.entity.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PurchaseInvoiceReportRepository extends JpaRepository<PurchaseInvoice, Long> {
    @Query("""
                SELECT new com.Inventory.Inventory_Backend.reports.dto.PurchaseSummaryRowDTO(
                    pi.billNumber,
                    pi.billDate,
                    p.name,
                    p.gstin,
                    pi.totalDiscount,
                    pi.subtotal,
                    pi.totalTax,
                    pi.grandTotal
                )
                FROM PurchaseInvoice pi
                JOIN Party p ON pi.partyId = p.id
                WHERE pi.businessId = :businessId
                AND pi.billDate BETWEEN :fromDate AND :toDate
                AND pi.isDeleted = false
                ORDER BY pi.billDate DESC
            """)
    List<PurchaseSummaryRowDTO> getPurchaseSummary(
            @Param("businessId") Long businessId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);
}
