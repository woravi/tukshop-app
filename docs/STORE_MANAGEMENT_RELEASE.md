# Store management and restaurant release

## Installed data / preservation

- Apply migrations 004 → 005 → 006 → 007 **before** deploying the new application. The old application remains compatible with these additive columns/tables.
- Existing administrator accounts migrate once to `owner`; fresh public registrations are always `customer`. Do not use a generic user update to assign roles.
- Existing product IDs, names, prices, stock and images are preserved. Example classification is a dedicated `is_demo` boolean; migration005 backfills only positively identified legacy examples once. Later manual classification changes survive re-running the migration.
- Product categories have stable IDs, rename aliases, parent validation and CAS ordering. Numeric-only category names are rejected to avoid ambiguous ID/name routing.
- Variants carry independent SKU/color/size/price/stock; aggregate product stock is derived transactionally from active variants. Inventory changes are logged; merchandise checkout remains unconditionally disabled.

## Management entry points

- `/admin/users`: owner-only existing-account role assignments (no shared/generated passwords).
- `/admin/categories`: create/edit/reorder product categories.
- `/admin/variants?productId=<id>`: per-variant inventory, also linked from product editing.
- `/admin/food`: menu, picture, source, options, daily limits and resale-stock management.
- `/admin/food/settings`: service settings for owner/manager.
- `/kitchen`: owner/manager/kitchen workflow. Kitchen does not receive customer phone/address or payment confirmation controls.
- `/food`, `/food/cart`, `/food/orders/<opaque token>`: separate restaurant menu, guest request cart and status tracking.

## Restaurant configuration confirmed by owner

Bangkok timezone, Monday–Friday 09:00–18:00, minimum preparation 20 minutes. Pickup label: บ้าน ทุ่งประดู่. Closed weekends. Delivery areas/fees remain empty and daily capacity remains zero until the owner configures them. `order_accepting=false` is intentional; do not enable until all remaining operational details are confirmed. `FOOD_TRACKING_SECRET` is a persistent server-only setting, imported through a protected local file and verified present in Hostinger after reloading; never commit its value or expose it to a client.

Eight initial menus and six locally stored WebP source photographs are prepared/imported; boxed dishes reuse an illustrative dish photograph. See FOOD_IMAGE_CREDITS.md. No test label is shown on the restaurant pages, but ordering remains clearly closed. Stock for resold dessert menus starts at zero rather than an invented quantity. Allergen details remain unconfirmed with guidance to ask the restaurant.

## Order safety

- Pending guest requests reserve no capacity or stock. Staff acceptance locks authoritative data and reserves atomically; there is no guaranteed fulfilment until acceptance.
- Three requests per normalized Thai phone per rolling 15 minutes; pending expires after 20 minutes. This is **not** SMS/phone ownership verification or comprehensive bot protection.
- Idempotent request retries, acceptance and rejection/cancellation; releases happen only for stock actually held. Daily limits apply to made-to-order and resale items.
- Public tracking uses an opaque token with only hashes stored; no customer phone/address/notes is exposed. Rejected, cancelled, expired and completed transitions are constrained.
- No card processing or automatic slip confirmation. Owner/manager manual payment marking is available, not kitchen staff.

## Execution evidence

- Node 22.23.4 and MariaDB 11.8.9, matching the deployment majors/version.
- All 256 automated tests passed, including the explicitly enabled isolated merchandise and food migration tests (no skips).
- Additional actual MariaDB food integration test passed for non-reserving pending requests, concurrent acceptance, expiry, admission and privacy.
- Built production Next.js application successfully; existing React18 deprecation warning remains.
- Local production HTTP walkthrough passed 42 checks: four roles; denied anonymous/low-role operations; stale-role revocation; server prices; concurrent idempotency; capacity at acceptance; rate limit; kitchen progression; manual-payment authority. Browser walkthrough verified variant editing, selection and variant-specific cart data against the disposable database.
- Full production SQL backup was exported and restored successfully into isolated MariaDB before migration, including all image BLOBs. Restored product data matched the pre-migration public snapshot. Private backup stays under `~/.hermes/backups/`, not Git.

A local test or green build is not production verification; verify the exact Hostinger commit, public food/category/image reads, access-denied routes and closed-order status after publishing.
