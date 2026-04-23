'use server'
import { createAdminClient } from "../../lib/supabase/server"

export async function saveCustomerInfo(customerData: {
    firstName: string;
    lastName: string;
    mi: string;
    mobileNumber: string;
    address: string;
    locationId: number;
}) {
    const supabase = await createAdminClient();
    
    // Check if user already exists
    let query = supabase.from('users').select('user_id');
    
    if (customerData.mobileNumber) {
        query = query.eq('mobile_no', customerData.mobileNumber);
    } else {
        query = query.eq('first_name', customerData.firstName)
                     .eq('last_name', customerData.lastName);
    }

    const { data: existingUser } = await query.maybeSingle();
        
    if (existingUser) {
        // User already exists, we could update but for now just return success
        return { success: true, isExisting: true };
    }

    // Try to insert directly to users table.
    const { data, error } = await supabase
        .from('users')
        .insert([{
            first_name: customerData.firstName,
            last_name: customerData.lastName,
            middle_initial: customerData.mi,
            mobile_no: customerData.mobileNumber,
            address: customerData.address,
            location_id: customerData.locationId,
        }])
        .select();

    if (error) {
        console.error("Error saving customer directly to users:", error);
        return { error: error.message };
    }
    
    return { success: true, data };
}
