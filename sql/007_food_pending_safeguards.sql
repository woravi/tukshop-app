-- Apply after 006, before starting the new food service. MariaDB 10.6+.
-- Repeatable and additive. Food is predeploy; preserve any existing local fixtures.
-- Default 1 on initial ADD identifies old orders whose stock was already reserved.
ALTER TABLE food_orders
  ADD COLUMN IF NOT EXISTS reservation_held BOOLEAN NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS pending_expires_at DATETIME(3) NULL,
  ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(32) NULL,
  ADD INDEX IF NOT EXISTS idx_food_phone_created (phone,created_at),
  ADD INDEX IF NOT EXISTS idx_food_pending_expiry (status,pending_expires_at);
ALTER TABLE food_orders ALTER COLUMN reservation_held SET DEFAULT 0;

-- created_at is a TIMESTAMP; read it in UTC when converting to DATETIME.
SET @food_previous_time_zone=@@session.time_zone;
SET time_zone='+00:00';
START TRANSACTION;
SELECT id FROM food_settings WHERE id=1 FOR UPDATE;
-- Convert legacy pending reservations to non-reserving requests exactly once.
UPDATE food_menu_items m JOIN (
  SELECT i.menu_id,SUM(i.quantity) AS quantity
  FROM food_order_items i JOIN food_orders o ON o.id=i.order_id
  WHERE o.status='pending' AND o.reservation_held=1
    AND o.reservation_released=0 AND i.source_type='resale'
  GROUP BY i.menu_id
) pending ON pending.menu_id=m.id SET m.stock=m.stock+pending.quantity;
UPDATE food_orders SET reservation_held=0
  WHERE reservation_held=1 AND (status='pending' OR reservation_released=1);
UPDATE food_orders SET pending_expires_at=DATE_ADD(created_at,INTERVAL 20 MINUTE)
  WHERE status='pending' AND pending_expires_at IS NULL;
UPDATE food_orders SET status='cancelled',cancellation_reason='expired'
  WHERE status='pending' AND pending_expires_at<=UTC_TIMESTAMP(3);
COMMIT;
SET time_zone=@food_previous_time_zone;
