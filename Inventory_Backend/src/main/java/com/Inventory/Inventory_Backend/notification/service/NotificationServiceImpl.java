package com.Inventory.Inventory_Backend.notification.service;

import com.Inventory.Inventory_Backend.item.repository.ItemRepository;
import com.Inventory.Inventory_Backend.notification.dto.NotificationDTO;
import com.Inventory.Inventory_Backend.notification.entity.Notification;
import com.Inventory.Inventory_Backend.notification.repository.NotificationRepository;
import com.Inventory.Inventory_Backend.stock.entity.Stock;
import com.Inventory.Inventory_Backend.stock.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Override
    public List<NotificationDTO> getNotifications(Long businessId) {
        // Only fetch UNREAD notifications, ignore read ones
        List<Notification> notifications = notificationRepository.findUnreadByBusinessId(businessId);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void generateStockAlerts(Long businessId) {
        try {
            // Get all items with stock below minimum level for this business
            List<Stock> lowStockItems = stockRepository.findLowStockByBusinessId(businessId);

            for (Stock stock : lowStockItems) {
                // Check if an UNREAD notification already exists for this item
                List<Notification> unreadNotifications = notificationRepository.findAll()
                        .stream()
                        .filter(n -> n.getBusinessId().equals(businessId) &&
                                n.getType().equals("LOW_STOCK") &&
                                n.getRelatedId().equals(stock.getItemId().toString()) &&
                                !n.getIsRead())
                        .collect(Collectors.toList());

                // Only create a new notification if there's no unread one
                if (unreadNotifications.isEmpty()) {
                    String itemName = itemRepository.findById(stock.getItemId())
                            .map(item -> item.getName())
                            .orElse("Item #" + stock.getItemId());

                    Notification notification = Notification.builder()
                            .businessId(businessId)
                            .type("LOW_STOCK")
                            .title("Low Stock Alert")
                            .message(itemName + " is below minimum level. Current: " + stock.getQuantity())
                            .icon("warning")
                            .relatedId(stock.getItemId().toString())
                            .relatedType("ITEM")
                            .isRead(false)
                            .build();

                    notificationRepository.save(notification);
                }
            }
        } catch (Exception e) {
            System.err.println("Error generating stock alerts: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void generateEWayBillAlerts(Long businessId) {
        try {
            // TODO: Implement E-Way Bill alerts
            // 1. Find E-Way bills expiring in next 48 hours
            // 2. Find cancelled E-Way bills
            // Add notifications for each
        } catch (Exception e) {
            System.err.println("Error generating e-way bill alerts: " + e.getMessage());
        }
    }

    @Override
    public void generatePaymentReminders(Long businessId) {
        try {
            // TODO: Implement payment reminders
            // 1. Find overdue invoices (due date < today)
            // 2. Find invoices due in next 7 days
            // Add notifications for each
        } catch (Exception e) {
            System.err.println("Error generating payment reminders: " + e.getMessage());
        }
    }

    @Override
    public void generateOrderAlerts(Long businessId) {
        try {
            // TODO: Implement order alerts
            // 1. Find pending sales orders (status = PENDING)
            // 2. Find pending purchase orders (status = PENDING)
            // Add notifications for each
        } catch (Exception e) {
            System.err.println("Error generating order alerts: " + e.getMessage());
        }
    }

    @Override
    public void generateQuotationAlerts(Long businessId) {
        try {
            // TODO: Implement quotation alerts
            // 1. Find pending quotations (status = DRAFT/PENDING)
            // 2. Find quotations expiring in next 7 days
            // Add notifications for each
        } catch (Exception e) {
            System.err.println("Error generating quotation alerts: " + e.getMessage());
        }
    }

    private NotificationDTO convertToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .icon(notification.getIcon())
                .relatedId(notification.getRelatedId())
                .relatedType(notification.getRelatedType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    @Override
    public void resolveStockNotifications(Long businessId, Long itemId) {
        try {
            // Get the item and check if stock is now above minimum level
            var item = itemRepository.findById(itemId).orElse(null);
            var stock = stockRepository.findByBusinessIdAndItemId(businessId, itemId).orElse(null);

            if (item == null || stock == null) {
                return;
            }

            // If current stock is above OR EQUAL to minimum level, mark notifications as
            // resolved
            if (stock.getQuantity() != null && item.getLowStockAlert() != null &&
                    stock.getQuantity().compareTo(java.math.BigDecimal.valueOf(item.getLowStockAlert())) >= 0) {

                // Find all unread LOW_STOCK notifications for this item
                List<Notification> notifications = notificationRepository.findAll()
                        .stream()
                        .filter(n -> n.getBusinessId().equals(businessId) &&
                                n.getType().equals("LOW_STOCK") &&
                                n.getRelatedId().equals(itemId.toString()) &&
                                !n.getIsRead())
                        .collect(Collectors.toList());

                // Mark them as read
                for (Notification notification : notifications) {
                    notification.setIsRead(true);
                    notificationRepository.save(notification);
                }
            }
        } catch (Exception e) {
            System.err.println("Error resolving stock notifications: " + e.getMessage());
        }
    }

    // =========================================================
    // SCHEDULED TASK: Generate stock alerts every hour
    // =========================================================
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void scheduledStockAlertGeneration() {
        try {
            System.out.println("Running scheduled stock alert generation...");

            // Get all unique business IDs with low stock items
            List<Stock> allLowStockItems = stockRepository.findAll()
                    .stream()
                    .filter(stock -> {
                        try {
                            var item = itemRepository.findById(stock.getItemId()).orElse(null);
                            return item != null &&
                                    item.getLowStockAlert() != null &&
                                    item.getLowStockAlert() > 0 &&
                                    stock.getQuantity() != null &&
                                    stock.getQuantity()
                                            .compareTo(java.math.BigDecimal.valueOf(item.getLowStockAlert())) <= 0;
                        } catch (Exception e) {
                            return false;
                        }
                    })
                    .collect(Collectors.toList());

            // Group by business ID and generate alerts
            allLowStockItems.stream()
                    .map(Stock::getBusinessId)
                    .distinct()
                    .forEach(businessId -> {
                        try {
                            generateStockAlerts(businessId);
                        } catch (Exception e) {
                            System.err.println("Error in scheduled alert generation for business " + businessId + ": "
                                    + e.getMessage());
                        }
                    });

            System.out.println("Scheduled stock alert generation completed.");
        } catch (Exception e) {
            System.err.println("Error in scheduled stock alert generation: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
