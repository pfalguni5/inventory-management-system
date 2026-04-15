package com.Inventory.Inventory_Backend.purchase.repository;

import com.Inventory.Inventory_Backend.purchase.entity.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, Long> {

        // ==========================================================
        // FIND ALL PURCHASES
        // ==========================================================
        List<PurchaseInvoice> findByBusinessIdAndIsDeletedFalseOrderByCreatedAtDesc(Long businessId);

        // ==========================================================
        // FIND BY ID
        // ==========================================================
        Optional<PurchaseInvoice> findByIdAndBusinessIdAndIsDeletedFalse(
                        Long id,
                        Long businessId);

        // ==========================================================
        // BILL NUMBER VALIDATION
        // ==========================================================
        boolean existsByBusinessIdAndBillNumberAndIsDeletedFalse(
                        Long businessId,
                        String billNumber);

        boolean existsByBusinessIdAndBillNumberAndIdNotAndIsDeletedFalse(
                        Long businessId,
                        String billNumber,
                        Long id);

        // ==========================================================
        // FILTER BY STATUS
        // ==========================================================
        List<PurchaseInvoice> findByBusinessIdAndStatusAndIsDeletedFalseOrderByCreatedAtDesc(
                        Long businessId,
                        String status);

        // ==========================================================
        // FILTER BY PARTY
        // ==========================================================
        List<PurchaseInvoice> findByBusinessIdAndPartyIdAndIsDeletedFalseOrderByCreatedAtDesc(
                        Long businessId,
                        Long partyId);

        // ==========================================================
        // FILTER BY PAYMENT TYPE (NEW - OPTIONAL)
        // ==========================================================
        List<PurchaseInvoice> findByBusinessIdAndPaymentTypeAndIsDeletedFalseOrderByCreatedAtDesc(
                        Long businessId,
                        String paymentType);

        // ==========================================================
        // FETCH INVOICE WITH ITEMS + PARTY
        // ==========================================================
        @Query("""
                         SELECT DISTINCT pi
                         FROM PurchaseInvoice pi
                         LEFT JOIN FETCH pi.items pii
                         LEFT JOIN FETCH pi.party
                         LEFT JOIN FETCH pii.item
                         WHERE pi.id = :id
                         AND pi.businessId = :businessId
                         AND pi.isDeleted = false
                        """)
        Optional<PurchaseInvoice> findByIdWithItemsAndParty(
                        @Param("id") Long id,
                        @Param("businessId") Long businessId);

        boolean existsByPartyIdAndBusinessIdAndIsDeletedFalse(
                        Long partyId,
                        Long businessId);

        // ==========================================================
        // PAYMENT REMINDER QUERIES
        // ==========================================================

        /**
         * Find overdue invoices (past due date with outstanding balance)
         */
        @Query("""
                        SELECT pi FROM PurchaseInvoice pi
                        WHERE pi.businessId = ?1
                        AND pi.isDeleted = false
                        AND pi.balance > 0
                        AND pi.status NOT IN ('paid', 'completed')
                        AND pi.dueDate < CURRENT_DATE
                        """)
        List<PurchaseInvoice> findOverdueInvoices(Long businessId);

        /**
         * Find invoices due soon (within next 7 days with outstanding balance)
         */
        @Query("""
                        SELECT pi FROM PurchaseInvoice pi
                        WHERE pi.businessId = ?1
                        AND pi.isDeleted = false
                        AND pi.balance > 0
                        AND pi.status NOT IN ('paid', 'completed')
                        AND pi.dueDate >= CURRENT_DATE
                        AND pi.dueDate <= ?2
                        """)
        List<PurchaseInvoice> findDueSoonInvoices(Long businessId, LocalDate sevenDaysLater);
}