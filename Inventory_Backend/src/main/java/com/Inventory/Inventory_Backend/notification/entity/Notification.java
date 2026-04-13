package com.Inventory.Inventory_Backend.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long businessId;

    @Column(nullable = false)
    private String type;
    // LOW_STOCK, EWAY_BILL_EXPIRING, EWAY_BILL_CANCELLED,
    // OVERDUE_INVOICE, PENDING_PAYMENT, PENDING_SALES_ORDER,
    // PENDING_PURCHASE_ORDER, PENDING_QUOTATION, EXPIRING_QUOTATION

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column
    private String icon; // warning, error, info, success

    @Column
    private String relatedId; // item ID, invoice ID, quotation ID, etc.

    @Column
    private String relatedType; // ITEM, INVOICE, QUOTATION, EWAY_BILL, ORDER

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();




}
