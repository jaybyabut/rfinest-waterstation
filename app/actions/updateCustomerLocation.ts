'use server'
import { ensureAuthenticated } from "@/lib/supabase/server"
import { logActivity } from "./logActivity";

export async function updateCustomerLocation(address: string, locationId: string) {
    const { supabase, user } = await ensureAuthenticated();
    const userId = user.id;

    const { error } = await supabase
        .from('users')
        .update({
            address: address,
            location_id: locationId
        })
        .eq('user_id', userId);

    if (error) {
        console.error("Error updating user location:", error);
        return { success: false, error: "Failed to update user location" };
    }

    // Log the activity
    await logActivity(`Updated location to ${address}`);

    return { success: true, message: "Location updated successfully!" };
}
