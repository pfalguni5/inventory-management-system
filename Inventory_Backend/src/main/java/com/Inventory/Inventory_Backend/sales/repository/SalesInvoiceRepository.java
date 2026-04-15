package com.Inventory.Inventory_Backend.sales.repository;

import com.Inventory.Inventory_Backend.sales.entity.SalesInvoice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Long> {

    /**
     * All active invoices for a business (with items eagerly loaded).
     */
    @EntityGraph(attributePaths = { "items" })
    List<SalesInvoice> findByBusinessIdAndIsDeletedFalseOrderByCreatedAtDesc(Long businessId);

    /**
     * Single active invoice with items.
     */
    @EntityGraph(attributePaths = { "items" })
    Optional<SalesInvoice> findByIdAndBusinessIdAndIsDeletedFalse(Long id, Long businessId);

    /**
     * Total invoice count for a business
     */
    long countByBusinessId(Long businessId);

    /**
     * Check if invoice number exists
     */
    boolean existsByBusinessIdAndInvoiceNumber(Long businessId, String invoiceNumber);

    /**
     * Latest invoice number
     */
    @Query("""
            SELECT s.invoiceNumber
            FROM SalesInvoice s
            WHERE s.businessId = :businessId
            ORDER BY s.createdAt DESC
            LIMIT 1
            """)
    Optional<String> findLatestInvoiceNumberByBusinessId(@Param("businessId") Long businessId);

    boolean existsByPartyIdAndBusinessIdAndIsDeletedFalse(Long partyId, Long businessId);

    // ==========================================================
    // PAYMENT REMINDER QUERIES
    // ==========================================================

    /**
     * Find overdue invoices (past due date with outstanding balance)
     */
    @Query("""
            SELECT s FROM SalesInvoice s
            WHERE s.businessId = ?1
            AND s.isDeleted = false
            AND s.balance > 0
            AND s.status NOT IN ('paid', 'completed')
            AND s.dueDate < CURRENT_DATE
            """)
    List<SalesInvoice> findOverdueInvoices(Long businessId);

    /**
     * Find invoices due soon (within next 7 days with outstanding balance)
     */
    @Query("""
            SELECT s FROM SalesInvoice s
            WHERE s.businessId = ?1
            AND s.isDeleted = false
            AND s.balance > 0
            AND s.status NOT IN ('paid', 'completed')
            AND s.dueDate >= CURRENT_DATE
            AND s.dueDate <= ?2
            """)
    List<SalesInvoice> findDueSoonInvoices(Long businessId, LocalDate sevenDaysLater);
}