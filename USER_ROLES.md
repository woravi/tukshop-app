# User roles and database-backed authority

## Contract for server handlers

```js
import { authorizeRoles } from '@/lib/server-access';
const { status, actor } = await authorizeRoles(['owner', 'manager']);
if (status !== 200) return NextResponse.json({ error: 'Forbidden' }, { status });
// actor = { id: String(SQL user id), email: current SQL email, role: current SQL role }
```

`export async function authorizeRoles(roles)` always calls `getServerSession(authOptions)` first. The signed `_id` identifies the account; `SELECT id,email,role FROM users WHERE id=?` then obtains its current authority. JWT/session `admin`, `role`, or email claims are not authorization inputs. No role/actor cache is used. Missing/malformed identity or deleted users return `{status:401,actor:null}`; disallowed roles return 403 (with the current actor), unknown persisted roles return 403 with no actor. SQL/session errors fail closed, never become an allow. Check authorization before parsing uploads/bodies, listing records, or performing application writes.

The session callback independently refreshes user identity and UI privileges from SQL on each session read. Client `update()` payloads cannot replace `_id`, email, role or admin; persisted profile changes appear on the next session read. Existing numeric account IDs and password hashes are preserved. `session.user.admin` is a compatibility flag derived from `owner` or `manager`, not a second authority source.

`lib/access.mjs` remains a backward-compatible **UI/ownership helper**, not a server authorization boundary. An explicit role takes precedence over a legacy admin flag. Only role-less legacy helper callers may use the old boolean fallback. API callers must supply a freshly authorized actor, never raw stale claims.

## Least-privilege matrix

| Operation | owner | manager (assistant manager) | kitchen | customer |
| --- | --- | --- | --- | --- |
| User list and role changes | yes | no | no | no |
| Product/image administration | yes | yes | no | no |
| Legacy full order administration / delivery update | yes | yes | no | no |
| Own customer orders/profile | yes | yes | yes | yes |
| Other customers' legacy order details | yes | yes | no | no |

Kitchen is a distinct role, **not admin**. Dedicated kitchen/food workflows must explicitly authorize it and return only the operational fields they need; it is not allowed to enumerate legacy full orders or manage users/products. The product and food subsystems use the same `authorizeRoles` contract.

## Owner-only staff management

- Server-gated `/admin/users`; unauthorized visitors never receive the staff list.
- `GET /api/admin/users?search=...&page=1&limit=20`: owner only; page size 1–100, literal bound search, public identity/role fields only, no password hashes or preferences, `no-store` response.
- `PATCH /api/admin/users/[id]`: owner only; body must be **exactly** `{ "role": "owner|manager|kitchen|customer" }`. Unknown fields (including `password`, `admin`, email) are rejected. Malformed body/IDs: 400; unknown registered target: 404; retention/self-demotion conflicts: 409.
- No create-account endpoint, temporary password, generated password, shared login, invitation secret, or credential reset is provided. Each staff member registers their own account through the ordinary public flow first; an owner assigns its role afterward.
- Role changes run in a transaction. `SELECT ... FROM users ORDER BY id FOR UPDATE` locks user rows in stable order, rechecks the acting owner under lock, enforces retention/self-demotion rules, writes `role` and the legacy `admin` flag together, and reads back the exact target before commit. This deliberately serializes changes on the small shop user table. A future high-volume replacement must preserve the lock/last-owner invariant.
- An owner cannot demote themself, even if another owner exists. At least one existing owner must remain. There is no account suspension feature; “active owner” means an existing owner account. Public self-deletion uses the same lock protocol and rejects all owner self-deletions; another owner must demote that account first. Ordinary customer/manager/kitchen self-deletion remains supported.
- Do not expose generic model role/admin mutation through public profile or registration routes. Role writes are owned by the locked SQL service, not `User.save()` from an arbitrary request body.

## Migration and registration safety

Apply `sql/004_user_roles.sql` to MariaDB 11 **before** serving the role-aware application, with the normal backup/maintenance procedure. It is additive and repeatable:

1. Add the role enum as nullable only for the migration window.
2. Backfill only `role IS NULL`: preexisting `admin = TRUE` accounts become `owner`; other existing accounts become `customer`.
3. Make role non-null with default `customer` and synchronize the compatibility admin flag.

On rerun, assigned roles are not re-promoted, including `manager` accounts with admin=true. No existing account, hash, order, or product is deleted. Public password registration, credentials registration, and first Google sign-in explicitly choose customer/admin=false and never accept supplied privilege fields. The SQL default also protects ordinary insertions. No credentials are generated or rotated.

**Preflight:** confirm the existing installation has a legitimate legacy admin account that will migrate to owner. If there are none, do not automatically promote the next public signup; an operator must explicitly choose and authorize an existing registered account via the normal privileged database change process. No migration or production deployment was performed by this implementation.

## Regression verification

```sh
node --test tests/access.test.mjs tests/role-authority.test.mjs tests/auth-roles.test.mjs tests/role-api-security.test.mjs tests/staff-administration.test.mjs tests/staff-administration-ui.test.mjs
npm test
```

Tests execute real role policy/service/callback/route code with isolated SQL/session boundaries and mount the React role editor. They cover stale owner claims after demotion, each role, removed users, explicit-role precedence, owner revocation races under locks, self-demotion/deletion, malformed privilege payloads, parameter binding, denied access before body parsing, UI self-locking, and denied-owner detail clearing. Migration source contracts cover additive/repeatable SQL; live MariaDB migration/concurrency checks require an explicitly provisioned disposable database and are not implied by unit test success. The local session had no DB environment, MariaDB client or Docker available; do not claim a live DB run without supplying that prerequisite.
