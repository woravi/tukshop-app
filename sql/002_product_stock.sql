-- Safe on MariaDB 11 for both legacy and fresh schemas; preserves existing stock.
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT UNSIGNED NOT NULL DEFAULT 0;
