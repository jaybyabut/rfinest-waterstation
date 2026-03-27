'use server'
import { ensureAuthenticated, ensureRole } from '../../lib/supabase/server'
import { logActivity } from './logActivity'

export async function getLocations() {
    console.log("getLocations: Started fetching...");
    const { supabase } = await ensureAuthenticated()
    console.log("getLocations: Auth passed");

    const { data, error } = await supabase.from('location_pricing').select('location_id, location_name, location_price')
    console.log("getLocations: Data received:", data);

    if (error) {
        console.error("Error fetching locations:", error);
        return { error: "Failed to fetch locations." }
    }

    return data
}

export async function batchUpdatePrices(prices: { id: number, price: number }[]) {
    const { supabase } = await ensureRole(['admin'])

    for (const item of prices) {
        const { error } = await supabase
            .from('location_pricing')
            .update({ location_price: item.price })
            .eq('location_id', item.id);

        if (error) {
            console.error(`Error updating price for location ${item.id}:`, error);
            return { error: `Failed to update price for location ID ${item.id}` };
        }
    }

    // Log the activity
    await logActivity(`Updated prices for ${prices.length} locations`);

    return { success: true };
}
