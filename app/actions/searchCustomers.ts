'use server'
import { ensureAuthenticated } from "../../lib/supabase/server"

export async function searchCustomers(query: string) {
    if (!query || query.trim().length < 2) return [];

    const { supabase } = await ensureAuthenticated();
    const searchTerm = `%${query.trim()}%`;
    
    const { data, error } = await supabase
        .from('users')
        .select(`
            user_id,
            first_name,
            last_name,
            middle_initial,
            mobile_no,
            address,
            location_id,
            location_pricing (
                location_name,
                location_price
            )
        `)
        .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},mobile_no.ilike.${searchTerm}`)
        .limit(15);

    if (error) {
        console.error("Error searching customers:", error);
        return [];
    }
    
    return data;
}
