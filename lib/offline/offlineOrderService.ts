import { db, PendingOrder } from './db';
import { getCachedProducts, getCachedLocations } from './cacheService';
import { v4 as uuidv4 } from 'uuid';

export async function createOfflineOrder(orderInfo: any, transactionType: 'Walk-in' | 'Online' = 'Walk-in') {
  // Generate Idempotency Key
  const idempotencyKey = uuidv4();

  // Validate quantities
  if (orderInfo.slimCount < 0 || orderInfo.roundCount < 0) {
    throw new Error("Quantities cannot be negative.");
  }
  
  if (orderInfo.slimCount === 0 && orderInfo.roundCount === 0) {
    throw new Error("Order must contain at least one item.");
  }

  // Use cached data for validation/calculation
  const products = await getCachedProducts();
  const locations = await getCachedLocations();

  const slimProduct = products.find(p => p.product_name === 'Slim Gallon');
  const roundProduct = products.find(p => p.product_name === 'Round Gallon');

  if (!slimProduct && orderInfo.slimCount > 0) throw new Error("Slim Gallon product not cached");
  if (!roundProduct && orderInfo.roundCount > 0) throw new Error("Round Gallon product not cached");

  // Determine location price
  let locationPrice = 0;
  let locationId = orderInfo.locationId;

  if (locationId) {
    const loc = locations.find(l => l.location_id === locationId);
    if (!loc) throw new Error("Location ID not cached");
    locationPrice = loc.location_price;
  } else if (orderInfo.selectedZone) {
    const loc = locations.find(l => l.location_name === orderInfo.selectedZone);
    if (!loc) throw new Error("Location zone not cached");
    locationPrice = loc.location_price;
    locationId = loc.location_id;
  } else {
    throw new Error("Location identification required");
  }

  // Calculate total
  const totalAmount = (orderInfo.slimCount + orderInfo.roundCount) * locationPrice;

  // Build items array (this will be used in RPC eventually)
  const items = [];
  if (orderInfo.slimCount > 0) {
    items.push({
      product_id: slimProduct!.product_id,
      quantity: orderInfo.slimCount,
      unit_price: locationPrice
    });
  }
  if (orderInfo.roundCount > 0) {
    items.push({
      product_id: roundProduct!.product_id,
      quantity: orderInfo.roundCount,
      unit_price: locationPrice
    });
  }

  // Store in IndexedDB
  const pendingOrder: PendingOrder = {
    idempotencyKey,
    orderData: {
      ...orderInfo,
      items,
      locationId
    },
    totalAmount,
    createdAt: new Date().toISOString(),
    status: 'pending',
    retryCount: 0,
    transactionType
  };

  const id = await db.pendingOrders.add(pendingOrder);
  return { success: true, id, idempotencyKey };
}

export async function getPendingOrderCount() {
  return await db.pendingOrders.where('status').equals('pending').count();
}
