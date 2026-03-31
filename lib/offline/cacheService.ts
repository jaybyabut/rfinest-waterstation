import { createClient } from '../supabase/client';
import { db } from './db';

export async function refreshCache() {
  const supabase = createClient();
  const now = Date.now();

  try {
    // 1. Cache Products
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('product_id, product_name');

    if (productError) throw productError;

    if (products) {
      await db.cachedProducts.bulkPut(
        products.map((p) => ({
          product_id: p.product_id,
          product_name: p.product_name,
          cachedAt: now,
        }))
      );
    }

    // 2. Cache Locations
    const { data: locations, error: locationError } = await supabase
      .from('location_pricing')
      .select('location_id, location_name, location_price');

    if (locationError) throw locationError;

    if (locations) {
      await db.cachedLocations.bulkPut(
        locations.map((l) => ({
          location_id: l.location_id,
          location_name: l.location_name,
          location_price: l.location_price,
          cachedAt: now,
        }))
      );
    }

    console.log('Cache refreshed successfully');
  } catch (error) {
    console.error('Failed to refresh cache:', error);
  }
}

export async function getCachedProducts() {
  return await db.cachedProducts.toArray();
}

export async function getCachedLocations() {
  return await db.cachedLocations.toArray();
}
