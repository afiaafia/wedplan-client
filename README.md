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
- Admin dashboard: platform statistics, user search/block/unblock, service moderation, booking monitoring, and read-only transaction history.

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
| `NEXT_PUBLIC_API_URL` | Browser | Backend API base URL for browser-side data requests |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Browser | Better Auth base URL (backend origin) |
| `NEXT_PUBLIC_SITE_URL` | Browser | Frontend origin used in user-facing links |
| `API_INTERNAL_URL` | Server only | Internal backend base URL for server components; takes precedence over public URL variables |

`NEXT_PUBLIC_*` values are embedded in the browser bundle. Never place secrets in them. Secrets such as the Better Auth secret, MongoDB URI, ImgBB key, and Stripe secret key belong only on the backend. See `.env.example` for local defaults.

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

Required Vercel environment variables are the same names shown above, with production values set in the Vercel dashboard. `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` must point to the deployed backend. Image optimization is configured for `images.unsplash.com` in `next.config.ts`; other provider images use direct `<img>` URLs from the database.

Cross-site authentication requires the backend to allow the Vercel origin in CORS and Better Auth trusted origins, and to configure session cookies for cross-site credentialed requests. See the backend README for the exact backend variables.
