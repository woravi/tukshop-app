# Merchandise management contract

## Deployment prerequisite

Apply `sql/005_product_management.sql` to MariaDB **before** deploying these routes. It is additive and repeatable. It preserves existing product IDs, names, prices, stock and images; adds `category_id` and `is_demo`; registers existing category text; and seeds only missing bag categories. It does not manufacture variants or overwrite existing stock.

Only known IDs 6–11 bearing a DEMO/ตัวอย่าง/สาธิต name marker are marked demo by a one-time ledger-protected backfill. IDs 2–5 and other user records are not marked. Explicit later demo changes survive migration reruns.

## Authorization

Every merchandise mutation calls `authorizeRoles(['owner','manager'])` from `lib/server-access.js` before parsing the body or reading application records. That helper must authenticate against the fresh user database record. Anonymous requests receive 401, other roles 403. Public GETs expose active categories/variants. `?all=1` requires the same owner/manager authority.

## Categories

- `GET /api/categories` → ordered active category rows `{id,name,parent_id,sort_order,active,version}`.
- `GET /api/categories?all=1` → all rows for management.
- `POST /api/categories` → `{name,parent_id:null|id,sort_order,active:boolean}`.
- `PUT /api/categories/:id` → same fields plus the fetched `version`.
- `PATCH /api/categories` → `{order:[{id,version},...]}` containing the complete current category list. Reorders and increments every version in one transaction; stale/incomplete lists receive 409.
- Category names are editable, not limited to a hardcoded array. IDs are permanent. Parent cycles, inactive/missing parents, duplicate names and deactivation of categories containing products or active children are rejected.
- Renaming updates compatibility `products.category` text atomically and retains old-name aliases. New links should use `/products/category/:id`. Existing encoded Thai-name routes remain supported through `/api/products/category/:name`.
- Management UI: `/admin/categories`.

## Variants

- `GET /api/product/:productId/variants` → active variants.
- `GET /api/product/:productId/variants?all=1` → all variants for management.
- `POST /api/product/:productId/variants` → `{sku,color,size,price:number,stock:integer,active:boolean}`.
- `PUT /api/product/:productId/variants/:id` → same fields plus fetched `version`.
- SKU is globally unique. Active color/size combinations are unique within a product. Negative/fractional stock, nonfinite/negative prices and more than two decimal places are rejected. Stale writes receive 409.
- A variant mutation locks the product then its variants, performs CAS, recalculates product stock as the sum of active variant stock, and appends `inventory_changes` in the same transaction. Failures roll back all effects.
- Once any variants exist, ordinary product-stock edits are rejected, including when all variants are inactive. Product forms disable aggregate stock and expose the integrated variant editor. Creating a product redirects to its edit page so variants can be added after initial save.
- Management UI: `/admin/variants?productId=:id` or the product edit form.

## Product/demo/cart UI

Product create/update accept `is_demo` as a strict boolean and `category_id` as a nullable numeric ID; compatibility category names still resolve through the database. Creator ownership comes from the authorized actor, never the request body. Model reads include active `variants`, `has_variants`, and boolean `is_demo`.

Demo badges and disabled cart actions are driven by `is_demo`, independent of product name or stock. Variant products require color/size selection. Cart identity is `productId:variantId` (plain product ID for unvarianted products), with variant-specific price/stock/SKU/color/size. Desktop/mobile carts refresh current product data, drop demo/deactivated lines and clamp quantities. Merchandise checkout stays disabled.

Category assignment and category editing acquire tree locks before product locks to avoid rename/deactivation races. Review-loaded product saves persist only dirty fields, preventing unrelated review saves from overwriting a later demo flag/category rename.

## Verification

```sh
node --test tests/merchandise-management.test.mjs tests/merchandise-ui.test.mjs tests/cart-stock.test.mjs tests/product-stock.test.mjs tests/product-category.test.mjs tests/category-navigation-ui.test.mjs tests/category-page-loader.test.mjs tests/local-image-ui.test.mjs
MERCH_DB_INTEGRATION=1 node --test tests/merchandise-db.test.mjs
```

The integration suite requires installed `mariadb-install-db` and `mysqld`; it creates an isolated scratch datadir and Unix socket with networking disabled, never uses the application's database, and tears down afterward. It verifies repeat migrations, record preservation, guarded demo backfill, category rename aliases, concurrent category assignment/deactivation, atomic reorder/CAS, variant stock totals, concurrent stale-write rejection, rollback and inventory audit rows.
