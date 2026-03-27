'use server'
import { createClient, ensureRole } from '@/lib/supabase/server'
import { logActivity } from './logActivity'

export async function getLocations() {
    const supabase = await createClient()
    
    const { data, error } = await supabase.from('location_pricing').select('location_id, location_name, location_price')

    if (error) {
        return { error }
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