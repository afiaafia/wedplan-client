# WedPlan Client

WedPlan is a wedding planning marketplace where couples discover and book wedding providers, vendors manage listings and booking requests, and administrators moderate the platform. This repository contains the Next.js frontend deployed on Vercel.

- **Live website:** https://wedplan-client-ten.vercel.app
- **Frontend repository:** https://github.com/afiaafia/wedplan-client.git
- **Backend repository:** https://github.com/afiaafia/wedplan-server.git
- **Production API:** https://wedplan-server-vcdp.onrender.com

## Technology stack

- Next.js 16 (App Router, React 19, TypeScript)
- Tailwind CSS 4
- Framer Motion (with `reducedMotion="user"`)
- Better Auth React client
- Lucide React icons
- Node.js test runner (TypeScript stripping)
- pnpm 12.4.2

## Main features

- Responsive homepage with hero, six wedding service categories, database-backed featured services, benefits, and how-it-works sections.
- Public service browsing with name search, category and location filters, price sorting, pagination, URL query synchronization, skeletons, empty/error states, and image fallbacks.
- Dynamic service detail pages with gallery, vendor summary, and authenticated booking requests.
- Email/password and Google authentication via Better Auth, including customer/vendor registration, password policy, logout, session refresh persistence, blocked-account handling, and role-based redirects.
- Customer dashboard: booking statistics, booking history/detail, pending-booking cancellation, and profile settings with server-side ImgBB uploads.
- Vendor dashboard: service CRUD, availability controls, booking request accept/reject, subscription status, and Stripe Checkout for Premium.
- Admin dashboard: platform and per-currency payment statistics, multi-role user details and block controls, vendor-aware service moderation, booking monitoring, and read-only Stripe transaction details.

## Installation

Prerequisites: Node.js 24 LTS (compatible with Next.js 16), pnpm 12.4.2, and a running WedPlan backend.

```bash
git clone https://github.com/afiaafia/wedplan-client.git
cd wedplan-client
pnpm install
cp .env.example .env.local
```

Fill in `.env.local` for local development, then start the app:

```bash
pnpm dev
```

Open http://localhost:3000.

## Commands

Use pnpm only; other package managers are not used by this project.

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create the production build |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | Run TypeScript without emitting files |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run the frontend Node test suite |

## Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Browser | API origin (same frontend origin in production; backend origin locally) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Browser | Better Auth origin (same frontend origin in production; backend origin locally) |
| `NEXT_PUBLIC_SITE_URL` | Browser | Frontend origin used in user-facing links |
| `API_INTERNAL_URL` | Server only | Backend origin used by Next.js API rewrites and server components |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Browser | Optional footer contact email |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Browser | Optional validated HTTPS/HTTP Instagram profile URL |
| `NEXT_PUBLIC_FACEBOOK_URL` | Browser | Optional validated HTTPS/HTTP Facebook profile URL |
| `NEXT_PUBLIC_PINTEREST_URL` | Browser | Optional validated HTTPS/HTTP Pinterest profile URL |
| `NEXT_PUBLIC_X_URL` | Browser | Optional validated HTTPS/HTTP X profile URL |

`NEXT_PUBLIC_*` values are embedded in the browser bundle. Never place secrets in them. Secrets such as the Better Auth secret, MongoDB URI, ImgBB key, and Stripe secret key belong only on the backend. See `.env.example` for local defaults.

## JWT bearer authentication

The browser continues to use secure Better Auth cookies for Google/email login. For protected API calls, the client can request a short-lived bearer token with `POST /api/me/token` and store it only in memory. The token complement is 15 minutes, is cleared on sign-out, and the backend revalidates the user role and blocked state on every bearer request.

## Project structure

```text
src/app/                    App Router pages (public, auth, and role dashboards)
src/components/home/        Homepage sections
src/components/services/    Browse/details/booking UI
src/components/dashboard/   Customer, vendor, and admin dashboard UI
src/components/layout/      Navbar, footer, theme toggle, toasts
src/lib/                    API clients, auth helpers, filters, role utilities
src/proxy.ts                Route/session/role guard (Next.js proxy)
tests/                      Frontend API/helper tests
public/                     Static assets
```

## Deployment

Deployed on Vercel as an existing Next.js project. No `vercel.json` is required: the platform detects Next.js, uses `pnpm build`, and serves the App Router output. Dynamic dashboard and service-detail routes are server-rendered; nested route refreshes work with the default Vercel Next.js handling.

In production, set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` to the frontend origin (`https://wedplan-client-ten.vercel.app`) and set `API_INTERNAL_URL` to the backend origin (`https://wedplan-server-vcdp.onrender.com`). Next.js rewrites `/api/*` to the backend, so browser auth, OAuth callbacks, and API calls stay on the frontend origin. This makes Better Auth state/session cookies first-party while the server-side rewrite forwards them to Render. Keep local `.env.local` URLs pointed at `http://localhost:5000`; `API_INTERNAL_URL` is also `http://localhost:5000` locally.

Set `NEXT_PUBLIC_SITE_URL` to the frontend origin. The backend `BETTER_AUTH_URL` must also use the frontend origin so Google returns to `https://wedplan-client-ten.vercel.app/api/auth/callback/google`, which is forwarded through the rewrite. Register that exact URL as an authorized redirect URI in Google Cloud Console. Image optimization is configured for `images.unsplash.com` in `next.config.ts`; other provider images use direct `<img>` URLs from the database.

The backend must allow the Vercel origin in CORS and Better Auth trusted origins. Browser cookies are first-party through the same-origin rewrite, so they do not depend on third-party cookie support. Google OAuth uses one pending flow per browser profile because Better Auth validates a shared state cookie; another tab is blocked until the flow completes or its 10-minute lock expires. See the backend README for the exact backend variables.
