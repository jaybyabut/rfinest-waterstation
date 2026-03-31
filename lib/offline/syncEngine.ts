import { db } from './db';

export async function syncPendingOrders() {
  const pendingOrders = await db.pendingOrders
    .where('status')
    .anyOf(['pending', 'failed'])
    .filter((o) => o.retryCount < 5)
    .toArray();

  for (const order of pendingOrders) {
    try {
      await db.pendingOrders.update(order.id!, { status: 'syncing' });

      const response = await fetch('/api/sync/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: order.idempotencyKey,
          orderData: order.orderData,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await db.pendingOrders.update(order.id!, { status: 'synced' });
      } else {
        throw new Error(result.error || 'Failed to sync order');
      }
    } catch (error: any) {
      console.error(`Error syncing order ${order.id}:`, error);
      await db.pendingOrders.update(order.id!, {
        status: 'failed',
        retryCount: order.retryCount + 1,
        lastError: error.message,
      });
    }
  }
}

export async function syncPendingStatusUpdates() {
  const pendingUpdates = await db.pendingStatusUpdates
    .where('status')
    .anyOf(['pending', 'failed'])
    .filter((u) => u.retryCount < 5)
    .toArray();

  for (const update of pendingUpdates) {
    try {
      await db.pendingStatusUpdates.update(update.id!, { status: 'syncing' });

      const response = await fetch('/api/sync/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: update.orderId,
          newStatus: update.newStatus,
          updatedAt: update.updatedAt,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await db.pendingStatusUpdates.update(update.id!, { status: 'synced' });
      } else {
        throw new Error(result.error || 'Failed to sync status update');
      }
    } catch (error: any) {
      console.error(`Error syncing status update ${update.id}:`, error);
      await db.pendingStatusUpdates.update(update.id!, {
        status: 'failed',
        retryCount: update.retryCount + 1,
        lastError: error.message,
      });
    }
  }
}
