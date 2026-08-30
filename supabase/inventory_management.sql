DROP FUNCTION IF EXISTS create_order_with_stock_update;

CREATE OR REPLACE FUNCTION create_order_with_stock_update(
    p_customer_id UUID,
    p_customer_name TEXT,
    p_phone_whatsapp TEXT,
    p_city TEXT,
    p_address TEXT,
    p_total_amount NUMERIC,
    p_shipping_fee NUMERIC,
    p_payment_method TEXT,
    p_notes TEXT,
    p_items JSONB
)
RETURNS TABLE (p_order_id UUID, p_order_number INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_order_number INTEGER;
    v_item JSONB;
    v_product_id UUID;
    v_quantity INT;
    v_stock INT;
BEGIN
    WITH new_order AS (
        INSERT INTO orders (
            customer_id, customer_name, phone_whatsapp, city, address,
            total_amount, shipping_fee, payment_method, payment_status, order_status, notes
        )
        VALUES (
            p_customer_id, p_customer_name, p_phone_whatsapp, p_city, p_address,
            p_total_amount, p_shipping_fee, p_payment_method, 'Unpaid', 'Pending', p_notes
        )
        RETURNING id, order_number
    )
    SELECT id, order_number INTO v_order_id, v_order_number FROM new_order;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_quantity := (v_item->>'quantity')::INT;

        SELECT stock INTO v_stock FROM products WHERE id = v_product_id FOR UPDATE;

        IF v_stock < v_quantity THEN
            RAISE EXCEPTION 'Not enough stock for product %', v_product_id;
        END IF;

        INSERT INTO order_items (
            order_id, product_id, quantity, unit_price, is_customized, custom_notes, custom_images
        )
        VALUES (
            v_order_id,
            v_product_id,
            v_quantity,
            (v_item->>'unit_price')::NUMERIC,
            (v_item->>'is_customized')::BOOLEAN,
            v_item->>'custom_notes',
            (SELECT COALESCE(array_agg(img_url), '{}') FROM jsonb_array_elements_text(v_item->'custom_images') AS imgs(img_url))
        );

        UPDATE products
        SET stock = stock - v_quantity
        WHERE id = v_product_id;
    END LOOP;

    RETURN QUERY SELECT v_order_id, v_order_number;
END;
$$;
