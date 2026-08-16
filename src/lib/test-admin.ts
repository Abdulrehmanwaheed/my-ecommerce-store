import {
  adminCreateProduct,
  adminUpdateProduct,
  createOrderDemo,
  fetchAllOrders,
  fetchProductBySlug,
  updateOrderStatus,
} from './backend-demo';

async function main() {
  const order = await createOrderDemo({
    customer_name: 'Admin Test',
    phone_whatsapp: '03005556677',
    city: 'Lahore',
    payment_method: 'COD',
    items: [{ product_id: 'demo-prod-002', quantity: 1 }],
  });
  console.log('order placed:', order.success, order.orderNumber);

  const s1 = await updateOrderStatus(order.orderId!, 'Shipped');
  const s2 = await updateOrderStatus(order.orderId!, 'Delivered');
  const sBad = await updateOrderStatus(order.orderId!, 'Nope' as never);
  console.log('status shipped:', s1.success, '| delivered:', s2.success, '| invalid rejected:', sBad.success === false);

  const all = await fetchAllOrders();
  const found = all.find((o) => o.id === order.orderId);
  console.log('final status:', found?.order_status, '| orders listed:', all.length, '| pending COD count:', all.filter((o) => o.payment_method === 'COD' && o.payment_status === 'Unpaid').length);

  const prod = await adminCreateProduct({
    title: 'Test Gadget Pro',
    slug: 'test-gadget-pro',
    price: 999,
    stock: 5,
    category_id: 'cat-tech',
    attributes: { warranty: '1 Year', colors: ['Black', 'White'], wireless: true, watts: 50 },
  });
  console.log('product created:', prod.success);
  const fetched = await fetchProductBySlug('test-gadget-pro');
  console.log('product fetchable:', fetched?.title, '| attrs:', JSON.stringify(fetched?.attributes));

  const fail = await adminCreateProduct({ title: '', slug: '', price: 0, stock: 0 });
  console.log('invalid product rejected:', fail.success === false);

  const updated = await adminUpdateProduct(prod.id!, {
    title: 'Test Gadget Pro (Updated)',
    slug: 'test-gadget-pro',
    description: 'Edited description',
    price: 1299,
    original_price: 1599,
    stock: 8,
    images: ['https://example.com/new-image.jpg'],
    category_id: 'cat-tech',
    attributes: { warranty: '2 Years', colors: ['Black'] },
    is_featured: true,
    allow_customization: true,
    custom_price: 1799,
  });
  console.log('product updated:', updated.success);
  const updatedFetched = await fetchProductBySlug('test-gadget-pro');
  console.log(
    'updated values:',
    updatedFetched?.title,
    '| price:',
    updatedFetched?.price,
    '| original:',
    updatedFetched?.original_price,
    '| stock:',
    updatedFetched?.stock,
    '| img:',
    updatedFetched?.images[0],
    '| featured:',
    updatedFetched?.is_featured,
    '| customizable:',
    updatedFetched?.allow_customization,
    '| custom price:',
    updatedFetched?.custom_price,
    '| desc:',
    updatedFetched?.description,
  );

  const notFound = await adminUpdateProduct('missing-id', {
    title: 'X',
    slug: 'x',
    price: 1,
    stock: 1,
  });
  console.log('update missing product rejected:', notFound.success === false);
}

main();