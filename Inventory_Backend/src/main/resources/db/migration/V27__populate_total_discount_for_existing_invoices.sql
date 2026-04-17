-- Update total_discount for all purchase invoices based on their items
UPDATE purchase_invoices pi
SET total_discount = COALESCE((
    SELECT SUM(discount) FROM purchase_invoice_items pii 
    WHERE pii.purchase_invoice_id = pi.id 
    AND pii.is_deleted = false
), 0)
WHERE pi.is_deleted = false;