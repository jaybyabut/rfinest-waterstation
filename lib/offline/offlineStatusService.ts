import { db, PendingStatusUpdate } from './db';

export async function queueStatusUpdate(orderId: string, newStatus: string) {
  const update: PendingStatusUpdate = {
    orderId,
    newStatus,
    updatedAt: new Date().toISOString(),
    status: 'pending',
    retryCount: 0
  };

  await db.pendingStatusUpdates.add(update);
  return { success: true };
}
