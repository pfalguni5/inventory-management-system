package com.Inventory.Inventory_Backend.stock.repository;

import com.Inventory.Inventory_Backend.stock.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    // =========================================================
    // FIND STOCK FOR ITEM IN BUSINESS
    // =========================================================
    Optional<Stock> findByBusinessIdAndItemId(Long businessId, Long itemId);

    // =========================================================
    // GET ALL STOCK FOR BUSINESS
    // =========================================================
    List<Stock> findByBusinessId(Long businessId);

    // =========================================================
    // GET LOW STOCK ITEMS
    // =========================================================
    @Query("""
                SELECT s
                FROM Stock s
                WHERE s.businessId = :businessId
                AND s.itemId IN (
                    SELECT i.id FROM Item i
                    WHERE i.lowStockAlert > 0
                    AND i.businessId = :businessId
                )
                AND s.quantity <= (
                    SELECT i.lowStockAlert FROM Item i
                    WHERE i.id = s.itemId
                )
            """)
    List<Stock> findLowStockByBusinessId(Long businessId);
}