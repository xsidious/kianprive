# KIAN Privé Backend + CMS Runbook

## 1) Environment Variables

Required:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_BASIC`
- `STRIPE_PRICE_PREMIUM`

## 2) Database Setup

```bash
npm run prisma:generate
npx prisma migrate dev --name backend-cms-foundation
```

## 3) Admin Access

Admin paths:
- `/admin`
- `/admin/cms`
- `/admin/blog`
- `/admin/commerce`
- `/admin/analytics`
- `/admin/settings`

Access requires user role:
- `ADMIN`
- `EDITOR`
- `OPERATIONS`

## 4) Core API Surface

### CMS
- `GET/POST /api/admin/cms/pages`
- `GET/PATCH /api/admin/cms/pages/:id`

### Blog
- `GET/POST /api/admin/blog/posts`
- `PATCH /api/admin/blog/posts/:id`

### Commerce
- `GET/POST /api/admin/commerce/products`
- `GET /api/admin/commerce/orders`
- `POST /api/admin/commerce/orders/:id/fulfillments`
- `GET /api/commerce/products`
- `POST /api/commerce/cart`
- `POST /api/commerce/orders`
- `GET /api/commerce/orders/:id/tracking`

### Analytics
- `POST /api/analytics/events`
- dashboard at `/admin/analytics`

### Stripe Ops
- `GET /api/admin/integrations/stripe/status`
- webhook: `/api/stripe/webhook`

## 5) Stripe Webhook Notes

Webhook processing includes:
- signature verification
- event idempotency via `IdempotencyKey`
- subscription activation
- order payment status updates
- refund status updates

## 6) QA Checklist

- Create/update CMS page from admin API and verify storefront fallback/content behavior.
- Create blog post in published state and verify it appears on `/blog`.
- Add product to cart and ensure `/api/commerce/cart` creates a DB cart.
- Submit checkout and verify order creation via `/api/commerce/orders`.
- Create fulfillment for an order and verify tracking endpoint output.
- Validate analytics insert via `/api/analytics/events`.
- Validate Stripe status endpoint configuration state.

## 7) Deployment Notes (Vercel)

- Add all env vars in Vercel project settings.
- Configure Stripe webhook endpoint to Vercel production URL.
- Run migrations on production DB before first traffic cutover.
- Verify `/api/ops/health` after deployment.
