package com.Inventory.Inventory_Backend.notification.service;

import com.Inventory.Inventory_Backend.notification.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {

    List<NotificationDTO> getNotifications(Long businessId);

    void generateStockAlerts(Long businessId);

    void generateEWayBillAlerts(Long businessId);

    void generatePaymentReminders(Long businessId);

    void generateQuotationAlerts(Long businessId);

    void resolveStockNotifications(Long businessId, Long itemId);

    void resolveSalesPaymentNotifications(Long businessId, Long invoiceId);

    void resolvePurchasePaymentNotifications(Long businessId, Long invoiceId);

    void resolveQuotationNotifications(Long businessId, Long quotationId);

    void onEWayBillStatusChanged(Long businessId, Long eWayBillId, String oldStatus, String newStatus);

    void onQuotationStatusChanged(Long businessId, Long quotationId, String oldStatus, String newStatus);

    void onStockLevelChanged(Long businessId, Long itemId, java.math.BigDecimal oldQuantity,
            java.math.BigDecimal newQuantity);

    void onSalesPaymentStatusChanged(Long businessId, Long invoiceId, String oldStatus, String newStatus);

    void onPurchasePaymentStatusChanged(Long businessId, Long invoiceId, String oldStatus, String newStatus);

    void markNotificationAsRead(Long notificationId, Long businessId);
}
