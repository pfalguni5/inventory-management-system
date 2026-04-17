-- Populate total_discount for all existing purchase invoices based on their items
UPDATE purchase_invoices pi
SET total_discount = COALESCE((
    SELECT SUM(pii.discount) 
    FROM purchase_invoice_items pii 
    WHERE pii.purchase_invoice_id = pi.id 
), 0)
WHERE pi.is_deleted = false;