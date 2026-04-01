import Dexie, { type EntityTable } from 'dexie';

export interface PendingOrder {
  id?: number;
  idempotencyKey: string;
  orderData: any;
  totalAmount: number;
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastError?: string;
  transactionType: 'Walk-in' | 'Online';
}

export interface PendingStatusUpdate {
  id?: number;
  orderId: string;
  newStatus: string;
  updatedAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastError?: string;
}

export interface CachedProduct {
  product_id: string;
  product_name: string;
  cachedAt: number;
}

export interface CachedLocation {
  location_id: string;
  location_name: string;
  location_price: number;
  cachedAt: number;
}

export interface CachedOrder {
  id: string;
  order_id: string;
  customer_name: string;
  total_amount: number;
  current_status: string;
  created_at: string;
  transaction_type: string;
  address?: string;
  notes?: string;
  payment_mode?: string;
  items?: any[];
}

class OfflineDB extends Dexie {
  pendingOrders!: EntityTable<PendingOrder, 'id'>;
  pendingStatusUpdates!: EntityTable<PendingStatusUpdate, 'id'>;
  cachedProducts!: EntityTable<CachedProduct, 'product_id'>;
  cachedLocations!: EntityTable<CachedLocation, 'location_id'>;
  cachedWalkInOrders!: EntityTable<CachedOrder, 'id'>;
  cachedOnlineOrders!: EntityTable<CachedOrder, 'id'>;

  constructor() {
    super('OfflineDB');
    this.version(1).stores({
      pendingOrders: '++id, idempotencyKey, status, transactionType',
      pendingStatusUpdates: '++id, orderId, status',
      cachedProducts: 'product_id',
      cachedLocations: 'location_id',
      cachedWalkInOrders: 'id',
      cachedOnlineOrders: 'id'
    });
  }
}

export const db = new OfflineDB();
