-- Repeatable after 001-005; existing records and settings are never replaced.
-- Food is independent of merchandise checkout.
-- All monetary amounts are integer satang; DATETIME values are UTC.
CREATE TABLE IF NOT EXISTS food_categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS food_menu_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  category_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  image_id BIGINT UNSIGNED NULL,
  price_satang BIGINT UNSIGNED NOT NULL,
  source_type ENUM('made_to_order','resale') NOT NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  daily_limit INT UNSIGNED NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  allergens TEXT NOT NULL,
  allergens_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_food_menu_active (deleted,category_id),
  CONSTRAINT fk_food_category FOREIGN KEY (category_id) REFERENCES food_categories(id),
  CONSTRAINT fk_food_image FOREIGN KEY (image_id) REFERENCES product_images(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS food_menu_options (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  menu_id BIGINT UNSIGNED NOT NULL,
  group_key VARCHAR(64) COLLATE utf8mb4_bin NOT NULL,
  definition JSON NOT NULL,
  position SMALLINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_food_option (menu_id,group_key),
  CONSTRAINT fk_food_option_menu FOREIGN KEY (menu_id) REFERENCES food_menu_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS food_settings (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  config JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_food_single_settings CHECK (id=1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT IGNORE INTO food_settings (id,config) VALUES (1,'{"timezone":"Asia/Bangkok","weekdays":[1,2,3,4,5],"order_accepting":false,"pickup_enabled":true,"delivery_enabled":true,"hours":{"1":{"open":"","close":"18:00"},"2":{"open":"","close":"18:00"},"3":{"open":"","close":"18:00"},"4":{"open":"","close":"18:00"},"5":{"open":"","close":"18:00"}},"pickup_address":"บ้าน ทุ่งประดู่","delivery_zones":[],"prep_minutes":20,"daily_capacity":0}');

CREATE TABLE IF NOT EXISTS food_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  client_request_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  request_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  tracking_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  method ENUM('pickup','delivery') NOT NULL,
  scheduled_at DATETIME(3) NOT NULL,
  service_date DATE NOT NULL,
  address TEXT NOT NULL,
  zone_id VARCHAR(64) NULL,
  notes TEXT NOT NULL,
  status ENUM('pending','accepted','rejected','preparing','ready','completed','cancelled') NOT NULL DEFAULT 'pending',
  payment_status ENUM('unpaid','paid') NOT NULL DEFAULT 'unpaid',
  subtotal_satang BIGINT UNSIGNED NOT NULL,
  delivery_satang BIGINT UNSIGNED NOT NULL,
  total_satang BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  reservation_released BOOLEAN NOT NULL DEFAULT FALSE,
  last_actor_id BIGINT UNSIGNED NULL,
  payment_confirmed_by BIGINT UNSIGNED NULL,
  payment_confirmed_at DATETIME(3) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_food_request (client_request_hash),
  UNIQUE KEY uq_food_tracking (tracking_hash),
  KEY idx_food_daily_capacity (service_date,reservation_released),
  KEY idx_food_kitchen (service_date,status,scheduled_at),
  CONSTRAINT fk_food_last_actor FOREIGN KEY (last_actor_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_food_payment_actor FOREIGN KEY (payment_confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_food_totals CHECK (total_satang=subtotal_satang+delivery_satang),
  CONSTRAINT chk_food_quantity CHECK (quantity BETWEEN 1 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS food_order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  menu_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_satang BIGINT UNSIGNED NOT NULL,
  source_type ENUM('made_to_order','resale') NOT NULL,
  options_json JSON NOT NULL,
  KEY idx_food_item_capacity (menu_id,order_id),
  CONSTRAINT fk_food_item_order FOREIGN KEY (order_id) REFERENCES food_orders(id),
  CONSTRAINT fk_food_item_menu FOREIGN KEY (menu_id) REFERENCES food_menu_items(id),
  CONSTRAINT chk_food_item_quantity CHECK (quantity BETWEEN 1 AND 50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
