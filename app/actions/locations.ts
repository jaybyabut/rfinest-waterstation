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

export async function addLocation(data: { location_name: string; location_price: number }) {
    // Siguraduhing admin lang ang pwedeng mag-add ng bagong zone
    const { supabase } = await ensureRole(['admin'])

    const { error } = await supabase
        .from('location_pricing')
        .insert([
            { 
                location_name: data.location_name, 
                location_price: data.location_price 
            }
        ]);

    if (error) {
        console.error("Error adding new location:", error);
        // 23505 is the PostgreSQL error code for unique violation (kung na-add na yung name dati)
        if (error.code === '23505') { 
            return { error: `The zone "${data.location_name}" already exists.` };
        }
        return { error: "Failed to add new zone. Please try again." };
    }

    // I-log sa activity history para kita ng admin kung sino ang nagdagdag
    await logActivity(`Added new delivery zone: ${data.location_name} with ₱${data.location_price} increment`);

    return { success: true };
}
