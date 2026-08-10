ALTER TABLE item_units DROP CONSTRAINT IF EXISTS item_units_status_check;
ALTER TABLE item_units ADD CONSTRAINT item_units_status_check CHECK (status IN ('AVAILABLE', 'SOLD', 'VOID', 'DEFECTIVE', 'LOST', 'RESERVED', 'PENDING_RESTOCK'));
