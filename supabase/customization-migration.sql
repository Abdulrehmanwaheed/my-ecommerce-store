-- ============================================================
-- Customization Feature Migration (idempotent — safe to re-run)
-- Products: allow_customization + custom_price
-- Order items: is_customized + custom_notes + custom_images
-- Storage: public 'custom-uploads' bucket for reference photos
-- ============================================================

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS allow_customization BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS custom_price NUMERIC(12, 2) CHECK (custom_price >= 0);

ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS is_customized BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS custom_notes TEXT,
    ADD COLUMN IF NOT EXISTS custom_images TEXT[] NOT NULL DEFAULT '{}';

-- Public storage bucket for customer reference photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-uploads', 'custom-uploads', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous visitors to READ uploaded references (URLs are public)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
          AND policyname = 'public_read_custom_uploads'
    ) THEN
        CREATE POLICY public_read_custom_uploads ON storage.objects
            FOR SELECT TO anon USING (bucket_id = 'custom-uploads');
    END IF;
END $$;