package com.Inventory.Inventory_Backend.common;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthUtil {

    public static Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        if (principal instanceof Long) {
            return (Long) principal;
        }

        throw new RuntimeException("User not authenticated");
    }

    public void validateBusinessAccess(Long businessId) {
        // TODO: Implement business access validation
        // Check if the current user is authorized to access this business
    }
}
