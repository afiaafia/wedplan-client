# WedPlan Admin Dashboard Inspection

## Scope and Git state

Inspected the client and server repositories before implementation.

| Repository | Branch | HEAD / upstream | Existing local changes |
| --- | --- | --- | --- |
| `wedplan-client` | `main` | `527a5e7` / `origin/main` | 18 modified tracked files and 10 untracked files |
| `wedplan-server` | `main` | `de79114` / `origin/main` | 16 modified tracked files and 7 untracked files |

Both branches were even with their upstreams. Existing changes were present at inspection start and have been preserved. The client work includes prior auth/route, homepage/footer, test, Tailwind/PostCSS, and assignment-report changes. The server work includes prior JWT/authentication and public-service/booking changes, local QA data and scripts, and an auth backup. In particular, `.local/`, existing `docs/`, `src/lib/jwt.ts`, `src/lib/auth.ts.bak`, and the dirty auth middleware are not Admin-dashboard work and must not be swept into an Admin commit.

The client also has the local backup branch `backup/before-feature-commits`; the server has `backup/before-server-feature-commits`. No commit or push was made during inspection.

## 1. What already exists and works

- The client uses one shared Better Auth sign-in flow and Next.js App Router role dashboards. Admin pages exist at `/dashboard/admin`, `/users`, `/services`, `/bookings`, and `/transactions` under that dashboard.
- The Admin layout and each route call server-side `requireRole(["admin"])`. The Next.js proxy also restricts dashboard routes using session roles.
- The responsive Admin shell has active sidebar links, logout, and mobile navigation.
- The server mounts `/api/admin/dashboard`, `/users`, `/services`, `/bookings`, and `/transactions`. Each router uses `requireAdmin`; inputs use Zod validation and list endpoints use pagination.
- Vendor-created services start `pending`. Admin approval/rejection uses a conditional update that only accepts pending services. Public listing/detail queries require both `approved` and `isActive`; meaningful vendor edits send reviewed listings back to pending.
- Admin user management supports search, role and blocked filters, pagination, details, and block/unblock. The backend prevents blocking the acting Admin or another Admin and revokes sessions when a user is blocked.
- Admin bookings are read-only and have search/filtering, pagination, and a details dialog. The supported booking states are Pending, Accepted, Rejected, and Cancelled.
- Admin transaction status is read-only. Checkout/webhook code owns transaction status changes; webhook signature verification and duplicate-event protection are present.
- Public registration and profile updates cannot grant Admin capability. The registration role validator only permits Customer and Vendor.
- Baseline validation passed: client tests **102/102**; server tests **156/156**. Server tests emit expected error logs for simulated failures. `git diff --check` found no whitespace errors; Git reported existing line-ending warnings.

## 2–4. Partial functionality, missing requirements, and fixes identified

1. **Overview statistics are incomplete.** The server currently counts users, customers, vendors, services, pending approvals, bookings, transactions, and active Premium vendors. It does not report blocked users, approved/rejected services, booking counts by supported status, successful transaction count, or successful transaction totals. The client therefore cannot display the requested database-backed breakdown.
2. **Service management lacks vendor search/filter and contact details.** It filters by service text, category, approval, and availability, but not vendor. The service review result contains vendor name only, not email; the detail dialog likewise omits vendor email.
3. **Admin service activation bypasses subscription capacity.** The Admin activation handler directly toggles `isActive` and reconciles the counter after the write. Unlike the existing vendor activation path, this does not reserve a plan-appropriate slot atomically. Admin activation must use the existing capacity-enforced mutation path; deactivation must remain possible for over-limit accounts.
4. **Transaction details are incomplete.** The page has search, status/vendor filtering, pagination, and a read-only table, but no transaction detail view or explicit provider/related subscription information. The transaction model records Stripe subscription IDs, but the Admin response does not return them. Amounts are stored in currency units (Stripe minor-unit amount divided by 100); successful totals should be grouped by currency rather than incorrectly combining currencies.
5. **User details show only the legacy single role.** The list shows `roles`, but the details dialog shows only `role`; it should show all current capabilities.
6. **First-Admin provisioning is not documented or implemented.** Public self-assignment is blocked, but there is no controlled operational procedure for promoting the first existing account. An offline, operator-controlled provisioning command is needed; no public privilege-escalation endpoint should be added.
7. **Admin test coverage is partial.** Existing tests cover Admin session authorization, non-Admin denial, service approval behavior, user protection, and read-only transaction behavior. There is no full authenticated browser workflow or live Admin account available in the workspace.

## 5. Existing APIs and logic to reuse

- Admin list/detail/action endpoints listed above should be extended rather than duplicated.
- Existing `requireAdmin`, session/JWT verification, role normalization, blocked-account checks, Zod validators, and session revocation should remain the authorization foundation.
- Reuse service query/pagination models, service approval state transitions, public approved/active filters, and `setVendorServiceActiveWithLimit` for Admin activation.
- Reuse booking and transaction models and status enums. Do not add Admin booking transitions or manual payment-status actions.
- Reuse the existing Stripe transaction records and webhook lifecycle; expose only necessary transaction metadata to the Admin UI.

## 6. Architectural and security notes

- Server-side authorization is authoritative; client route guards are supplemental. Every Admin API route must continue to verify the current user as an unblocked Admin.
- The Admin user API has no role mutation, and Admin accounts are protected from block actions. Those safeguards must remain.
- The new provisioning path should require database/operator access, an existing account, explicit confirmation, and a check that no Admin already exists. It must preserve existing roles and must not be an HTTP endpoint.
- Service approval and activation are separate states. Approval must not silently activate a listing; public visibility must continue requiring both approved and active.
- Stripe transaction status must remain webhook-controlled and transaction data must not expose credentials or secrets.
- No local test Admin account or credentials are available. No production or deployment data was modified during this inspection.

## Existing local changes to preserve

The following inventory was captured before Admin implementation.

### Client

Modified tracked: `README.md`, `next.config.ts`, `package.json`, `pnpm-lock.yaml`, `src/app/layout.tsx`, `src/app/services/[id]/page.tsx`, `src/app/sign-in/page.tsx`, `src/components/auth/auth-form.tsx`, `src/components/home/featured-service-card.tsx`, `src/components/layout/footer.tsx`, `src/components/services/service-card.tsx`, `src/lib/route-access.ts`, `src/lib/services-api.ts`, `src/lib/use-logout.ts`, `src/proxy.ts`, `tests/featured-services.test.ts`, `tests/redirect-path.test.ts`, `tests/route-access.test.ts`.

Untracked: `docs/ASSIGNMENT-9-AUDIT.md`, `docs/FINAL-ASSIGNMENT-9-REPORT.md`, `docs/LIVE-MANUAL-QA-REPORT.md`, four `docs/live-qa-*.png` captures, `postcss.config.mjs`, `src/lib/api-access-token.ts`, `tests/footer-links.test.ts`.

### Server

Modified tracked: `.env.example`, `README.md`, `package.json`, `pnpm-lock.yaml`, `src/app.ts`, `src/controllers/profile.controller.ts`, `src/controllers/services.controller.ts`, `src/middleware/require-admin.ts`, `src/middleware/require-auth.ts`, `src/middleware/require-customer.ts`, `src/middleware/require-vendor.ts`, `src/routes/profile.routes.ts`, `src/routes/services.routes.ts`, `tests/auth-security.test.ts`, `tests/booking.test.ts`, `tests/public-services.test.ts`.

Untracked: `.local/featured-services-live.json`, `.local/vendor-portraits.json`, `scripts/check-demo-vendors.mjs`, `scripts/create-demo-vendors.mjs`, `scripts/upload-demo-vendor-portraits.mjs`, `src/lib/auth.ts.bak`, `src/lib/jwt.ts`.

## Baseline test results

- Client: `pnpm test` — **102 passed, 0 failed**.
- Server: `pnpm test` — **156 passed, 0 failed**.
- Client tests emit existing Node `MODULE_TYPELESS_PACKAGE_JSON` warnings. Server tests print expected simulated database/webhook failure logs; the tests pass.

## Implementation follow-up

The identified Admin gaps have now been addressed locally:

- The overview returns and displays blocked-user, service-approval, booking-status, and completed-transaction counts. Successful amounts are grouped case-insensitively by currency.
- Admin service search accepts vendor name/email and Admin-only service results include vendor identity and email.
- Admin activation now goes through the subscription-capacity transaction path; deactivation remains available to blocked vendors.
- The transaction API returns the Stripe provider and subscription reference. The UI presents these in a read-only detail dialog and keeps statuses webhook-controlled.
- User details display every role capability.
- The first-Admin command requires an existing, unblocked, email-verified account, checks that no Admin exists, preserves existing roles, and requires interactive confirmation. It is not an HTTP endpoint.

### Final automated validation

| Check | Result |
| --- | --- |
| Client `pnpm test` | PASS — 107 tests |
| Server `pnpm test` | PASS — 163 tests |
| Client/server `pnpm typecheck` | PASS |
| Client/server `pnpm lint` | PASS — server has no warnings; client retains six pre-existing `<img>` warnings in customer dashboard files |
| Client `pnpm build` | PASS — Admin routes compiled with Next.js 16.4.6 |
| Server `pnpm build` | PASS |
| `git diff --check` | PASS — no whitespace errors; Git emitted only existing LF/CRLF conversion warnings |

### Browser coverage and remaining gate

Unauthenticated browser smoke checks rendered `/sign-in`, `/vendor/sign-in`, and the service listing (six local services loaded). A guest request to a service detail and to `/dashboard/admin/services` redirected to `/sign-in` with the original path in `callbackURL`. No test Admin account or credentials are available, so the authenticated Admin overview, moderation, transaction detail, and blocking interactions could not be exercised in a browser. Do not treat this as complete authenticated end-to-end coverage.

An isolated preview on `localhost:3301` was denied by the backend's configured CORS allowlist. No origin was added to weaken that boundary; the smoke checks continued on the pre-existing `localhost:3000` client server, where the service listing loaded. The temporary preview was stopped.

No commit, push, or deployment has been made. Because authenticated Admin browser coverage remains unavailable and both worktrees contain substantial unrelated pre-existing changes, only the Admin-specific changes should be considered for any later isolated commit; do not stage the full repositories.
