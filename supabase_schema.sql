-- idempotency key for offline sync deduplication
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key UUID UNIQUE;
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON orders(idempotency_key);

-- ensure updated_at column exists for conflict resolution
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger to call the function on every update
DROP TRIGGER IF EXISTS tr_update_order_updated_at ON orders;
CREATE TRIGGER tr_update_order_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_order_updated_at();
