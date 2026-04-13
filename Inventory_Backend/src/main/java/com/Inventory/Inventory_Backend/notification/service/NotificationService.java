package com.Inventory.Inventory_Backend.notification.service;

import com.Inventory.Inventory_Backend.notification.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {

    List<NotificationDTO> getNotifications(Long businessId);

    void generateStockAlerts(Long businessId);

    void generateEWayBillAlerts(Long businessId);

    void generatePaymentReminders(Long businessId);

    void generateOrderAlerts(Long businessId);

    void generateQuotationAlerts(Long businessId);

    void resolveStockNotifications(Long businessId, Long itemId);
}
