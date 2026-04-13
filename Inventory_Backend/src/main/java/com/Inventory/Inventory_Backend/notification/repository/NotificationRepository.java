package com.Inventory.Inventory_Backend.notification.repository;

import com.Inventory.Inventory_Backend.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get unread notifications for a business (limit to recent ones)
    @Query("SELECT n FROM Notification n WHERE n.businessId = ?1 AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByBusinessId(Long businessId);

    // Get all notifications for a business
    @Query("SELECT n FROM Notification n WHERE n.businessId = ?1 ORDER BY n.createdAt DESC")
    List<Notification> findRecentByBusinessId(Long businessId);

    // Find notifications by business, type, related ID and created after timestamp
    // (for deduplication)
    @Query("""
                SELECT n FROM Notification n
                WHERE n.businessId = ?1
                AND n.type = ?2
                AND n.relatedId = ?3
                AND n.createdAt > ?4
            """)
    List<Notification> findByBusinessIdAndTypeAndRelatedIdAndCreatedAtAfter(
            Long businessId,
            String type,
            String relatedId,
            LocalDateTime createdAfter);
}
