# Assignment 9 Report: Sign-In Required for Service Details

## Access behavior

- The homepage, Services browse page, featured-service cards, public listing API, search, filters, and sorting remain available without signing in.
- Every service card is one link to its detail route, so the image, title, card body, and View Details affordance share one navigation target without nested links.
- The client proxy protects `/services/:id` and redirects guests to `/sign-in?callbackURL=...`, including the requested query string. Existing `redirect` return URLs remain supported.
- Return URLs are checked as same-origin application paths and against the signed-in user's existing role access before redirecting.
- The service detail page independently requires a session. The detail API (`GET /api/services/:id`) also requires a session and returns HTTP 401 to guests; the listing and featured APIs remain public.
- Detail API requests send the application's existing bearer token and session credentials.

## Test evidence

| Check | Result |
|---|---|
| Client test suite (`pnpm test`) | PASS — 107 tests |
| Server test suite (`pnpm test`) | PASS — 163 tests |
| Client typecheck (`pnpm typecheck`) | PASS |
| Server typecheck (`pnpm typecheck`) | PASS |
| Client lint (`pnpm lint`) | PASS — 0 errors; 6 existing `<img>` warnings in customer dashboard components |
| Server lint (`pnpm lint`) | PASS |
| Client production build (`pnpm build`) | PASS — Next.js 16.4.6 |
| Server production build (`pnpm build`) | PASS |
| Browser guest-access smoke checks | PASS — service listing loaded; protected service detail redirected to sign-in with its callback URL |
| Authenticated customer/vendor/Admin end-to-end checks | NOT RUN — no test credentials or authenticated browser session were available |

The server tests exercise unauthenticated service-detail requests (401), authenticated Customer/Vendor/Admin detail access, and unauthenticated listing requests with search, category, location, and price sorting.
