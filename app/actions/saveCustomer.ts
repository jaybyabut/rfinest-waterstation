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
    
    const trimmedMobile = customerData.mobileNumber?.trim();
    
    if (trimmedMobile) {
        query = query.eq('mobile_no', trimmedMobile);
    } else {
        // When no mobile number, match on name + address + location to avoid false positives
        query = query.eq('first_name', customerData.firstName);
        if (customerData.lastName?.trim()) {
             query = query.eq('last_name', customerData.lastName);
        }
        query = query.eq('address', customerData.address);
        query = query.eq('location_id', customerData.locationId);
    }

    const { data: existingUsers } = await query.limit(1);
        
    if (existingUsers && existingUsers.length > 0) {
        // User already exists, update their info
        const { error: updateError } = await supabase
            .from('users')
            .update({
                first_name: customerData.firstName,
                last_name: customerData.lastName,
                middle_initial: customerData.mi,
                mobile_no: trimmedMobile || customerData.mobileNumber,
                address: customerData.address,
                location_id: customerData.locationId,
            })
            .eq('user_id', existingUsers[0].user_id);

        if (updateError) {
            console.error("Error updating existing customer:", updateError);
        }
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
