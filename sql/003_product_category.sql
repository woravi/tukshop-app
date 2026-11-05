-- MariaDB: additive and repeatable; existing products remain uncategorized.
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(255) NULL;
