import {
  adminCreateProduct,
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
}

main();