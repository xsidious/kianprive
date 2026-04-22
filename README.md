# KIAN Privé Platform

Luxury concierge wellness platform with public marketing pages, gated premium content, role-aware auth, and subscription paywall scaffolding.

## Stack
- Next.js App Router + TypeScript + Tailwind
- Prisma + PostgreSQL
- NextAuth credentials auth
- Stripe checkout/webhook scaffold
- Framer Motion

## Setup
1. Install dependencies:
   - `npm install`
2. Copy env template:
   - `cp .env.example .env` (or create `.env` manually on Windows)
3. Fill required variables in `.env`:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_BASIC`
   - `STRIPE_PRICE_PREMIUM`
   - `NEXT_PUBLIC_APP_URL`
4. Run Prisma:
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
5. Start app:
   - `npm run dev`

## Docker Local Testing
1. From project root run:
   - `docker compose up --build -d`
2. Open:
   - `http://localhost:3000`
3. Stop stack:
   - `docker compose down`
4. Stop and remove DB volume:
   - `docker compose down -v`

## Stripe Local Webhook Testing
1. Install Stripe CLI and login.
2. Run:
   - `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Copy generated webhook secret into `STRIPE_WEBHOOK_SECRET`.

## Access Control
- Middleware hard-protects:
  - `/book-online`
  - `/practitioners-athletes`
- Icoone training page (`/icoone-training`) uses premium overlay logic:
  - guest: blurred + unlock CTA
  - logged in/no premium: paywall overlay
  - active premium: full content

## Routes
- Public: `/`, `/services`, `/about`, `/corporate-wellness`, `/contact`, `/blog`, `/shop`, `/events-retreats`
- Auth: `/login`, `/signup`
- Premium/Gated: `/icoone-training`, `/book-online`, `/practitioners-athletes`
- Subscription: `/pricing`
- Member area: `/dashboard`, `/dashboard/subscription`, `/dashboard/profile`
- Optional admin: `/admin`

## Notes
- Stripe is hybrid-ready: if Stripe keys are missing, checkout endpoint fails gracefully with guidance.
- Email/CMS hooks are scaffolded in `src/lib/email.ts` and `src/lib/content.ts`.
- All provided branded images are now used from `public/images`.
