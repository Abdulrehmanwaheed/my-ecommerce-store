-- ============================================================
-- E-commerce Platform Schema (multi-tenant / generic)
-- Designed for Supabase (PostgreSQL 15+)
-- ============================================================

-- ------------------------------------------------------------
-- 1. CATEGORIES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. PRODUCTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    description     TEXT,
    price           NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    original_price  NUMERIC(12, 2) CHECK (original_price >= 0),
    stock           INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    images          TEXT[] NOT NULL DEFAULT '{}',
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    attributes      JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured  ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at   ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_attributes   ON products USING gin (attributes);

-- ------------------------------------------------------------
-- 3. CUSTOMERS (guest checkout friendly)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       TEXT NOT NULL,
    phone_whatsapp  VARCHAR(20) UNIQUE,
    city            TEXT,
    address         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_whatsapp);

-- ------------------------------------------------------------
-- 4. ORDERS (COD + Online payment support)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number       SERIAL UNIQUE NOT NULL,
    customer_id        UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name      TEXT NOT NULL,
    phone_whatsapp     TEXT NOT NULL,
    city               TEXT,
    address            TEXT,
    total_amount       NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_fee       NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    payment_method     TEXT NOT NULL CHECK (payment_method IN ('COD', 'ONLINE_CARD', 'MOBILE_WALLET')),
    payment_status     TEXT NOT NULL DEFAULT 'Unpaid'
                       CHECK (payment_status IN ('Unpaid', 'Paid', 'Failed', 'Refunded')),
    order_status       TEXT NOT NULL DEFAULT 'Pending'
                       CHECK (order_status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    payment_gateway_ref TEXT,
    notes              TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number     ON orders(order_number DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id      ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at       ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method   ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status   ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status     ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_gateway_ref      ON orders(payment_gateway_ref);

-- ------------------------------------------------------------
-- 5. ORDER ITEMS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity    INT NOT NULL CHECK (quantity > 0),
    unit_price  NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ------------------------------------------------------------
-- 6. PAYMENT LOGS (webhook / gateway debugging)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
    gateway     TEXT NOT NULL,
    payload     JSONB NOT NULL DEFAULT '{}'::jsonb,
    status      TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id   ON payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_gateway    ON payment_logs(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_logs_payload    ON payment_logs USING gin (payload);

-- ------------------------------------------------------------
-- Helper: order total trigger
-- Recalculates total_amount = SUM(order_items.unit_price * quantity)
-- on item insert/update/delete.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION recalc_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET total_amount = COALESCE(
        (SELECT SUM(oi.quantity * oi.unit_price)
         FROM order_items oi
         WHERE oi.order_id = COALESCE(NEW.order_id, OLD.order_id)),
        0
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_items_recalc ON order_items;
CREATE TRIGGER trg_order_items_recalc
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION recalc_order_total();

-- ------------------------------------------------------------
-- Row Level Security: disabled by default (off), enable per tenant
-- ------------------------------------------------------------
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs    ENABLE ROW LEVEL SECURITY;