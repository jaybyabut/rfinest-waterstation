'use server'
import { createClient, ensureRole } from '../../lib/supabase/server'
import { logActivity } from './logActivity'

export async function getLocations() {
    console.log("getLocations: Started fetching...");
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('location_pricing')
        .select('location_id, location_name, location_price')
        .eq('is_active', true); 
        
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

    await logActivity(`Updated prices for ${prices.length} locations`);

    return { success: true };
}

export async function addLocation(data: { location_name: string; location_price: number }) {
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
        if (error.code === '23505') { 
            return { error: `The zone "${data.location_name}" already exists.` };
        }
        return { error: "Failed to add new zone. Please try again." };
    }

    await logActivity(`Added new delivery zone: ${data.location_name} with ₱${data.location_price} increment`);

    return { success: true };
}

export async function deactivateLocation(id: number) {
    const { supabase } = await ensureRole(['admin']);

    const { error } = await supabase
        .from('location_pricing')
        .update({ is_active: false })
        .eq('location_id', id);

    if (error) {
        console.error(`Error deactivating location ${id}:`, error);
        return { error: "Failed to remove zone. Please try again." };
    }

    await logActivity(`Deactivated delivery zone ID: ${id}`);

    return { success: true };
}
