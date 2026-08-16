import {
  createOrderDemo,
  fetchOrderById,
  fetchProductBySlug,
  fetchProducts,
  isSupabaseConfigured,
} from './backend-demo';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
  console.log(`PASS: ${message}`);
}

async function main(): Promise<void> {
  console.log('--- Backend demo test run ---');
  console.log(`Supabase configured: ${isSupabaseConfigured() ? 'yes (real DB will be used)' : 'no (mock data active)'}`);

  const products = await fetchProducts();
  assert(products.length === 6, `fetchProducts returns 6 demo products (got ${products.length})`);

  const earbuds = await fetchProductBySlug('wireless-earbuds-pro');
  assert(earbuds !== null, 'fetchProductBySlug finds "wireless-earbuds-pro"');
  assert(earbuds?.attributes.warranty === '1 Year', 'JSONB attributes readable (warranty)');

  const jacket = await fetchProductBySlug('bluetooth-speaker-boom');
  assert(
    Array.isArray(jacket?.attributes.colors) && jacket?.attributes.colors.includes('Blue'),
    'JSONB attributes readable (colors array)',
  );

  const perfume = await fetchProductBySlug('electric-kettle-15l');
  assert(perfume?.attributes.capacity === '1.5L', 'JSONB attributes readable (capacity)');

  const missing = await fetchProductBySlug('does-not-exist');
  assert(missing === null, 'fetchProductBySlug returns null for unknown slug');

  const codResult = await createOrderDemo({
    customer_name: 'Ali Khan',
    phone_whatsapp: '03001234567',
    city: 'Karachi',
    address: 'House 12, Block 5',
    payment_method: 'COD',
    items: [
      { product_id: 'demo-prod-001', quantity: 2 },
      { product_id: 'demo-prod-003', quantity: 1 },
    ],
    notes: 'Call before delivery',
  });

  assert(codResult.success === true, 'COD order placement succeeds');
  assert(codResult.orderId !== undefined, 'COD order returns orderId');
  assert(
    codResult.redirectUrl === `/order-success/${codResult.orderId}`,
    'COD order returns correct redirectUrl',
  );

  const codFetched = await fetchOrderById(codResult.orderId!);
  assert(codFetched !== null, 'COD order retrievable via fetchOrderById');
  assert(codFetched?.order.payment_status === 'Unpaid', 'COD order payment_status is Unpaid');
  assert(codFetched?.order.order_status === 'Pending', 'COD order order_status is Pending');
  assert(codFetched?.order.payment_method === 'COD', 'COD order payment_method is COD');
  assert(codFetched?.items.length === 2, 'COD order has 2 items');

  const codSubtotal = 4500 * 2 + 3500; // 12500
  const codShipping = codSubtotal >= 5000 ? 0 : 200; // free shipping applies
  assert(
    codFetched?.order.total_amount === codSubtotal + codShipping,
    `COD order total computed server-side (total = ${codFetched?.order.total_amount})`,
  );
  assert(codFetched?.order.shipping_fee === 0, 'COD order got free shipping above threshold');

  const onlineResult = await createOrderDemo({
    customer_name: 'Sara Ahmed',
    phone_whatsapp: '03111234567',
    city: 'Lahore',
    address: 'Street 4, DHA',
    payment_method: 'ONLINE_CARD',
    items: [{ product_id: 'demo-prod-005', quantity: 3 }],
  });

  assert(onlineResult.success === true, 'Online payment order placement succeeds');
  assert(onlineResult.requiresPayment === true, 'Online order sets requiresPayment: true');
  assert(
    onlineResult.gatewayUrl === `/api/payments/initiate?orderId=${onlineResult.orderId}`,
    'Online order returns gateway init URL',
  );

  const onlineFetched = await fetchOrderById(onlineResult.orderId!);
  assert(onlineFetched !== null, 'Online order retrievable via fetchOrderById');
  assert(onlineFetched?.order.payment_status === 'Unpaid', 'Online order starts Unpaid');
  assert(onlineFetched?.order.order_status === 'Pending', 'Online order starts Pending');

  const onlineSubtotal = 2800 * 3; // 8400
  assert(
    onlineFetched?.order.total_amount === onlineSubtotal,
    'Online order gets free shipping above threshold',
  );
  assert(onlineFetched?.order.shipping_fee === 0, 'Online order shipping_fee is 0 above threshold');

  const onlineBelowThreshold = await createOrderDemo({
    customer_name: 'Sara Ahmed',
    phone_whatsapp: '03111234567',
    city: 'Lahore',
    payment_method: 'ONLINE_CARD',
    items: [{ product_id: 'demo-prod-005', quantity: 1 }],
  });
  const belowFetched = await fetchOrderById(onlineBelowThreshold.orderId!);
  assert(
    belowFetched?.order.total_amount === 2800 + 200,
    'Online order total includes flat shipping fee below threshold',
  );

  const duplicateCustomer = await createOrderDemo({
    customer_name: 'Ali Khan Updated',
    phone_whatsapp: '03001234567',
    city: 'Karachi',
    payment_method: 'COD',
    items: [{ product_id: 'demo-prod-006', quantity: 1 }],
  });
  assert(duplicateCustomer.success === true, 'Repeated phone upserts existing customer');

  const invalidResult = await createOrderDemo({
    customer_name: 'Test',
    phone_whatsapp: '03000000000',
    payment_method: 'COD',
    items: [{ product_id: 'demo-prod-999', quantity: 1 }],
  });
  assert(invalidResult.success === false, 'Unknown product rejected');

  // --- Customization flow ---
  const bag = await fetchProductBySlug('handmade-leather-bag');
  assert(
    bag?.allow_customization === true && bag.custom_price === 7200,
    'Customizable product exposes allow_customization + custom_price',
  );

  const customResult = await createOrderDemo({
    customer_name: 'Hina Malik',
    phone_whatsapp: '03331234567',
    city: 'Islamabad',
    address: 'House 2, F-10',
    payment_method: 'COD',
    items: [
      {
        product_id: 'demo-prod-006',
        quantity: 2,
        is_customized: true,
        custom_notes: 'Embroider initials HM, dark brown leather',
        custom_images: [
          'https://example.com/ref1.jpg',
          'https://example.com/ref2.jpg',
        ],
      },
    ],
  });
  assert(customResult.success === true, 'Customized order placement succeeds');

  const customFetched = await fetchOrderById(customResult.orderId!);
  const customItem = customFetched?.items[0];
  assert(customItem?.is_customized === true, 'Order item stores is_customized: true');
  assert(
    customItem?.custom_notes === 'Embroider initials HM, dark brown leather',
    'Order item stores custom_notes',
  );
  assert(
    customItem?.custom_images?.length === 2 &&
      customItem.custom_images[0] === 'https://example.com/ref1.jpg',
    'Order item stores custom_images (text[])',
  );
  assert(
    customItem?.unit_price === 7200,
    `Customized item priced at custom_price (unit = ${customItem?.unit_price})`,
  );
  assert(
    customFetched?.order.total_amount === 7200 * 2,
    'Customized order total uses custom_price',
  );

  const rejectedCustom = await createOrderDemo({
    customer_name: 'Test',
    phone_whatsapp: '03000000000',
    payment_method: 'COD',
    items: [
      {
        product_id: 'demo-prod-001',
        quantity: 1,
        is_customized: true,
      },
    ],
  });
  assert(
    rejectedCustom.success === false,
    'Customized order rejected for non-customizable product',
  );

  console.log('\nALL MOCK BACKEND CHECKS PASSED.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});