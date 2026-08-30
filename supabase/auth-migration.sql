-- ============================================================
-- Customer Auth Migration
-- Adds email + auth.users link to customers, and creates the
-- customer_addresses table (an "address book" with one default).
-- ============================================================

-- 1. Add authentication columns to customers
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Address book table
CREATE TABLE IF NOT EXISTS customer_addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    phone_whatsapp  TEXT NOT NULL,
    city            TEXT,
    address         TEXT,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id
    ON customer_addresses(customer_id);

-- 3. RLS (guest checkout stays per-phone; logged-in users manage their own)
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- Logged-in users can read/insert/update/delete only their own addresses.
-- We map to customers via auth_user_id = auth.uid().
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'customer_addresses'
          AND policyname = 'auth_read_own_addresses'
    ) THEN
        CREATE POLICY auth_read_own_addresses ON customer_addresses
            FOR SELECT TO anon, authenticated
            USING (
                customer_id IN (
                    SELECT c.id FROM customers c
                    WHERE c.auth_user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'customer_addresses'
          AND policyname = 'auth_insert_own_addresses'
    ) THEN
        CREATE POLICY auth_insert_own_addresses ON customer_addresses
            FOR INSERT TO anon, authenticated
            WITH CHECK (
                customer_id IN (
                    SELECT c.id FROM customers c
                    WHERE c.auth_user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'customer_addresses'
          AND policyname = 'auth_update_own_addresses'
    ) THEN
        CREATE POLICY auth_update_own_addresses ON customer_addresses
            FOR UPDATE TO anon, authenticated
            USING (
                customer_id IN (
                    SELECT c.id FROM customers c
                    WHERE c.auth_user_id = auth.uid()
                )
            )
            WITH CHECK (
                customer_id IN (
                    SELECT c.id FROM customers c
                    WHERE c.auth_user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'customer_addresses'
          AND policyname = 'auth_delete_own_addresses'
    ) THEN
        CREATE POLICY auth_delete_own_addresses ON customer_addresses
            FOR DELETE TO anon, authenticated
            USING (
                customer_id IN (
                    SELECT c.id FROM customers c
                    WHERE c.auth_user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- 4. Allow authenticated users to read/update their own customer row
--    so checkout can auto-fill their profile details.
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'customers'
          AND policyname = 'auth_read_own_profile'
    ) THEN
        CREATE POLICY auth_read_own_profile ON customers
            FOR SELECT TO anon, authenticated
            USING (auth_user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'customers'
          AND policyname = 'auth_update_own_profile'
    ) THEN
        CREATE POLICY auth_update_own_profile ON customers
            FOR UPDATE TO anon, authenticated
            USING (auth_user_id = auth.uid())
            WITH CHECK (auth_user_id = auth.uid());
    END IF;
END $$;
