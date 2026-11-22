# WedPlan Assignment 9 Audit

## Scope and safety

- Audited client and server source, tests, builds, Git history, local configuration, and read-only production pages.
- The server `.env` targets remote MongoDB. No write-capable database workflow, production account change, real payment, or data deletion was performed.
- No commit or push was made.
- Git is on `main`: client 33 commits and server 29 commits.

## Executive status

**Overall: READY AFTER EXTERNAL END-TO-END CREDENTIALS AND DEPLOYMENT**

The implementation is substantially complete. Authentication, multi-role authorization, booking, vendor limits, admin moderation, profile updates, and Stripe verification are implemented with targeted unit/integration coverage. Remaining work is primarily real-account, real-database, Stripe test-mode, and production-browser verification.

## Requirements checklist

| Area | Requirement | Status | Evidence / remaining work |
|---|---|---|---|
| Project | Separate Next.js client and Express/TypeScript server | PASS | Repositories and package structure inspected |
| MongoDB | Users, services, bookings, transactions and required indexes | PASS | Source and mock/integration tests inspected; live DB writes blocked |
| Auth | Customer/Vendor email registration | PASS | Registration policy and auth tests cover public roles |
| Auth | Password length and uppercase/lowercase policy | PASS | Frontend and backend validators tested |
| Auth | Admin cannot register publicly | PASS | Registration guards and server tests |
| Auth | Customer/Vendor email login | PASS | Better Auth integration and role middleware implemented |
| Auth | Customer/Vendor Google login | PARTIAL | Customer Google tested as working previously; Vendor real callback not verified in this audit |
| Auth | Existing Google account linkage | PARTIAL | Account-linking policy implemented; no real Google account test |
| Auth | Blocked-user sign-in rejection | PASS | Auth hook and authorization tests |
| Multi-role | One account with `roles: ["customer","vendor"]` | PASS | Mongo/user hooks and role middleware tested |
| Multi-role | Existing Customer can activate Vendor access | PASS | Authenticated session-derived endpoint and UI tests |
| Multi-role | Explicit Vendor activation confirmation | FIXED | Customer-only accounts remain signed in and show confirmation; cancel returns Customer dashboard |
| Multi-role | Google/OAuth existing-account role preservation | PASS | Database create hook only assigns initial role; existing accounts are not changed |
| Multi-role | Admin cannot add Vendor/Admin privileges publicly | PASS | Onboarding rejects Admin and registration cannot assign Admin |
| Session | Secure HttpOnly session cookies and expiry checks | PASS | Better Auth and proxy/server tests |
| Session | Logout and role refresh | PASS | Logout/session invalidation tests; production browser logout not completed |
| CORS | Production/local origin allowlist and credentials | PASS | CORS tests pass |
| OAuth | Same-origin Vercel `/api/*` proxy | PASS | Next rewrite and read-only production endpoint checks |
| OAuth | Google authorized redirect | NOT TESTED | Must be `https://wedplan-client-ten.vercel.app/api/auth/callback/google`; real callback not completed |
| Navbar | Logo, links, authenticated dropdown, roles, logout | PASS | Source and production unauthenticated read-only page inspection |
| Navbar | Immediate session update | NOT TESTED | Unit coverage exists; real login/logout browser check blocked |
| Homepage | Wedding hero and CTA | PASS | Production page rendered |
| Homepage | Database-backed featured services | PASS | API and client tests plus production page rendered |
| Homepage | Six categories, why choose, how it works | PASS | Source and production page inspection |
| Footer | Logo, links, contact, social configuration | FIXED | Footer now uses validated contact/social environment values instead of generic fake platform URLs |
| Services | Public browse, search, category, location, sorting | PASS | Server/client tests and production browse/filter browser check |
| Services | Approved/active public visibility | PASS | Server query tests |
| Services | Dynamic service detail and invalid ID handling | PASS | Server/client tests and production detail page check |
| Booking | Only authenticated Customers can create bookings | PASS | Customer middleware and controller tests |
| Booking | Vendor/ownership/status validation | PASS | Booking service tests |
| Booking | Duplicate active bookings | PASS | Application check and unique partial Mongo index |
| Booking | Vendor accept/reject/cancel state transitions | PASS | Mocked workflow tests |
| Booking | Genuine two-account E2E persistence | BLOCKED | Requires isolated MongoDB and authenticated test accounts |
| Vendor | Real overview statistics | PASS | Vendor dashboard model/API tests |
| Vendor | Add/update/delete/manage availability | PASS | Route, validation, and service tests |
| Vendor | Approval defaults to Pending | PASS | Service validation/model tests |
| Vendor | Free three-active limit and concurrency protection | PASS | Counter transaction and concurrent mock tests |
| Vendor | Vendor-only ownership filters | PASS | Vendor scope tests |
| Vendor | Vendor booking accept/reject ownership | PASS | Vendor scope and booking tests |
| Customer | Dynamic overview and booking history | PASS | Customer dashboard tests |
| Customer | Pending cancellation and status display | PASS | Customer controller tests |
| Customer | Cross-customer booking isolation | PASS | Ownership tests |
| Admin | Dynamic overview counts | PASS | Admin dashboard tests |
| Admin | User search/block/unblock | PASS | Admin users tests |
| Admin | Admin accounts cannot be blocked through public profile changes | PASS | Protected fields and admin route guards |
| Admin | Service moderation and deletion | PASS | Admin service tests |
| Admin | Read-only transaction history | PASS | Admin transactions tests |
| Stripe | Vendor-derived Checkout Session | PASS | Checkout controller tests |
| Stripe | Secret keys not exposed | PASS | Browser source inspection and server-only configuration |
| Stripe | Webhook signature and event idempotency | PASS | Stripe webhook unit tests |
| Stripe | Success/cancel does not activate directly | PASS | Success page reads backend plan; webhook remains authority |
| Stripe | Real test checkout | BLOCKED | Requires Stripe test credentials, CLI/webhook endpoint, isolated DB |
| Profile | Name/image/businessName updates | PASS | Profile/controller/tests |
| Profile | Protected role/subscription/block fields cannot be updated | PASS | Profile validator and auth hooks |
| Profile | ImgBB upload validation | PASS | Upload tests; real ImgBB credential test blocked |
| Security | Session-derived identity, role middleware, blocked checks | PASS | Server tests |
| Security | Protected nested dashboard route refresh | PASS | Next proxy/build and route tests |
| UI/UX | Loading, empty, error, success states | PARTIAL | Major workflows exist; full visual/mobile browser audit blocked in authenticated states |
| Responsive | Desktop/tablet/mobile layouts | NOT TESTED | Production unauthenticated pages were visually inspected at desktop only |
| Deployment | Vercel rewrite and Render API startup configuration | PASS | Source/config inspection and production public page checks |
| README | Client/server setup and environment documentation | PASS | Updated client README; server README already comprehensive |
| Database migration | Legacy `role` to `roles[]` migration | PASS | Startup backfill implemented; live migration not run |
| Git | Meaningful commit history | PARTIAL | Client 33 commits; server 29 commits; both meet stated minimums |
| End-to-end | Real Google, booking, payment, admin browser workflows | BLOCKED | Requires credentials, isolated database, authenticated test users |

## Testing performed

### Client

- 99 tests passed.
- Typecheck passed.
- Lint passed with six existing `<img>` warnings in dashboard image components.
- Production build passed.

### Read-only production probe

- Automated repeated requests to the Vercel `/api/*` proxy returned HTTP `429 Too Many Requests`.
- This is an external/rate-limit observation, not a cookie or OAuth callback verification.
- Direct Render `/api/health` timed out during the final probe.
- Earlier browser checks confirmed the production homepage, browse page, category filtering, service detail page, and unauthenticated dashboard redirects.

### Server

- 154 tests passed.
- Typecheck, lint, and production build passed.

## Existing implementation highlights

- Single Better Auth user per email with `roles[]` plus legacy `role`.
- Authenticated self-service Vendor onboarding derived from session identity.
- OAuth callback role metadata affects only new account creation.
- Better Auth state cookie, session cookie, proxy, CORS, and trusted-origin configuration.
- Vendor atomic active-service limits and booking duplicate-key protection.
- Stripe raw-body webhook signature verification and event idempotency.
- Server-side role and blocked-user checks on protected APIs.

## Remaining external actions

1. Deploy the latest frontend commit to Vercel.
2. Configure/confirm `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, and `API_INTERNAL_URL` in Vercel.
3. Confirm Render `BETTER_AUTH_URL`, `CLIENT_URL`, CORS origins, OAuth credentials, cookie settings, Stripe, and ImgBB variables.
4. Confirm Google callback URI: `https://wedplan-client-ten.vercel.app/api/auth/callback/google`.
5. Configure an isolated test database and test accounts.
6. Complete real Google, email/password, Vendor activation, booking, profile, admin, and Stripe test-mode workflows.
7. Verify responsive browser layouts and console/network behavior with authenticated sessions.

## Submission readiness

**Ready after specific remaining actions.**

The codebase and automated implementation are substantial and the latest Vendor UX is committed, but external OAuth/database/payment/real-browser verification remains unavailable under the safety constraints.
