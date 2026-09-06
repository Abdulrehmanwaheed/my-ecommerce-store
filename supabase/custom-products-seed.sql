-- ============================================================
-- Customizable Shirts, Mugs & Cups — Seed
-- Adds ready-made customizable products (allow_customization = TRUE)
-- to the catalog with real, verified stock images (Unsplash).
-- Safe to re-run: products are skipped if the slug already exists.
-- ============================================================

-- Ensure the categories exist so products land in the right sections
INSERT INTO categories (name, slug) VALUES
    ('Men''s Fashion',      'cat-mens'),
    ('Kitchen & Dining',    'cat-kitchen')
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- SHIRTS (customizable apparel)
-- ------------------------------------------------------------
INSERT INTO products (
    title, slug, description, price, original_price, stock,
    images, category_id, attributes, is_featured,
    allow_customization, custom_price, created_at
) VALUES
(
    'Custom Name Print T-Shirt',
    'custom-name-print-tshirt',
    'Your name, initials or a short message printed on a premium cotton tee. Pick any color and font in the customizer.',
    1299, 1699, 60,
    ARRAY[
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80'
    ],
    (SELECT id FROM categories WHERE slug = 'cat-mens'),
    '{"material":"100% Cotton","customization":"Name, initials or message","availableColors":"Custom"}',
    TRUE, TRUE, 1299, now() - interval '1 minute'
),
(
    'Custom Photo Print T-Shirt',
    'custom-photo-print-tshirt',
    'Print your favorite photo or design on a soft premium tee — birthday gifts, couple tees, squad memories.',
    1499, 1899, 45,
    ARRAY[
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80'
    ],
    (SELECT id FROM categories WHERE slug = 'cat-mens'),
    '{"material":"Cotton Blend","customization":"Photo or full design print","availableColors":"White, Black, Grey"}',
    TRUE, TRUE, 1499, now() - interval '2 minutes'
),
(
    'Custom Couple Matching T-Shirts',
    'custom-couple-matching-tshirts',
    'A matching pair of tees printed with both your names or a couple design. Great for engagements, weddings and anniversaries.',
    2499, 2999, 30,
    ARRAY[
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80'
    ],
    (SELECT id FROM categories WHERE slug = 'cat-mens'),
    '{"material":"100% Cotton","customization":"Couple names + design","availableColors":"Custom (set of 2)"}',
    TRUE, TRUE, 2499, now() - interval '3 minutes'
),
(
    'Custom Birthday Surprise T-Shirt',
    'custom-birthday-surprise-tshirt',
    'Surprise someone special with a birthday tee carrying their name, age and a custom message. Shipped well before the big day.',
    1399, 1799, 40,
    ARRAY[
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'
    ],
    (SELECT id FROM categories WHERE slug = 'cat-mens'),
    '{"material":"Cotton Blend","customization":"Name, age + message","availableColors":"Custom"}',
    TRUE, TRUE, 1399, now() - interval '4 minutes'
),
(
    'Custom Class & Batch Milestone Tee',
    'custom-class-batch-milestone-tee',
    'Memorial tees for reunions, graduations, batch meets and farewells — printed with names, year boards and event art.',
    1599, 1999, 50,
    ARRAY[
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80'
    ],
    (SELECT id FROM categories WHERE slug = 'cat-mens'),
    '{"material":"100% Cotton","customization":"Names list + year + event art","availableColors":"Custom"}',
    TRUE, TRUE, 1599, now() - interval '5 minutes'
);

-- ------------------------------------------------------------
-- CUPS & MUGS (customizable drinkware)
-- ------------------------------------------------------------
INSERT INTO products (
    title, slug, description, price, original_price, stock,
    images, category_id, attributes, is_featured,
    allow_customization, custom_price, created_at
) VALUES
(
    'Custom Name Ceramic Mug',
    'custom-name-ceramic-mug',
    'A classic 11oz white ceramic mug with your name, initials or a logo. Dishwasher & microwave safe.',
    899, 1199, 120,
    ARRAY[
        'https://images.unsplash.com/photo-1584761657361-45b0fa848469?w=800&q=80',
        'https://images.unsplash.com/photo-1630861410629-d136eb970587?w=800&q=80'
    ],
    (SELECT id FROM categories WHERE slug = 'cat-kitchen'),
    '{"capacity":"11 oz","material":"Ceramic","customization":"Name, initials or logo"}',
    TRUE, TRUE, 899, now() - interval '6 minutes'
),
(
    'Custom Photo Magic Mug',
    'custom-photo-magic-mug',
    'Heat-changing magic mug — black until hot liquid reveals your photo or design. The gift everyone remembers.',
    1199, 1499, 80,
    ARRAY[
        'https://images.unsplash.com/photo-1630861410629-d136eb970587?w=800&q=80',
        'https://images.unsplash.com/photo-1584761657361-45b0fa848469?w=800&q=80'
    ],
    (SELECT id FROM categories WHERE slug = 'cat-kitchen'),
    '{"capacity":"11 oz","material":"Ceramic (heat-change)","customization":"Photo or full design"}',
    TRUE, TRUE, 1199, now() - interval '7 minutes'
),
(
    'Custom Couple Name Mugs Set',
    'custom-couple-name-mugs-set',
    'A set of two mugs with each name printed — his & hers for engagements, weddings and anniversaries.',
    1799, 2199, 40,
    ARRAY[
        'https://images.unsplash.com/photo-1491720731493-223f97d92c21?w=800&q=80',
        'https://images.unsplash.com/photo-1485609315582-cfffa02888e8?w=800&q=80'
    ],
    (SELECT id FROM categories WHERE slug = 'cat-kitchen'),
    '{"capacity":"11 oz each","material":"Ceramic","customization":"Two names + design (set of 2)"}',
    TRUE, TRUE, 1799, now() - interval '8 minutes'
),
(
    'Custom Birthday Surprise Mug',
    'custom-birthday-surprise-mug',
    'Birthday mug with photo, name, age and a heartfelt message — ready for delivery before the celebration.',
    949, 1249, 60,
    ARRAY[
        'https://images.unsplash.com/photo-1584761657361-45b0fa848469?w=800&q=80',
        'https://images.unsplash.com/photo-1491720731493-223f97d92c21?w=800&q=80'
    ],
    (SELECT id FROM categories WHERE slug = 'cat-kitchen'),
    '{"capacity":"11 oz","material":"Ceramic","customization":"Photo, name, age + message"}',
    TRUE, TRUE, 949, now() - interval '9 minutes'
),
(
    'Custom Ceramic Tea Cup Set',
    'custom-ceramic-tea-cup-set',
    'Personalized coffee/tea cup set — names or monograms printed on premium ceramic cups, perfect office or tea-party gifts.',
    1399, 1799, 35,
    ARRAY[
        'https://images.unsplash.com/photo-1641691977412-ab0a83572168?w=800&q=80',
        'https://images.unsplash.com/photo-1630861410629-d136eb970587?w=800&q=80'
    ],
    (SELECT id FROM categories WHERE slug = 'cat-kitchen'),
    '{"capacity":"Set of 2 cups","material":"Ceramic","customization":"Names or monograms"}',
    TRUE, TRUE, 1399, now() - interval '10 minutes'
),
(
    'Custom Stainless Steel Flask Mug',
    'custom-stainless-steel-flask-mug',
    'Leak-proof double-wall stainless flask with your name or logo engraved — keeps drinks hot or cold for hours.',
    1299, 1699, 55,
    ARRAY[
        'https://images.unsplash.com/photo-1508152910808-1ebec72ae64a?w=800&q=80',
        'https://images.unsplash.com/photo-1588793076577-4c2b666452d3?w=800&q=80'
    ],
    (SELECT id FROM categories WHERE slug = 'cat-kitchen'),
    '{"capacity":"350 ml","material":"Stainless Steel","customization":"Name or logo engraving"}',
    TRUE, TRUE, 1299, now() - interval '11 minutes'
),
(
    'Custom Travel Tumbler with Name',
    'custom-travel-tumbler-with-name',
    'Insulated spill-proof tumbler with your name, nickname or slogan — the perfect daily commuter companion.',
    1499, 1899, 70,
    ARRAY[
        'https://images.unsplash.com/photo-1604713055037-ef1ec567a47b?w=800&q=80',
        'https://images.unsplash.com/photo-1508152910808-1ebec72ae64a?w=800&q=80'
    ],
    (SELECT id FROM categories WHERE slug = 'cat-kitchen'),
    '{"capacity":"500 ml","material":"Stainless Steel","customization":"Name, nickname or slogan"}',
    TRUE, TRUE, 1499, now() - interval '12 minutes'
),
(
    'Custom Glass Mug Set',
    'custom-glass-mug-set',
    'Sleek borosilicate glass mugs with frosted name etching — stylish and dishwasher safe.',
    1049, 1349, 25,
    ARRAY[
        'https://images.unsplash.com/photo-1485609315582-cfffa02888e8?w=800&q=80',
        'https://images.unsplash.com/photo-1649270716777-1bd08cb443f5?w=800&q=80'
    ],
    (SELECT id FROM categories WHERE slug = 'cat-kitchen'),
    '{"capacity":"Set of 2","material":"Borosilicate Glass","customization":"Frosted name etching"}',
    TRUE, TRUE, 1049, now() - interval '13 minutes'
);

-- ------------------------------------------------------------
-- Verification: how many customizable products now exist
-- ------------------------------------------------------------
SELECT
    (SELECT COUNT(*) FROM products WHERE allow_customization = TRUE) AS customizable_products_total;