-- MariaDB additive/repeatable migration. Run before deploying management APIs.
-- No existing merchandise, image, stock, or order is removed or reseeded.
CREATE TABLE IF NOT EXISTS product_categories (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(255) NOT NULL UNIQUE,
 parent_id BIGINT UNSIGNED NULL,
 sort_order INT UNSIGNED NOT NULL DEFAULT 0,
 active BOOLEAN NOT NULL DEFAULT TRUE,
 version INT UNSIGNED NOT NULL DEFAULT 1,
 CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES product_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS product_category_aliases (
 name VARCHAR(255) NOT NULL PRIMARY KEY,
 category_id BIGINT UNSIGNED NOT NULL,
 CONSTRAINT fk_category_alias FOREIGN KEY (category_id) REFERENCES product_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id BIGINT UNSIGNED NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
-- Seed only missing names; edits and sort order survive rerunning the migration.
INSERT IGNORE INTO product_categories (name,sort_order)
 SELECT seed.name,seed.position FROM (
 SELECT 'กระเป๋าถือ' name,0 position UNION ALL SELECT 'กระเป๋าสะพายข้าง',1
 UNION ALL SELECT 'กระเป๋าสะพายไหล่',2 UNION ALL SELECT 'กระเป๋าโท้ท',3
 UNION ALL SELECT 'กระเป๋าเป้',4 UNION ALL SELECT 'กระเป๋าเดินทาง',5
 UNION ALL SELECT 'กระเป๋าอื่นๆ',6
 ) seed WHERE NOT EXISTS (SELECT 1 FROM product_category_aliases a WHERE a.name=seed.name);
-- Also preserve and register any categories entered before this migration.
INSERT IGNORE INTO product_categories (name)
 SELECT DISTINCT p.category FROM products p WHERE p.category IS NOT NULL AND TRIM(p.category)<>''
 AND NOT EXISTS (SELECT 1 FROM product_category_aliases a WHERE a.name=p.category);
UPDATE products p JOIN product_categories c ON c.name=p.category SET p.category_id=c.id WHERE p.category_id IS NULL;
UPDATE products p JOIN product_category_aliases a ON a.name=p.category JOIN product_categories c ON c.id=a.category_id
 SET p.category_id=c.id,p.category=c.name WHERE p.category_id IS NULL;
-- A one-time data backfill, deliberately guarded by BOTH known IDs and demo marker.
-- The ledger ensures a later explicit admin demo/un-demo edit survives reruns.
CREATE TABLE IF NOT EXISTS product_management_migrations (name VARCHAR(100) PRIMARY KEY) ENGINE=InnoDB;
UPDATE products SET is_demo=TRUE
 WHERE id IN (6,7,8,9,10,11) AND (name LIKE '%DEMO%' OR name LIKE '%ตัวอย่าง%' OR name LIKE '%สาธิต%')
 AND NOT EXISTS (SELECT 1 FROM product_management_migrations WHERE name='005_demo_backfill');
INSERT IGNORE INTO product_management_migrations (name) VALUES ('005_demo_backfill');
CREATE TABLE IF NOT EXISTS product_variants (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 product_id BIGINT UNSIGNED NOT NULL,
 sku VARCHAR(100) NOT NULL,
 UNIQUE KEY uq_variants_sku (sku),
 color VARCHAR(80) NOT NULL,
 size VARCHAR(80) NOT NULL,
 price DECIMAL(12,2) NOT NULL,
 stock INT UNSIGNED NOT NULL DEFAULT 0,
 version INT UNSIGNED NOT NULL DEFAULT 1,
 active BOOLEAN NOT NULL DEFAULT TRUE,
 KEY idx_variants_product (product_id,active),
 CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
 CONSTRAINT chk_variant_price CHECK (price >= 0),
 CONSTRAINT chk_variant_stock CHECK (stock >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS inventory_changes (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 product_id BIGINT UNSIGNED NOT NULL,
 variant_id BIGINT UNSIGNED NULL,
 actor_id BIGINT UNSIGNED NOT NULL,
 old_stock INT UNSIGNED NOT NULL,
 new_stock INT UNSIGNED NOT NULL,
 reason VARCHAR(255) NOT NULL,
 createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 KEY idx_inventory_product (product_id,createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
