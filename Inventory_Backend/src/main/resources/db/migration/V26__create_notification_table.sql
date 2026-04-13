CREATE TABLE notificationS(
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT NOT NULL,
    type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    icon VARCHAR(255),
    related_id VARCHAR(255),
    related_type VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_business_unread ON notifications(business_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);