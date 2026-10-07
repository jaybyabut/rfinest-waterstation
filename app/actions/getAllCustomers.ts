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
        `)
        .eq('is_active', true); // MODIFIED: Idinagdag natin ito para itago ang mga deleted customers

    if (error) {
        console.error("Error fetching customers:", error);
        return [];
    }
    
    return data;
}

// ==========================================
// NEW FEATURE: SOFT DELETE CUSTOMER
// ==========================================
export async function deactivateCustomer(userId: string) {
    // Admin lang ang pwedeng mag-delete
    await ensureRole(['admin']);
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('user_id', userId);

    if (error) {
        console.error(`Error deactivating customer ${userId}:`, error);
        return { error: "Failed to remove customer. Please try again." };
    }

    return { success: true };
}
