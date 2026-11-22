# WedPlan Live Manual QA Report

## Scope

- Environment: https://wedplan-client-ten.vercel.app
- Backend: https://wedplan-server-vcdp.onrender.com
- Tested in a real browser on 2026-11-22.
- No passwords were available through secure environment variables or browser-password manager discovery.
- No production user role or subscription data was changed.
- No production booking, service, user, transaction, or payment record was created.

## Safety result

Production account, booking, vendor, admin, and payment workflows were **BLOCKED** by unavailable account passwords, Stripe test/live confirmation, and the lack of an isolated database/test environment.

## Summary

| Group | PASS | FAIL | BLOCKED | NOT VERIFIED | Total |
|---|---:|---:|---:|---:|---:|
| Authentication | 6 | 0 | 6 | 1 | 13 |
| Customer | 8 | 0 | 4 | 0 | 12 |
| Vendor | 0 | 0 | 9 | 1 | 10 |
| Admin | 0 | 0 | 9 | 0 | 9 |
| Booking | 0 | 0 | 9 | 0 | 9 |
| Payment | 0 | 0 | 10 | 0 | 10 |
| UI | 7 | 1 | 1 | 1 | 10 |
| **Total** | **21** | **1** | **48** | **3** | **73** |

## Evidence

- [Desktop homepage](./live-qa-homepage-desktop.png)
- [Desktop services](./live-qa-services-desktop.png)
- [Mobile homepage](./live-qa-homepage-mobile.png)
- [Mobile sign-in](./live-qa-sign-in-mobile.png)

## Authentication

| Test ID | User role | Workflow | Steps | Expected | Actual | Status | Evidence | Issue |
|---|---|---|---|---|---|---|---|---|
| AUTH-01 | Unspecified | Account 1 role | Visit existing account; sign in | Correct role/dashboard | Password unavailable | BLOCKED | No screenshots contain secrets | Secure credential required |
| AUTH-02 | Unspecified | Account 2 role | Visit existing account; sign in | Correct role/dashboard | Password unavailable | BLOCKED | No screenshots contain secrets | Secure credential required |
| AUTH-03 | Unspecified | Account 3 role | Visit existing account; sign in | Correct role/dashboard | Password unavailable | BLOCKED | No screenshots contain secrets | Secure credential required |
| AUTH-04 | Unspecified | Account 4 role | Visit existing account; sign in | Correct role/dashboard | Password unavailable | BLOCKED | No screenshots contain secrets | Secure credential required |
| AUTH-05 | Guest | Invalid credentials | Submit a valid-format nonexistent email and password | User remains signed out with clear error | `Invalid email or password` displayed; no redirect | PASS | Browser snapshot | None |
| AUTH-06 | Guest | Weak signup password | Submit weak password | Frontend blocks weak password | Weak-password guidance was shown | PASS | Browser snapshot | None |
| AUTH-07 | Guest | Vendor signup role | Open `/sign-up?role=vendor` | Vendor is preselected | Vendor button remained pressed | PASS | Browser snapshot | None |
| AUTH-08 | Guest | Customer Google initiation | Click Google sign-in | Redirect to Google OAuth for WedPlan | Reached Google consent identifier with WedPlan redirect URI | PASS | Browser URL snapshot | OAuth completion requires account interaction |
| AUTH-09 | Guest | Google callback | Complete account selection and consent | Session and callback destination succeed | External consent not completed | NOT VERIFIED | Shared Google browser state | Google account credentials/consent unavailable |
| AUTH-10 | Guest | Protected routes | Open Customer/Vendor/Admin dashboard URLs | Redirect to sign-in | All three redirected to `/sign-in?redirect=...` | PASS | Browser route snapshots | None |
| AUTH-11 | Guest | Session endpoint | Fetch `/api/auth/get-session` | No authenticated session for guest | Returned `null` | PASS | Browser response snapshot | None |
| AUTH-12 | Authenticated | Logout and refresh | Sign in, logout, refresh | Session clears and protected routes reject | Password unavailable | BLOCKED | None | Secure credential required |
| AUTH-13 | Authenticated | Blocked/restricted account | Sign in a blocked test account | Protected features remain blocked | Password/unisolated account unavailable | BLOCKED | None | Test account and safe database required |

## Customer

| Test ID | Workflow | Steps | Expected | Actual | Status | Evidence | Issue |
|---|---|---|---|---|---|---|---|
| CUST-01 | Homepage | Load homepage | Hero, categories, featured, benefits, how-it-works, footer visible | All major sections rendered; 6 featured cards appeared | PASS | [Evidence](./live-qa-homepage-desktop.png) | None |
| CUST-02 | Browse services | Open browse page | Dynamic public service list | Six services rendered | PASS | [Evidence](./live-qa-services-desktop.png) | None |
| CUST-03 | Search | Search `Garden` | Matching service cards | Two matching cards; URL `?q=Garden` | PASS | Browser snapshot | None |
| CUST-04 | Category filter | Select Wedding Venues | One matching category | One Wedding Venue card | PASS | Browser snapshot | None |
| CUST-05 | Location filter | Enter `Lagos` | Matching Lagos services | Three matching cards | PASS | Browser snapshot | None |
| CUST-06 | Price sorting | Select both sort directions | URL and card order update | Ascending/descending pages loaded and updated | PASS | Browser snapshot | None |
| CUST-07 | Service detail | Open venue detail | Images, details, vendor and booking option visible | Venue detail displayed correctly | PASS | Browser snapshot | None |
| CUST-08 | Unauthenticated booking | Click booking button | Redirect to sign-in with return path | Redirected to `/sign-in?redirect=%2Fservices%2F...` | PASS | Browser snapshot | None |
| CUST-09 | Customer login | Sign in with known account | Customer dashboard and profile load | No password available | BLOCKED | None | Secure credential required |
| CUST-10 | Booking creation/cancel/duplicate | Submit and manage booking | Persist and enforce lifecycle rules | Not executed against production data | BLOCKED | None | Test account and isolated test records required |
| CUST-11 | Own-service booking | Use Customer account | Own service is rejected | Not tested without authenticated account | BLOCKED | None | Test account required |
| CUST-12 | Profile/image/upload and dashboard stats | Update profile and inspect live stats | Database-backed profile and booking totals | Not tested against production account | BLOCKED | None | Test account and safe test records required |

## Vendor

| Test ID | Workflow | Steps | Expected | Actual | Status | Evidence | Issue |
|---|---|---|---|---|---|---|---|
| VEND-01 | Vendor email login | Sign in with Vendor account | Vendor dashboard | Password unavailable | BLOCKED | None | Secure credential required |
| VEND-02 | Vendor Google login | Initiate Vendor Google OAuth | Callback and Vendor role work | Initiation could be blocked by browser OAuth lock; callback not completed | NOT VERIFIED | Browser snapshot | OAuth account/credential required |
| VEND-03 | Vendor dashboard | Open vendor overview | Live service/booking/subscription statistics | Not tested without session | BLOCKED | None | Authentication required |
| VEND-04 | Service creation | Create test service | Pending service appears | Not executed | BLOCKED | None | Test Vendor account and isolated data |
| VEND-05 | Service edit/delete | Edit/delete test service | Persistence and cleanup | Not executed | BLOCKED | None | Test-created records required |
| VEND-06 | Image upload | Upload test image | Hosted URL stored and displayed | Not executed | BLOCKED | None | ImgBB test account/key and test record |
| VEND-07 | Availability | Change test service availability | Public visibility follows state | Not executed | BLOCKED | None | Test-created service required |
| VEND-08 | Free-plan limit | Publish fourth active service | Backend returns limit error | Not executed | BLOCKED | None | Test Vendor and isolated DB |
| VEND-09 | Accept/reject booking | Process test pending bookings | Status updates persist | Not executed | BLOCKED | None | Customer/Vendor test accounts |
| VEND-10 | Cross-vendor isolation | Access another vendor data | Denied | Not executed | BLOCKED | None | Two Vendor test accounts |

## Admin

| Test ID | Workflow | Steps | Expected | Actual | Status | Evidence | Issue |
|---|---|---|---|---|---|---|---|
| ADMIN-01 | Admin login | Sign in with Admin account | Admin dashboard | Password unavailable | BLOCKED | None | Secure credential required |
| ADMIN-02 | Dashboard statistics | Open overview | Real database totals | Not tested | BLOCKED | None | Admin account required |
| ADMIN-03 | User search/filter | Search and filter users | Matching live records | Not tested | BLOCKED | None | Admin account required |
| ADMIN-04 | Block/unblock | Use dedicated test account | Protected features stop/start | Not tested | BLOCKED | None | Dedicated test account required |
| ADMIN-05 | Service moderation | Approve/reject test services | Public visibility and status update | Not tested | BLOCKED | None | Test services and Admin account |
| ADMIN-06 | Service deletion | Delete test service | Test record removed safely | Not tested | BLOCKED | None | Test-created record required |
| ADMIN-07 | Transactions | Inspect transaction table | Real Stripe records | Not tested | BLOCKED | None | Stripe/test account required |
| ADMIN-08 | Protected route separation | Open Admin route as Customer/Vendor | Access denied | No authenticated account available | BLOCKED | [Unauthenticated redirects](#authentication) | Role account credentials required |
| ADMIN-09 | Payment status integrity | Attempt manual transaction change | Admin cannot mark failed payment successful | Not tested | BLOCKED | None | Admin/Test transaction required |

## Booking lifecycle

| Test ID | Workflow | Steps | Expected | Actual | Status | Evidence | Issue |
|---|---|---|---|---|---|---|---|
| BOOK-01 | Customer create | Submit real test booking | Pending record persisted | Not executed | BLOCKED | None | Customer test account |
| BOOK-02 | Vendor sees request | Log in to Vendor | Own-service request appears | Not executed | BLOCKED | None | Separate accounts |
| BOOK-03 | Vendor accept | Accept Pending booking | Accepted status persists | Not executed | BLOCKED | None | Test booking |
| BOOK-04 | Vendor reject | Reject Pending booking | Rejected status persists | Not executed | BLOCKED | None | Test booking |
| BOOK-05 | Customer sees status | Reload Customer dashboard | Accepted/rejected status | Not executed | BLOCKED | None | Customer session |
| BOOK-06 | Customer cancel | Cancel Pending booking | Cancellation persists | Not executed | BLOCKED | None | Test booking |
| BOOK-07 | Duplicate prevention | Submit same service/date twice | Duplicate rejected | Not executed | BLOCKED | None | Test Customer booking |
| BOOK-08 | Unauthorized operations | Use guest or wrong role | 401/403 | Unauthenticated dashboard route and guest booking redirect verified; API role operations not executed | BLOCKED | [Guest route evidence](#customer) | Role credentials required |
| BOOK-09 | Reload persistence | Reload after lifecycle change | Persisted status remains | Not executed | BLOCKED | None | Test data required |

## Payment

| Test ID | Workflow | Steps | Expected | Actual | Status | Evidence | Issue |
|---|---|---|---|---|---|---|---|
| PAY-01 | Stripe mode | Inspect deployed environment | Test mode confirmed | Production credentials hidden; live/test mode not verified | BLOCKED | None | Authorized configuration inspection required |
| PAY-02 | Vendor upgrade | Open Upgrade action | Backend creates Checkout Session | Not executed | BLOCKED | None | Vendor account/Test Stripe |
| PAY-03 | Test successful checkout | Use official test card | Redirect and webhook verification | Not executed | BLOCKED | None | Stripe test mode |
| PAY-04 | Transaction persistence | Inspect transaction | Fields persisted once | Not executed | BLOCKED | None | Test checkout |
| PAY-05 | Premium activation | Reload after webhook | Premium active only after verified webhook | Not executed | BLOCKED | None | Test checkout |
| PAY-06 | Test failed payment | Use failing test card | Premium remains inactive | Not executed | BLOCKED | None | Stripe test mode |
| PAY-07 | Cancelled checkout | Cancel Checkout | Premium remains inactive | Not executed | BLOCKED | None | Stripe test mode |
| PAY-08 | Success redirect without webhook | Open success page | Premium must remain pending | Not executed | BLOCKED | None | Vendor account/Test webhook |
| PAY-09 | Duplicate webhook | Re-deliver event | No duplicate transaction/state | Not executed | BLOCKED | None | Stripe CLI/test endpoint |
| PAY-10 | Expiry/cancellation | Process subscription cancellation | Plan downgrade/expiry | Not executed | BLOCKED | None | Stripe test mode |

## UI and responsive

| Test ID | Workflow | Steps | Expected | Actual | Status | Evidence | Issue |
|---|---|---|---|---|---|---|---|
| UI-01 | Desktop homepage | Inspect 1440 × 900 | Complete, non-overlapping layout | Rendered successfully; no measured horizontal overflow | PASS | [Evidence](./live-qa-homepage-desktop.png) | None |
| UI-02 | Tablet homepage | Inspect 768 × 1024 | Complete responsive layout | No horizontal overflow detected | PASS | Browser metrics | Browser viewport constrained to 602px in automation |
| UI-03 | Mobile homepage | Inspect 390 × 844 | Complete responsive layout | No horizontal overflow detected | PASS | [Evidence](./live-qa-homepage-mobile.png) | Browser viewport constrained to 300px in automation |
| UI-04 | Mobile menu | Open/close menu | Menu works | Menu opened and showed Browse Services | PASS | Browser snapshot | None |
| UI-05 | Sign-in mobile | Open sign-in | Inputs/buttons remain usable | Rendered and accessible | PASS | [Evidence](./live-qa-sign-in-mobile.png) | None |
| UI-06 | Broken images | Inspect loaded homepage | No broken images | No broken image elements detected | PASS | Browser metrics | None |
| UI-07 | Console/network | Browse public routes | No critical console/network errors | Only font preload warnings and Next RSC abort warnings; no broken images | PASS | Browser snapshots | Preload warnings are non-critical |
| UI-08 | Footer | Inspect footer | Real project contact/social links | Production footer uses generic Instagram/Facebook/YouTube/X/Pinterest/TikTok homepage links | FAIL | Browser snapshot | Local footer fix exists but is not deployed |
| UI-09 | Authenticated dashboards | Inspect responsive dashboards | Complete dashboard layouts | Credentials unavailable | BLOCKED | None | Authenticated session required |
| UI-10 | Forms/modals/dropdowns | Inspect major forms | Buttons, validation and states work | Public sign-in/signup and service filters inspected; authenticated forms blocked | NOT VERIFIED | Browser snapshots | Authentication/test data required |

## Bugs and fixes

### Live bug: generic footer social links

- **Test:** UI-08
- **Actual:** Production footer links use generic platform homepages rather than project-specific profiles.
- **Likely cause:** `NEXT_PUBLIC_*_URL` values are absent or the deployed build predates the footer fix.
- **Local fix:** [footer.tsx](../src/components/layout/footer.tsx) and [footer-links.ts](../src/lib/footer-links.ts) now validate configured HTTP(S) URLs and avoid generic configured links.
- **Regression test:** [footer-links.test.ts](../../tests/footer-links.test.ts)
- **Status:** Fixed locally; live status remains FAIL until the client is redeployed and production social variables are configured.

## External actions required

1. Supply secure passwords for the four existing accounts or use browser password manager credentials.
2. Identify each account's real role without changing it.
3. Configure an isolated test database and test accounts.
4. Confirm Stripe is in Test Mode before any checkout.
5. Configure a Stripe test webhook and test card.
6. Redeploy the uncommitted footer fix before treating UI-08 as resolved.
7. Provide real Google account consent for OAuth callback verification.

## Final submission conclusion

**NOT READY FOR FULL SUBMISSION VERIFICATION.**

Public browsing, protected-route redirects, weak-password validation, invalid-login handling, Google OAuth initiation, and responsive public UI checks passed. Customer/vendor/admin authenticated workflows, booking lifecycle, Stripe test checkout, and live role verification were blocked by missing credentials and test infrastructure.
