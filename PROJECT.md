# Multi-Client E-Commerce Template — Build Documentation

A generic, multi-tenant Next.js e-commerce storefront built for fast Pakistani store client onboarding. Fully functional in **demo mode** (no database credentials needed) and drops straight into Supabase when env vars are added.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 7 · Tailwind v4 · shadcn/ui (Base UI "base-nova") · Zustand · Framer Motion · Supabase (PostgreSQL)

---

## Quick Start

```bash
npm install
npm run dev            # http://localhost:3000
npx tsx src/lib/test-backend.ts   # 27 backend logic checks (mock mode)
npx tsx src/lib/test-admin.ts     # admin flow checks (mock mode)
npx tsc --noEmit                  # typecheck
npx next build                    # production build
```

> **Demo mode:** without `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`, every data call transparently falls back to in-memory mock data (`src/lib/backend-demo.ts`) with a one-time console notice. Set the env vars (and `SUPABASE_SERVICE_ROLE_KEY`) to go live — no code changes required.

---

## Project Map

```
src/
├── store.config.ts            # Central client config (brand, currency, shipping, payments, gateways)
├── types/
│   ├── config.ts              # StoreConfig interface
│   └── database.ts            # Exact DB row types + input payloads (CreateOrderInput, CreateProductInput)
├── lib/
│   ├── supabase/              # client.ts (browser), server.ts (Server Actions), admin.ts (service role)
│   ├── payments/              # gateway.ts (provider contract + registry), mock-gateway.ts, process-webhook.ts
│   ├── backend-demo.ts        # Mock backend: 6 demo products, orders, admin helpers (auto-fallback)
│   ├── cart-store.ts          # Zustand cart (persisted to localStorage)
│   ├── format.ts              # formatPrice() using STORE_CONFIG currency
│   ├── test-backend.ts        # Mock backend test suite (27 checks)
│   └── test-admin.ts          # Admin flow test suite
├── app/
│   ├── page.tsx               # Hero + Bento Grid + filterable catalog
│   ├── product/[slug]/        # Product detail: zoom viewer, spec pills, Add to Bag, WhatsApp buy
│   ├── checkout/              # Single-page COD/online checkout
│   ├── order-success/[orderId]# Animated invoice receipt + WhatsApp tracking
│   ├── admin/                 # Dark dashboard: metrics, orders table, status dropdowns, product modal
│   ├── actions/               # create-order.ts, admin.ts (server actions)
│   └── api/payments/          # initiate, webhook, mock-checkout routes
└── components/
    ├── layout/                # Header (floating navbar) + CartDrawer (shadcn Sheet)
    ├── storefront/            # BentoGrid, ProductGrid (tabs), ProductCard
    ├── product/               # ImageViewer, BuyActions, AddToCartButton
    ├── checkout/              # CheckoutForm
    ├── admin/                 # AdminDashboard
    └── ui/                    # shadcn primitives (button, sheet, dialog, select, accordion, …)
supabase/
└── schema.sql                 # Production Postgres schema (6 tables + trigger + indexes + RLS)
```

---

## 1. Central Config Engine (`src/store.config.ts`)

Single `STORE_CONFIG` object any client can be onboarded with by editing one file (+ `.env.local`):

| Section | Contents |
|---|---|
| `brand` | name, tagline, logoUrl, supportEmail, supportPhone |
| `region` | currencySymbol `Rs.`, currencyCode `PKR`, countryCode `PK` |
| `paymentMethods` | `cod`, `cardPayment` toggles (drive UI + server validation) |
| `shipping` | flatRateFee `200`, freeShippingThreshold `5000`, 12 cities |
| `whatsapp` | phoneNumber, defaultMessage |
| `gateways` | payfast (merchantId, securedKey), safepay (apiKey) |

Typed strict via `StoreConfig` in `src/types/config.ts`.

## 2. Database Schema (`supabase/schema.sql`)

Supabase-ready PostgreSQL (PG 13+ built-ins only):

- `categories` — UUID PK, unique slug
- `products` — `attributes JSONB DEFAULT '{}'` with GIN index, `images TEXT[]`, price/stock CHECKs
- `customers` — unique `phone_whatsapp` (guest checkout upserts)
- `orders` — serial `order_number`, CHECKs on `payment_method` (`COD`/`ONLINE_CARD`/`MOBILE_WALLET`), `payment_status` (`Unpaid`/`Paid`/`Failed`/`Refunded`), `order_status` (`Pending`/`Processing`/`Shipped`/`Delivered`/`Cancelled`), `payment_gateway_ref`
- `order_items` — snapshots `unit_price`, cascade delete
- `payment_logs` — JSONB `payload` for webhook auditing
- `recalc_order_total()` trigger — auto maintains `orders.total_amount`
- Indexes on every lookup column, RLS enabled (policies to be defined per tenant)

## 3. TypeScript DB Types (`src/types/database.ts`)

Mirror the SQL exactly (snake_case field names, correct nullability) with reusable unions (`PaymentMethod`, `PaymentStatus`, `OrderStatus`, `OrderItem`, `PaymentLog`) plus `CreateOrderInput` and `CreateProductInput` payloads.

## 4. Supabase Clients (`src/lib/supabase/`)

- `client.ts` — browser client for React components (`NEXT_PUBLIC_*`)
- `server.ts` — Server Action client using `cookies()` (getAll/setAll, middleware-friendly)
- `admin.ts` — service-role client for webhooks/backend mutations (`persistSession: false`)
- All three log a helpful warning if env vars are missing and throw on use.

## 5. Order Server Action (`src/app/actions/create-order.ts`)

1. Validates payload + payment method against `STORE_CONFIG.paymentMethods`
2. Loads real product prices from DB → computes subtotal, shipping (free ≥ threshold), grand total **server-side**
3. Upserts customer on unique `phone_whatsapp`
4. Inserts order (`Unpaid`/`Pending` for both COD and online) + `order_items`
5. Returns `{ redirectUrl }` for COD or `{ requiresPayment, gatewayUrl }` for online payment

## 6. Payment Gateways (`src/lib/payments/` + `src/app/api/payments/`)

- **Contract:** `PaymentGatewayHandler` (`initiate`, `verifyWebhook`) + registry driven by `PAYMENT_GATEWAY_PROVIDER` (defaults to `mock`). PayFast/Safepay/JazzCash drop in by implementing the interface.
- `POST /api/payments/initiate` — looks up order by `orderId` (query/body), guards COD/already-paid, returns gateway `checkoutUrl`, audits `payment_logs`
- `POST /api/payments/webhook` — shared `processWebhook` pipeline: verify → audit → mark `Paid` + `Processing` with `payment_gateway_ref` (idempotent), `Failed` on failure
- `GET /api/payments/mock-checkout` — simulates gateway return, fires the webhook pipeline, redirects to order success

## 7. Demo Backend (`src/lib/backend-demo.ts`)

Auto-detects Supabase env vars; otherwise serves in-memory data:

- `fetchProducts()`, `fetchProductBySlug(slug)`, `fetchOrderById(id)`
- `createOrderDemo(input)` — logic mirror of the create-order server action
- Admin: `fetchAllOrders()`, `updateOrderStatus()` (validates statuses), `adminCreateProduct()` (JSONB attributes)
- 6 demo products across **Smart Tech** / **Home & Utility** with rich JSONB attributes (warranty, colors arrays, capacity, etc.)
- Test suites: `test-backend.ts` (27 checks — COD, online, shipping math, upserts, JSONB) and `test-admin.ts`

## 8–13. Storefront UI

| Step | URL | Highlights |
|---|---|---|
| 8. Layout + Cart | global header | Floating translucent navbar (`backdrop-blur`), logo from config, WhatsApp badge, cart pill; sliding sheet drawer with quantity steppers, free-shipping progress bar ("Add Rs. X for Free Delivery"), checkout forward |
| 9. Homepage | `/` | Dark hero with animated glowing grid + "Next-Gen Essentials. Instant COD Shipping."; asymmetric Bento Grid (2×2 featured tech w/ hover glassmorphism, COD pitch, trending kitchen, free-delivery chip); tabbed catalog (All / Smart Tech / Home & Utility) with framer-motion cards and Quick Add |
| 10. Product detail | `/product/[slug]` | Sticky viewer w/ cursor-follow zoom + thumbnails, rating + stock badges, dynamic spec pills from JSONB attributes, Add to Bag, emerald One-Click WhatsApp buy (pre-filled product + price), config-driven accordion (Specs / Shipping / Payment) |
| 11. Checkout | `/checkout` | 2-column: shipping form (11-digit PK WhatsApp validator, city selector from config) + payment radios (COD / Card); sticky summary with Free/`Rs. 200` shipping badge and Total Payable; submit → `createOrder` → success redirect; cart cleared |
| 12. Invoice | `/order-success/[orderId]` | SVG checkmark draw animation, dark receipt (Order #, address, item breakdown, highlighted COD amount payable), "Track Order Status on WhatsApp" with order number pre-filled |
| 13. Admin | `/admin` | Forced-dark dashboard: revenue/orders/pending-COD metrics, full orders table, inline status dropdown quick-action (optimistic + revert-on-error), Add Product modal with dynamic JSONB attribute editor |

---

## Going Live Checklist

1. `supabase/schema.sql` in Supabase SQL editor
2. `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=…
   NEXT_PUBLIC_SUPABASE_ANON_KEY=…
   SUPABASE_SERVICE_ROLE_KEY=…
   PAYMENT_GATEWAY_PROVIDER=payfast | safepay | jazzcash   (default: mock)
   ```

3. Seed `categories` + `products` (or use the Admin Add Product modal)
4. Implement a real gateway class implementing `PaymentGatewayHandler` and return it from `getActiveGateway()`
5. Add Supabase Row-Level-Security policies for `orders`/`customers` (currently enabled without policies)
6. Onboard a new client: edit `src/store.config.ts` + `.env.local` — done.