import { db, CachedOrder } from './db';

export async function cacheWalkInOrders(orders: any[]) {
  const cachedOrders: CachedOrder[] = orders.map(o => ({
    id: o.order_id,
    order_id: o.order_id,
    customer_name: o.customer_name,
    total_amount: o.total_amount,
    current_status: o.current_status,
    created_at: o.created_at,
    transaction_type: o.transaction_type,
    address: o.address,
    notes: o.note,
    payment_mode: o.payment_mode,
    items: o.order_items || []
  }));
  await db.cachedWalkInOrders.clear();
  await db.cachedWalkInOrders.bulkPut(cachedOrders);
}

export async function getCachedWalkInOrders() {
  return await db.cachedWalkInOrders.toArray();
}

export async function cacheOnlineOrders(orders: any[]) {
  const cachedOrders: CachedOrder[] = orders.map(o => ({
    id: o.order_id,
    order_id: o.order_id,
    customer_name: o.customer_name,
    total_amount: o.total_amount,
    current_status: o.current_status,
    created_at: o.created_at,
    transaction_type: o.transaction_type,
    address: o.address,
    notes: o.note,
    payment_mode: o.payment_mode,
    items: o.order_items || []
  }));
  await db.cachedOnlineOrders.clear();
  await db.cachedOnlineOrders.bulkPut(cachedOrders);
}

export async function getCachedOnlineOrders() {
  return await db.cachedOnlineOrders.toArray();
}
