package com.Inventory.Inventory_Backend.notification.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String icon;
    private String relatedId;
    private String relatedType;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
