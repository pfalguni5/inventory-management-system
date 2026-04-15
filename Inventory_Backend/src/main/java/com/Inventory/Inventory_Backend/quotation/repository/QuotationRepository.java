package com.Inventory.Inventory_Backend.quotation.repository;

import com.Inventory.Inventory_Backend.quotation.entity.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    List<Quotation> findByBusinessIdAndIsDeletedFalse(Long businessId);

    Optional<Quotation> findByIdAndBusinessIdAndIsDeletedFalse(Long id, Long businessId);

    // Find draft quotations
    @Query("SELECT q FROM Quotation q WHERE q.businessId = ?1 AND q.status = 'DRAFT' AND q.isDeleted = false")
    List<Quotation> findDraftQuotations(Long businessId);

    // Find approved quotations (status = APPROVED and NOT yet converted to invoice)
    @Query("SELECT q FROM Quotation q WHERE q.businessId = ?1 AND q.status = 'APPROVED' AND q.convertedToInvoiceId IS NULL AND q.isDeleted = false")
    List<Quotation> findApprovedNotConvertedQuotations(Long businessId);

    // Find quotations expiring soon (within 5 days, for DRAFT or APPROVED status
    // only)
    @Query("SELECT q FROM Quotation q WHERE q.businessId = ?1 AND q.validUntil BETWEEN CURRENT_DATE AND ?2 AND q.status IN ('DRAFT', 'APPROVED') AND q.isDeleted = false")
    List<Quotation> findExpiringQuotations(Long businessId, LocalDate expiryThreshold);

}