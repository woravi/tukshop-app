# TukShop — ecomWatch migration (test deployment)

## MariaDB backend

The backend uses a `mysql2/promise` pool and requires `DB_NAME`, `DB_USER`, and `DB_PASSWORD`; missing values fail closed when a database route is called. `DB_HOST` defaults to **127.0.0.1** for Hostinger Node.js (not `localhost`, which may resolve to IPv6 `::1`). `DB_PORT` defaults to 3306. Hostinger's empty TukShop database runs MariaDB 11.8.9 and the seven tables in `sql/001_initial.sql` were applied through phpMyAdmin on November 4, 2026 (all tables showed zero rows). All secrets belong in Hostinger's environment settings, never Git. **This schema does not copy old MongoDB data.** The previous TukShop demo had no production records to migrate.

Admin upload `POST /api/images` accepts multipart `file` (or `image`) only after an authenticated admin session. It rejects >8 MiB, unsupported/forged MIME and >20 megapixels, normalizes orientation, bounds size to 1600×1600, encodes WebP and stores bytes in `product_images.data`. It returns `{id,url}`; `GET /api/images/[id]` serves the stored binary. Product create/update accepts only `/api/images/<numeric-id>` and associates those rows transactionally, deleting removed images; deleting a product cascades to its images. Orphaned uploads (never attached to a product) should be purged periodically, e.g. `DELETE FROM product_images WHERE product_id IS NULL AND createdAt < NOW() - INTERVAL 1 DAY;` in a controlled maintenance job. Ensure backups include the database BLOBs and `max_allowed_packet` exceeds 8 MiB.

The current local check passed 54 tests and a webpack build with Node 22.23.4. Production dependencies had no high or critical `npm audit` advisories (three moderate). This does **not** verify Hostinger's Node runtime or the app's DB connection. The unit/contract tests use fake SQL executors; they are **not** a substitute for disposable-database integration tests of uploads and session flows. With placeholder auth settings, the local production server returned 200 for `/`, 401 for anonymous image upload, 503 for both checkout and payment webhook, and 500 for a DB-backed request without database credentials. `CHECKOUT_ENABLED` is false by default and must remain false until currency, stock and webhook-idempotency are reviewed. Deploying the storefront for testing does not authorize taking real orders.

The code in this directory is the complete ecomWatch storefront and API, replacing the previous sample TukShop implementation. The old project (including all uncommitted work, sample JSON, uploads, Git metadata, and local OAuth secrets) is intact at:

`/Volumes/WD7100_NVME/App woravit/tukshop-app-original-before-ecomwatch-20261104`

An additional source snapshot, excluding generated dependencies/build output, is at:

`/Volumes/WD7100_NVME/App woravit/tukshop-app-backup-before-ecomwatch-20261104`

The old `.env.local` was **not** transferred to the new source. Git remains connected to the existing TukShop repository. The replacement work is on `migration/ecomwatch`; Hostinger auto-deploys `master` to `tukshop.ratchavit.com`, so pushing `master` is a public test deployment, not a private preview. No payment-provider actions were made.

## Local verification

- `npm ci` works with the updated lockfile; Node 22 build works using `npm run build` (webpack, because Turbopack cache was unreliable on this external volume).
- `npm test` covers migration-specific route and branding contracts.
- The built Node 22 server served `/`, `/products`, `/about`, and dynamic product/order HTML with HTTP 200 using placeholder environment values. This is a **rendering** check only: the database, registration, checkout, uploads, and payment were not exercised.
- Production-only `npm audit` had no high or critical advisories at the time of migration; moderate transitive advisories remain. Re-run before deployment.

## Before accepting real orders

1. Keep Hostinger's `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST=127.0.0.1`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` in environment settings, not Git. Verify the app connects to the imported MariaDB schema and back up the data including image BLOBs. Use `.env.example` for variable names only.
2. Use the built-in database image upload route; configure a payment method suitable for your business and currency. The imported Stripe checkout currently charges `usd` and its webhook and order-state logic need verification and hardening; **do not activate real payments yet**.
3. Complete security and business-logic gates. Admin-only product/order mutations now check the session, customer order reads are session-scoped, and user password hashes are excluded from public responses. These fixes have local contract tests, but **no real-database integration test yet**. Checkout now checks quantities and derives ownership from the session, but still needs stock validation, an independently verified currency and amount, and idempotent payment/webhook processing before accepting real orders. Audit the remaining account/review endpoints with a disposable database.
4. Replace watch-template pages, logo/media, model defaults, product fields, and contact/social/shipping/warranty/privacy claims with actual TukShop details before promoting the test storefront as a real store.
5. Test authenticated and anonymous API paths against the Hostinger DB, including registration, admin upload, image delivery and product create/update; then verify Google OAuth callback and browser flows. Test purchases must wait until the payment gates in steps 2–3 pass.

To revert locally, preserve any new work made after this note, then restore the archived original folder under the `tukshop-app` name. Do not run a blind `git reset --hard` on the replacement: the original had extensive uncommitted work.
