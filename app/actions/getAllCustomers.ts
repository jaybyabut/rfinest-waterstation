'use server'
import { createAdminClient, ensureRole } from "../../lib/supabase/server"

export async function getAllCustomers() {
    // Only allow admin and employees to fetch all customers
    await ensureRole(['admin', 'employee']);
    const supabase = await createAdminClient();
    
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
        `);

    if (error) {
        console.error("Error fetching customers:", error);
        return [];
    }
    
    return data;
}
