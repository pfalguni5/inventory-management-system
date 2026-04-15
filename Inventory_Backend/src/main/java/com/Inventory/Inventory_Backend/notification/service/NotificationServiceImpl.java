package com.Inventory.Inventory_Backend.notification.service;

import com.Inventory.Inventory_Backend.item.repository.ItemRepository;
import com.Inventory.Inventory_Backend.notification.dto.NotificationDTO;
import com.Inventory.Inventory_Backend.notification.entity.Notification;
import com.Inventory.Inventory_Backend.notification.repository.NotificationRepository;
import com.Inventory.Inventory_Backend.stock.entity.Stock;
import com.Inventory.Inventory_Backend.stock.repository.StockRepository;
import com.Inventory.Inventory_Backend.ewaybill.entity.EWayBill;
import com.Inventory.Inventory_Backend.ewaybill.entity.EWayBillStatus;
import com.Inventory.Inventory_Backend.ewaybill.repository.EWayBillRepository;
import com.Inventory.Inventory_Backend.sales.entity.SalesInvoice;
import com.Inventory.Inventory_Backend.sales.repository.SalesInvoiceRepository;
import com.Inventory.Inventory_Backend.purchase.entity.PurchaseInvoice;
import com.Inventory.Inventory_Backend.purchase.repository.PurchaseInvoiceRepository;
import com.Inventory.Inventory_Backend.quotation.entity.Quotation;
import com.Inventory.Inventory_Backend.quotation.repository.QuotationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

    @Autowired
    private EWayBillRepository eWayBillRepository;

    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;

    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    @Autowired
    private QuotationRepository quotationRepository;

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
                // Only create notification if stock condition is NEW (no unread notification
                // exists)
                // This means: first time low stock = notify, persistent low stock = no reminder
                // Auto-resolves when stock recovers above minimum
                boolean unreadNotificationExists = notificationRepository.findAll()
                        .stream()
                        .anyMatch(n -> n.getBusinessId().equals(businessId) &&
                                n.getType().equals("LOW_STOCK") &&
                                n.getRelatedId().equals(stock.getItemId().toString()) &&
                                !n.getIsRead());

                // Only create a new notification if there's NO unread one (status change)
                if (!unreadNotificationExists) {
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

                    safelySaveNotification(notification);
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
            // Find E-Way Bills expiring in next 48 hours
            List<EWayBill> expiringBills = eWayBillRepository.findExpiringBills(businessId);

            for (EWayBill bill : expiringBills) {
                // Check if an UNREAD notification already exists for this bill
                // Only notify once when bill enters expiring state (status-change detection)
                boolean unreadNotificationExists = notificationRepository.findAll()
                        .stream()
                        .anyMatch(n -> n.getBusinessId().equals(businessId) &&
                                n.getType().equals("EWAY_BILL_EXPIRING") &&
                                n.getRelatedId().equals(bill.getId().toString()) &&
                                !n.getIsRead());

                if (!unreadNotificationExists) {
                    Notification notification = Notification.builder()
                            .businessId(businessId)
                            .type("EWAY_BILL_EXPIRING")
                            .title("E-Way Bill Expiring")
                            .message("E-Way Bill #" + bill.getEwayBillNumber() + " expires at " + bill.getValidUntil())
                            .icon("warning")
                            .relatedId(bill.getId().toString())
                            .relatedType("EWAY_BILL")
                            .isRead(false)
                            .build();

                    safelySaveNotification(notification);
                }
            }

            // Find cancelled E-Way Bills
            List<EWayBill> cancelledBills = eWayBillRepository.findByBusinessIdAndStatusAndIsActiveTrue(
                    businessId, EWayBillStatus.CANCELLED);

            for (EWayBill bill : cancelledBills) {
                // Check if an UNREAD notification already exists for this bill
                // Only notify once when bill enters cancelled state (status-change detection)
                boolean unreadNotificationExists = notificationRepository.findAll()
                        .stream()
                        .anyMatch(n -> n.getBusinessId().equals(businessId) &&
                                n.getType().equals("EWAY_BILL_CANCELLED") &&
                                n.getRelatedId().equals(bill.getId().toString()) &&
                                !n.getIsRead());

                if (!unreadNotificationExists) {
                    Notification notification = Notification.builder()
                            .businessId(businessId)
                            .type("EWAY_BILL_CANCELLED")
                            .title("E-Way Bill Cancelled")
                            .message("E-Way Bill #" + bill.getEwayBillNumber() + " has been cancelled")
                            .icon("error")
                            .relatedId(bill.getId().toString())
                            .relatedType("EWAY_BILL")
                            .isRead(false)
                            .build();

                    safelySaveNotification(notification);
                }
            }
        } catch (Exception e) {
            System.err.println("Error generating e-way bill alerts: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void generatePaymentReminders(Long businessId) {
        try {
            // =========================================================
            // OVERDUE SALES INVOICES (Customer owes us)
            // =========================================================
            List<SalesInvoice> overdueSalesInvoices = salesInvoiceRepository.findOverdueInvoices(businessId);

            for (SalesInvoice invoice : overdueSalesInvoices) {
                // Check if an UNREAD notification already exists for this invoice
                // Only notify once when invoice enters overdue state (status-change detection)
                boolean unreadNotificationExists = notificationRepository.findAll()
                        .stream()
                        .anyMatch(n -> n.getBusinessId().equals(businessId) &&
                                n.getType().equals("OVERDUE_SALES_PAYMENT") &&
                                n.getRelatedId().equals(invoice.getId().toString()) &&
                                !n.getIsRead());

                if (!unreadNotificationExists) {
                    // Calculate days overdue
                    long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(invoice.getDueDate(),
                            LocalDate.now());

                    Notification notification = Notification.builder()
                            .businessId(businessId)
                            .type("OVERDUE_SALES_PAYMENT")
                            .title("Overdue Payment - Customer")
                            .message("Invoice #" + invoice.getInvoiceNumber() + " is " + daysOverdue +
                                    " days overdue. Outstanding: ₹" + invoice.getBalance())
                            .icon("error")
                            .relatedId(invoice.getId().toString())
                            .relatedType("SALES_INVOICE")
                            .isRead(false)
                            .build();

                    safelySaveNotification(notification);
                }
            }

            // =========================================================
            // DUE SOON SALES INVOICES (Customer needs to pay soon)
            // =========================================================
            LocalDate sevenDaysLater = LocalDate.now().plusDays(7);
            List<SalesInvoice> dueSoonSalesInvoices = salesInvoiceRepository.findDueSoonInvoices(businessId,
                    sevenDaysLater);

            for (SalesInvoice invoice : dueSoonSalesInvoices) {
                // Check if an UNREAD notification already exists for this invoice
                // Only notify once when invoice approaches due date (status-change detection)
                boolean unreadNotificationExists = notificationRepository.findAll()
                        .stream()
                        .anyMatch(n -> n.getBusinessId().equals(businessId) &&
                                n.getType().equals("DUE_SOON_SALES_PAYMENT") &&
                                n.getRelatedId().equals(invoice.getId().toString()) &&
                                !n.getIsRead());

                if (!unreadNotificationExists) {
                    // Calculate days until due
                    long daysUntilDue = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(),
                            invoice.getDueDate());

                    Notification notification = Notification.builder()
                            .businessId(businessId)
                            .type("DUE_SOON_SALES_PAYMENT")
                            .title("Payment Due Soon - Customer")
                            .message("Invoice #" + invoice.getInvoiceNumber() + " is due in " + daysUntilDue +
                                    " days. Amount: ₹" + invoice.getBalance())
                            .icon("warning")
                            .relatedId(invoice.getId().toString())
                            .relatedType("SALES_INVOICE")
                            .isRead(false)
                            .build();

                    safelySaveNotification(notification);
                }
            }

            // =========================================================
            // OVERDUE PURCHASE INVOICES (We owe supplier)
            // =========================================================
            List<PurchaseInvoice> overduePurchaseInvoices = purchaseInvoiceRepository.findOverdueInvoices(businessId);

            for (PurchaseInvoice invoice : overduePurchaseInvoices) {
                // Check if an UNREAD notification already exists for this invoice
                // Only notify once when invoice enters overdue state (status-change detection)
                boolean unreadNotificationExists = notificationRepository.findAll()
                        .stream()
                        .anyMatch(n -> n.getBusinessId().equals(businessId) &&
                                n.getType().equals("OVERDUE_PURCHASE_PAYMENT") &&
                                n.getRelatedId().equals(invoice.getId().toString()) &&
                                !n.getIsRead());

                if (!unreadNotificationExists) {
                    // Calculate days overdue
                    long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(invoice.getDueDate(),
                            LocalDate.now());

                    Notification notification = Notification.builder()
                            .businessId(businessId)
                            .type("OVERDUE_PURCHASE_PAYMENT")
                            .title("Overdue Payment - Supplier")
                            .message("Bill #" + invoice.getBillNumber() + " is " + daysOverdue +
                                    " days overdue. Outstanding: ₹" + invoice.getBalance())
                            .icon("error")
                            .relatedId(invoice.getId().toString())
                            .relatedType("PURCHASE_INVOICE")
                            .isRead(false)
                            .build();

                    safelySaveNotification(notification);
                }
            }

            // =========================================================
            // DUE SOON PURCHASE INVOICES (We need to pay supplier soon)
            // =========================================================
            List<PurchaseInvoice> dueSoonPurchaseInvoices = purchaseInvoiceRepository.findDueSoonInvoices(businessId,
                    sevenDaysLater);

            for (PurchaseInvoice invoice : dueSoonPurchaseInvoices) {
                // Check if an UNREAD notification already exists for this invoice
                // Only notify once when invoice approaches due date (status-change detection)
                boolean unreadNotificationExists = notificationRepository.findAll()
                        .stream()
                        .anyMatch(n -> n.getBusinessId().equals(businessId) &&
                                n.getType().equals("DUE_SOON_PURCHASE_PAYMENT") &&
                                n.getRelatedId().equals(invoice.getId().toString()) &&
                                !n.getIsRead());

                if (!unreadNotificationExists) {
                    // Calculate days until due
                    long daysUntilDue = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(),
                            invoice.getDueDate());

                    Notification notification = Notification.builder()
                            .businessId(businessId)
                            .type("DUE_SOON_PURCHASE_PAYMENT")
                            .title("Payment Due Soon - Supplier")
                            .message("Bill #" + invoice.getBillNumber() + " is due in " + daysUntilDue +
                                    " days. Amount: ₹" + invoice.getBalance())
                            .icon("warning")
                            .relatedId(invoice.getId().toString())
                            .relatedType("PURCHASE_INVOICE")
                            .isRead(false)
                            .build();

                    safelySaveNotification(notification);
                }
            }
        } catch (Exception e) {
            System.err.println("Error generating payment reminders: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void generateQuotationAlerts(Long businessId) {
        try {
            // =========================================================
            // DRAFT QUOTATIONS (Waiting to be sent to customer)
            // =========================================================
            List<Quotation> draftQuotations = quotationRepository.findDraftQuotations(businessId);

            for (Quotation quotation : draftQuotations) {
                // Check if an UNREAD notification already exists for this quotation
                // Only notify once when quotation enters draft state (status-change detection)
                boolean unreadNotificationExists = notificationRepository.findAll()
                        .stream()
                        .anyMatch(n -> n.getBusinessId().equals(businessId) &&
                                n.getType().equals("DRAFT_QUOTATION") &&
                                n.getRelatedId().equals(quotation.getId().toString()) &&
                                !n.getIsRead());

                if (!unreadNotificationExists) {
                    Notification notification = Notification.builder()
                            .businessId(businessId)
                            .type("DRAFT_QUOTATION")
                            .title("Draft Quotation")
                            .message("Quotation #" + quotation.getQuotationNumber() +
                                    " is still in draft. Send to customer for approval.")
                            .icon("warning")
                            .relatedId(quotation.getId().toString())
                            .relatedType("QUOTATION")
                            .isRead(false)
                            .build();

                    safelySaveNotification(notification);
                }
            }

            // =========================================================
            // APPROVED BUT NOT CONVERTED QUOTATIONS (Customer approved, need invoice)
            // =========================================================
            List<Quotation> approvedNotConvertedQuotations = quotationRepository
                    .findApprovedNotConvertedQuotations(businessId);

            for (Quotation quotation : approvedNotConvertedQuotations) {
                // Check if an UNREAD notification already exists for this quotation
                // Only notify once when quotation is approved but not converted (status-change
                // detection)
                boolean unreadNotificationExists = notificationRepository.findAll()
                        .stream()
                        .anyMatch(n -> n.getBusinessId().equals(businessId) &&
                                n.getType().equals("PENDING_CONVERSION_QUOTATION") &&
                                n.getRelatedId().equals(quotation.getId().toString()) &&
                                !n.getIsRead());

                if (!unreadNotificationExists) {
                    Notification notification = Notification.builder()
                            .businessId(businessId)
                            .type("PENDING_CONVERSION_QUOTATION")
                            .title("Quotation Approved - Action Required")
                            .message("Quotation #" + quotation.getQuotationNumber() +
                                    " is approved. Convert to sales invoice immediately.")
                            .icon("error")
                            .relatedId(quotation.getId().toString())
                            .relatedType("QUOTATION")
                            .isRead(false)
                            .build();

                    safelySaveNotification(notification);
                }
            }

            // =========================================================
            // EXPIRING QUOTATIONS (Valid until date approaching)
            // =========================================================
            LocalDate fiveDaysLater = LocalDate.now().plusDays(5);
            List<Quotation> expiringQuotations = quotationRepository.findExpiringQuotations(businessId, fiveDaysLater);

            for (Quotation quotation : expiringQuotations) {
                // Check if an UNREAD notification already exists for this quotation
                // Only notify once when quotation approaches expiry (status-change detection)
                boolean unreadNotificationExists = notificationRepository.findAll()
                        .stream()
                        .anyMatch(n -> n.getBusinessId().equals(businessId) &&
                                n.getType().equals("EXPIRING_QUOTATION") &&
                                n.getRelatedId().equals(quotation.getId().toString()) &&
                                !n.getIsRead());

                if (!unreadNotificationExists) {
                    Notification notification = Notification.builder()
                            .businessId(businessId)
                            .type("EXPIRING_QUOTATION")
                            .title("Quotation Expiring Soon")
                            .message("Quotation #" + quotation.getQuotationNumber() +
                                    " expires on " + quotation.getValidUntil() + ". Action needed soon.")
                            .icon("warning")
                            .relatedId(quotation.getId().toString())
                            .relatedType("QUOTATION")
                            .isRead(false)
                            .build();

                    safelySaveNotification(notification);
                }
            }
        } catch (Exception e) {
            System.err.println("Error generating quotation alerts: " + e.getMessage());
            e.printStackTrace();
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

    @Override
    public void resolveSalesPaymentNotifications(Long businessId, Long invoiceId) {
        try {
            // Find all unread payment notification types for this sales invoice
            List<Notification> notifications = notificationRepository.findAll()
                    .stream()
                    .filter(n -> n.getBusinessId().equals(businessId) &&
                            n.getRelatedId().equals(invoiceId.toString()) &&
                            n.getRelatedType().equals("SALES_INVOICE") &&
                            (n.getType().equals("OVERDUE_SALES_PAYMENT") ||
                                    n.getType().equals("DUE_SOON_SALES_PAYMENT"))
                            &&
                            !n.getIsRead())
                    .collect(Collectors.toList());

            // Mark them as read
            for (Notification notification : notifications) {
                notification.setIsRead(true);
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            System.err.println("Error resolving sales payment notifications: " + e.getMessage());
        }
    }

    @Override
    public void resolvePurchasePaymentNotifications(Long businessId, Long invoiceId) {
        try {
            // Find all unread payment notification types for this purchase invoice
            List<Notification> notifications = notificationRepository.findAll()
                    .stream()
                    .filter(n -> n.getBusinessId().equals(businessId) &&
                            n.getRelatedId().equals(invoiceId.toString()) &&
                            n.getRelatedType().equals("PURCHASE_INVOICE") &&
                            (n.getType().equals("OVERDUE_PURCHASE_PAYMENT") ||
                                    n.getType().equals("DUE_SOON_PURCHASE_PAYMENT"))
                            &&
                            !n.getIsRead())
                    .collect(Collectors.toList());

            // Mark them as read
            for (Notification notification : notifications) {
                notification.setIsRead(true);
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            System.err.println("Error resolving purchase payment notifications: " + e.getMessage());
        }
    }

    @Override
    public void resolveQuotationNotifications(Long businessId, Long quotationId) {
        try {
            // Find all unread quotation notifications for this quotation
            List<Notification> notifications = notificationRepository.findAll()
                    .stream()
                    .filter(n -> n.getBusinessId().equals(businessId) &&
                            n.getRelatedId().equals(quotationId.toString()) &&
                            n.getRelatedType().equals("QUOTATION") &&
                            (n.getType().equals("DRAFT_QUOTATION") ||
                                    n.getType().equals("PENDING_CONVERSION_QUOTATION") ||
                                    n.getType().equals("EXPIRING_QUOTATION"))
                            &&
                            !n.getIsRead())
                    .collect(Collectors.toList());

            // Mark them as read
            for (Notification notification : notifications) {
                notification.setIsRead(true);
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            System.err.println("Error resolving quotation notifications: " + e.getMessage());
        }
    }

    @Override
    public void onEWayBillStatusChanged(Long businessId, Long eWayBillId, String oldStatus, String newStatus) {
        try {
            // Currently just a stub for event-driven notification handling
            // Can be extended to handle EWayBill status transitions in real-time
            // instead of waiting for hourly scheduled task
            System.out.println("E-Way Bill " + eWayBillId + " status changed from " + oldStatus + " to " + newStatus);
        } catch (Exception e) {
            System.err.println("Error handling ewaybill status change event: " + e.getMessage());
        }
    }

    @Override
    public void onQuotationStatusChanged(Long businessId, Long quotationId, String oldStatus, String newStatus) {
        try {
            // No change = no notification
            if (oldStatus.equals(newStatus)) {
                return;
            }

            // PART 1: If status changed FROM DRAFT to APPROVED or CONVERTED
            // → Resolve the draft notification
            if (oldStatus.equals("DRAFT") &&
                    (newStatus.equals("APPROVED") || newStatus.equals("CONVERTED"))) {

                List<Notification> draftNotifs = notificationRepository.findAll()
                        .stream()
                        .filter(n -> n.getBusinessId().equals(businessId) &&
                                n.getType().equals("DRAFT_QUOTATION") &&
                                n.getRelatedId().equals(quotationId.toString()) &&
                                !n.getIsRead())
                        .collect(Collectors.toList());

                for (Notification n : draftNotifs) {
                    n.setIsRead(true);
                    notificationRepository.save(n);
                }
            }

            // PART 2: If status changed TO APPROVED
            // → Create "Approved - Action Required" notification
            if (newStatus.equals("APPROVED")) {
                Notification notification = Notification.builder()
                        .businessId(businessId)
                        .type("PENDING_CONVERSION_QUOTATION")
                        .title("Quotation Approved - Action Required")
                        .message("Quotation #" + quotationId + " is approved. Convert to sales invoice immediately.")
                        .icon("error")
                        .relatedId(quotationId.toString())
                        .relatedType("QUOTATION")
                        .isRead(false)
                        .build();

                safelySaveNotification(notification);
            }

            // PART 3: If status changed TO CONVERTED
            // → Resolve all quotation notifications (pending conversion, expiring, etc)
            if (newStatus.equals("CONVERTED")) {
                resolveQuotationNotifications(businessId, quotationId);
            }

        } catch (Exception e) {
            System.err.println("Error in onQuotationStatusChanged: " + e.getMessage());
        }
    }

    @Override
    public void onStockLevelChanged(Long businessId, Long itemId, java.math.BigDecimal oldQuantity,
            java.math.BigDecimal newQuantity) {
        try {
            // Get item details
            var item = itemRepository.findById(itemId).orElse(null);
            if (item == null) {
                return;
            }

            // Get item's minimum stock level
            java.math.BigDecimal minStock = java.math.BigDecimal.valueOf(item.getLowStockAlert());

            // Scenario 1: Stock drops BELOW minimum (NORMAL → LOW)
            if (oldQuantity.compareTo(minStock) >= 0 && newQuantity.compareTo(minStock) < 0) {
                // Status change: Was NORMAL → Now LOW
                // Create notification
                Notification notification = Notification.builder()
                        .businessId(businessId)
                        .type("LOW_STOCK")
                        .title("Low Stock Alert")
                        .message(item.getName() + " stock dropped to " + newQuantity + ". Minimum: " + minStock)
                        .icon("warning")
                        .relatedId(itemId.toString())
                        .relatedType("ITEM")
                        .isRead(false)
                        .build();

                safelySaveNotification(notification);
            }

            // Scenario 2: Stock recovers ABOVE minimum (LOW → NORMAL)
            else if (oldQuantity.compareTo(minStock) < 0 && newQuantity.compareTo(minStock) >= 0) {
                // Status change: Was LOW → Now NORMAL
                // Resolve notification (mark as read)
                resolveStockNotifications(businessId, itemId);
            }

        } catch (Exception e) {
            System.err.println("Error in onStockLevelChanged: " + e.getMessage());
        }
    }

    @Override
    public void onSalesPaymentStatusChanged(Long businessId, Long invoiceId, String oldStatus, String newStatus) {
        try {
            // No change = no notification
            if (oldStatus.equals(newStatus)) {
                return;
            }

            // Scenario 1: Changed TO OVERDUE
            if (newStatus.equals("OVERDUE")) {
                Notification notification = Notification.builder()
                        .businessId(businessId)
                        .type("OVERDUE_SALES_PAYMENT")
                        .title("Overdue Payment - Customer")
                        .message("Customer payment is now overdue")
                        .icon("error")
                        .relatedId(invoiceId.toString())
                        .relatedType("SALES_INVOICE")
                        .isRead(false)
                        .build();

                safelySaveNotification(notification);
            }

            // Scenario 2: Changed TO DUE_SOON
            else if (newStatus.equals("DUE_SOON")) {
                Notification notification = Notification.builder()
                        .businessId(businessId)
                        .type("DUE_SOON_SALES_PAYMENT")
                        .title("Payment Due Soon - Customer")
                        .message("Customer payment due within 7 days")
                        .icon("warning")
                        .relatedId(invoiceId.toString())
                        .relatedType("SALES_INVOICE")
                        .isRead(false)
                        .build();

                safelySaveNotification(notification);
            }

            // Scenario 3: Changed TO PAID (resolved)
            else if (newStatus.equals("PAID")) {
                resolveSalesPaymentNotifications(businessId, invoiceId);
            }

        } catch (Exception e) {
            System.err.println("Error in onSalesPaymentStatusChanged: " + e.getMessage());
        }
    }

    @Override
    public void onPurchasePaymentStatusChanged(Long businessId, Long invoiceId, String oldStatus, String newStatus) {
        try {
            // No change = no notification
            if (oldStatus.equals(newStatus)) {
                return;
            }

            // Scenario 1: Changed TO OVERDUE
            if (newStatus.equals("OVERDUE")) {
                Notification notification = Notification.builder()
                        .businessId(businessId)
                        .type("OVERDUE_PURCHASE_PAYMENT")
                        .title("Overdue Payment - Supplier")
                        .message("Supplier payment is now overdue")
                        .icon("error")
                        .relatedId(invoiceId.toString())
                        .relatedType("PURCHASE_INVOICE")
                        .isRead(false)
                        .build();

                safelySaveNotification(notification);
            }

            // Scenario 2: Changed TO DUE_SOON
            else if (newStatus.equals("DUE_SOON")) {
                Notification notification = Notification.builder()
                        .businessId(businessId)
                        .type("DUE_SOON_PURCHASE_PAYMENT")
                        .title("Payment Due Soon - Supplier")
                        .message("Supplier payment due within 7 days")
                        .icon("warning")
                        .relatedId(invoiceId.toString())
                        .relatedType("PURCHASE_INVOICE")
                        .isRead(false)
                        .build();

                safelySaveNotification(notification);
            }

            // Scenario 3: Changed TO PAID (resolved)
            else if (newStatus.equals("PAID")) {
                resolvePurchasePaymentNotifications(businessId, invoiceId);
            }

        } catch (Exception e) {
            System.err.println("Error in onPurchasePaymentStatusChanged: " + e.getMessage());
        }
    }

    // =========================================================
    // SCHEDULED TASK: Generate alerts every hour
    // =========================================================
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void scheduledAlertGeneration() {
        try {
            System.out.println("Running scheduled alert generation...");

            // Get all unique business IDs
            List<Long> allBusinessIds = notificationRepository.findAll()
                    .stream()
                    .map(Notification::getBusinessId)
                    .distinct()
                    .collect(Collectors.toList());

            // If no notifications exist yet, get businesses from stock
            if (allBusinessIds.isEmpty()) {
                allBusinessIds = stockRepository.findAll()
                        .stream()
                        .map(Stock::getBusinessId)
                        .distinct()
                        .collect(Collectors.toList());
            }

            // Generate all types of alerts for each business
            for (Long businessId : allBusinessIds) {
                try {
                    generateStockAlerts(businessId);
                    generateEWayBillAlerts(businessId);
                    generatePaymentReminders(businessId);
                    generateQuotationAlerts(businessId);
                } catch (Exception e) {
                    System.err.println("Error in scheduled alert generation for business " + businessId + ": "
                            + e.getMessage());
                }
            }

            System.out.println("Scheduled alert generation completed.");
        } catch (Exception e) {
            System.err.println("Error in scheduled alert generation: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void markNotificationAsRead(Long notificationId, Long businessId) {
        try {
            var notification = notificationRepository.findById(notificationId).orElse(null);

            if (notification == null) {
                throw new RuntimeException("Notification not found: " + notificationId);
            }

            // Verify notification belongs to this business
            if (!notification.getBusinessId().equals(businessId)) {
                throw new RuntimeException("Unauthorized access to notification");
            }

            notification.setIsRead(true);
            notificationRepository.save(notification);

            System.out.println("Notification " + notificationId + " marked as read");
        } catch (Exception e) {
            System.err.println("Error marking notification as read: " + e.getMessage());
            throw new RuntimeException("Failed to mark notification as read: " + e.getMessage());
        }
    }

    /**
     * Safely save a notification, silently ignoring duplicate constraint
     * violations.
     * This prevents duplicate notifications from being created even in race
     * conditions.
     * 
     * @param notification The notification to save
     * @return true if saved successfully, false if duplicate was detected and
     *         ignored
     */
    private boolean safelySaveNotification(Notification notification) {
        try {
            notificationRepository.save(notification);
            return true;
        } catch (DataIntegrityViolationException e) {
            // Unique constraint violation - duplicate notification exists
            // This is expected and safe to ignore
            System.out.println("Duplicate notification prevented for type=" + notification.getType() +
                    ", relatedId=" + notification.getRelatedId());
            return false;
        } catch (Exception e) {
            System.err.println("Error saving notification: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
