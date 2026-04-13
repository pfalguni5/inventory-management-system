package com.Inventory.Inventory_Backend.notification.controller;

import com.Inventory.Inventory_Backend.common.AuthUtil;
import com.Inventory.Inventory_Backend.notification.dto.NotificationDTO;
import com.Inventory.Inventory_Backend.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthUtil authUtil;

    // get all notifications for the current business
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(
            @RequestHeader("X-Business-Id") Long businessId) {

        // validate that user is authorized for this business
        authUtil.validateBusinessAccess(businessId);

        List<NotificationDTO> notifications = notificationService.getNotifications(businessId);
        return ResponseEntity.ok(notifications);

    }

    // Manual trigger to generate stock alerts
    @PostMapping("/trigger-stock-alerts")
    public ResponseEntity<String> triggerStockAlerts(
            @RequestHeader("X-Business-Id") Long businessId) {

        authUtil.validateBusinessAccess(businessId);
        notificationService.generateStockAlerts(businessId);
        return ResponseEntity.ok("Stock alerts generated");
    }
}
