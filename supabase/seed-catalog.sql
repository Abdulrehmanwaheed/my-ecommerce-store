-- ============================================================
-- Seed Catalog: 10 Categories, 100 Products (4 images each)
-- Run this whole file once in the Supabase SQL Editor.
-- Re-running is safe: categories are upserted, and products
-- are inserted only if their slug does not already exist.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CATEGORIES (upsert by slug)
-- ------------------------------------------------------------
INSERT INTO categories (name, slug) VALUES
    ('Smartphones & Tablets', 'cat-mobile'),
    ('Audio & Wearables',    'cat-audio'),
    ('Laptops & Computers',  'cat-computer'),
    ('Home Appliances',      'cat-appliance'),
    ('Kitchen & Dining',     'cat-kitchen'),
    ('Men''s Fashion',        'cat-mens'),
    ('Women''s Fashion',      'cat-womens'),
    ('Beauty & Personal Care','cat-beauty'),
    ('Books & Stationery',   'cat-books'),
    ('Sports & Fitness',     'cat-sports')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- ------------------------------------------------------------
-- 2. PRODUCTS (100, generated deterministically)
--    Format per line:  title|categoryName|categorySlug|price|[F=featured]
-- ------------------------------------------------------------
DO $$
DECLARE
    rec          text;
    parts        text[];
    cat_id       uuid;
    idx          int := 0;
    title        text;
    p_slug       text;
    base_price   numeric;
    featured     boolean;
    img_prefix   text;
BEGIN
    FOREACH rec IN ARRAY ARRAY[
        -- Smartphones & Tablets
        'Galaxy Nova X5|Smartphones|cat-mobile|115000',
        'Note 14 Ultra|Smartphones|cat-mobile|98000',
        'Aurora 5G Pro|Smartphones|cat-mobile|72000',
        'Pulse Max|Smartphones|cat-mobile|45000',
        'Zenith Fold 2|Smartphones|cat-mobile|154000|F',
        'Nova Lite 12|Smartphones|cat-mobile|31000',
        'Bolt X8|Smartphones|cat-mobile|25000',
        'Vista S20 Elite|Smartphones|cat-mobile|39000',
        'Orbit Pro 5G|Smartphones|cat-mobile|87500|F',
        'Flash 4G Duo|Smartphones|cat-mobile|19500',
        -- Audio & Wearables
        'AirBuds Pro TWS|Audio|cat-audio|6500|F',
        'BassBlast Speaker|Audio|cat-audio|12500',
        'Studio ANC Headphones|Audio|cat-audio|28500',
        'TWS Earbuds Lite|Audio|cat-audio|3200',
        'Home Soundbar 2.1|Audio|cat-audio|24500',
        'Neckband Sport|Audio|cat-audio|2200',
        'Clip-On Earbuds|Audio|cat-audio|1800',
        'Karaoke Mic Pro|Audio|cat-audio|5500',
        'Bluetooth FM Radio|Audio|cat-audio|4100',
        'Party Tower 500W|Audio|cat-audio|44500',
        -- Laptops & Computers
        'UltraBook 14 Air|Computers|cat-computer|132000',
        'Gaming Laptop RTX 4060|Computers|cat-computer|295000',
        'Desktop i7 Tower|Computers|cat-computer|86000|F',
        'All-in-One 24 Touch|Computers|cat-computer|98000',
        'FHD Monitor 27 Inch|Computers|cat-computer|27500',
        'Mechanical Keyboard RGB|Computers|cat-computer|14500',
        'Wireless Mouse Silent|Computers|cat-computer|2600',
        'Portable SSD 1TB|Computers|cat-computer|18500',
        'Webcam Pro 4K|Computers|cat-computer|8900',
        'Laser Printer MFP|Computers|cat-computer|42500',
        -- Home Appliances
        'Air Fryer 6.5L|Appliances|cat-appliance|18500|F',
        'Electric Kettle 2L|Appliances|cat-appliance|3200',
        'Robot Vacuum Cleaner|Appliances|cat-appliance|65000',
        'Blender Pro 1000W|Appliances|cat-appliance|8400',
        'Stand Mixer 5L|Appliances|cat-appliance|12500',
        'Rice Cooker 5L|Appliances|cat-appliance|6800',
        'Steam Iron Ceramic|Appliances|cat-appliance|3900',
        'DC Ceiling Fan|Appliances|cat-appliance|14500',
        'Tower Heater|Appliances|cat-appliance|9300',
        'Air Humidifier|Appliances|cat-appliance|5400',
        -- Kitchen & Dining
        'Cookware Set 12pc|Kitchen|cat-kitchen|15500',
        'Knife Block Set|Kitchen|cat-kitchen|7200',
        'Dutch Oven 24cm|Kitchen|cat-kitchen|8800',
        'Glass Storage Set|Kitchen|cat-kitchen|4600',
        'Spice Rack 20 Jars|Kitchen|cat-kitchen|3400',
        'Drip Coffee Maker|Kitchen|cat-kitchen|9800|F',
        'Toaster 2-Slice|Kitchen|cat-kitchen|2900',
        'Pressure Cooker 8L|Kitchen|cat-kitchen|11500',
        'Bamboo Cutting Board|Kitchen|cat-kitchen|1600',
        'Slow Juicer|Kitchen|cat-kitchen|13500',
        -- Men's Fashion
        'Slim Fit Casual Shirt|Mens Fashion|cat-mens|2400',
        'Classic Denim Jacket|Mens Fashion|cat-mens|5800',
        'Fleece Joggers|Mens Fashion|cat-mens|3200',
        'Polo T-Shirt Premium|Mens Fashion|cat-mens|1900',
        'Formal Suit 2-Piece|Mens Fashion|cat-mens|12000|F',
        'Canvas Sneakers|Mens Fashion|cat-mens|4800',
        'Leather Wallet RFID|Mens Fashion|cat-mens|2200',
        'Winter Hoodie Fleece|Mens Fashion|cat-mens|3900',
        'Sports Shorts Dry-Fit|Mens Fashion|cat-mens|1500',
        'Chrono Wristwatch|Mens Fashion|cat-mens|8600',
        -- Women's Fashion
        'Floral Maxi Dress|Womens Fashion|cat-womens|5200',
        'Embroidered Kurti|Womens Fashion|cat-womens|3800',
        'Tote Handbag Leather|Womens Fashion|cat-womens|6400',
        'Chunky Sneakers|Womens Fashion|cat-womens|5600',
        'Pashmina Scarf|Womens Fashion|cat-womens|2900',
        'Festive Anarkali|Womens Fashion|cat-womens|8900|F',
        'Denim Skirt|Womens Fashion|cat-womens|3100',
        'Stud Earrings Set|Womens Fashion|cat-womens|2400',
        'Oud Perfume 100ml|Womens Fashion|cat-womens|7200',
        'Crossbody Bag Mini|Womens Fashion|cat-womens|4100',
        -- Beauty & Personal Care
        'Vitamin C Serum 30ml|Beauty|cat-beauty|2400',
        'Retinol Night Cream|Beauty|cat-beauty|3100',
        'SPF 50 Sunscreen|Beauty|cat-beauty|1500',
        'Charcoal Face Wash|Beauty|cat-beauty|900',
        'Argan Hair Oil|Beauty|cat-beauty|1800',
        'Coffee Body Scrub|Beauty|cat-beauty|1400',
        'Matte Lipstick Set|Beauty|cat-beauty|2900|F',
        'Skincare Gift Box|Beauty|cat-beauty|6500',
        'Jade Facial Roller|Beauty|cat-beauty|1200',
        'Volume Mascara|Beauty|cat-beauty|950',
        -- Books & Stationery
        'Urdu Novel Collection|Books|cat-books|2400',
        'English Grammar Guide|Books|cat-books|1200',
        'IQ Booster Puzzles|Books|cat-books|800',
        'Drawing Set 150pc|Books|cat-books|3500',
        'Notebook 5-Pack|Books|cat-books|1100',
        'Quaid-e-Azam Biography|Books|cat-books|1800|F',
        'Cooking Recipe Book|Books|cat-books|2100',
        'Islamic Studies Revised|Books|cat-books|1600',
        'Creative Writing Journal|Books|cat-books|950',
        'World Atlas Edition|Books|cat-books|2800',
        -- Sports & Fitness
        'Yoga Mat 6mm|Sports|cat-sports|2900',
        'Dumbbell Set 20kg|Sports|cat-sports|14500|F',
        'Resistance Bands|Sports|cat-sports|1800',
        'Football Size 5|Sports|cat-sports|3200',
        'Running Shoes Lite|Sports|cat-sports|6800',
        'Adjustable Skip Rope|Sports|cat-sports|1200',
        'Gym Gloves|Sports|cat-sports|2400',
        'Water Bottle 1L|Sports|cat-sports|800',
        'Tennis Racket|Sports|cat-sports|7600',
        'Fitness Tracker Band|Sports|cat-sports|5800'
    ] LOOP
        idx := idx + 1;
        parts      := string_to_array(rec, '|');
        title      := trim(parts[1]);
        base_price := parts[4]::numeric;
        featured   := coalesce(parts[5] = 'F', false);
        p_slug     := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
        img_prefix := 'https://picsum.photos/seed/' || p_slug;

        SELECT id INTO cat_id FROM categories WHERE slug = parts[3];

        IF cat_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM products WHERE products.slug = p_slug) THEN
            INSERT INTO products (
                title, slug, description,
                price, original_price, stock,
                images, category_id, attributes, is_featured, created_at
            ) VALUES (
                title,
                p_slug,
                'Premium ' || title || ' from the ' || parts[2] ||
                ' collection — built to last, delivered nationwide with Cash on Delivery, ' ||
                'and backed by our 7-day easy return promise.',
                base_price,
                round(base_price * 1.2 / 500) * 500,           -- realistic struck-through price
                3 + ((idx * 13) % 45),                          -- stock 3..47
                ARRAY[
                    img_prefix || '-1/900/900',
                    img_prefix || '-2/900/900',
                    img_prefix || '-3/900/900',
                    img_prefix || '-4/900/900'
                ],
                cat_id,
                jsonb_build_object(
                    'warranty', CASE
                        WHEN base_price >= 100000 THEN '1 Year'
                        WHEN base_price >= 10000  THEN '6 Months'
                        ELSE 'No Warranty'
                    END,
                    'condition', 'Brand New',
                    'colors', jsonb_build_array('Black', 'Grey')
                ),
                featured,
                now() - (idx || ' hours')::interval
            );
        END IF;
    END LOOP;

    RAISE NOTICE 'Seeded catalog: % categories, % products',
        (SELECT count(*) FROM categories),
        (SELECT count(*) FROM products);
END $$;

-- ------------------------------------------------------------
-- 3. VERIFY
-- ------------------------------------------------------------
SELECT c.name                          AS category,
       count(p.id)                     AS products
FROM   categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP  BY c.name
ORDER  BY products DESC, category;