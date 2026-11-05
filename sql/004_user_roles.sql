-- MariaDB 11 additive migration. Run before starting the role-aware app.
-- NULL distinguishes unmigrated legacy accounts from deliberately assigned roles.
-- No credentials or accounts are created; existing accounts are preserved.
ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('owner','manager','kitchen','customer') NULL DEFAULT NULL;
UPDATE users SET role = CASE WHEN admin = TRUE THEN 'owner' ELSE 'customer' END WHERE role IS NULL;
ALTER TABLE users MODIFY COLUMN role ENUM('owner','manager','kitchen','customer') NOT NULL DEFAULT 'customer';
-- Legacy UI compatibility only; role is the authorization source.
UPDATE users SET admin = (role IN ('owner','manager'));
