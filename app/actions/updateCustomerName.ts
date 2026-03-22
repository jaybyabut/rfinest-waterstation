'use server'
import { createClient } from "@/lib/supabase/server"
import { logActivity } from "./logActivity";

export async function updateCustomerName(firstName: string, middleInitial: string, lastName: string) {
    const supabase = await createClient();
    const user = await supabase.auth.getClaims();
    const userId = user.data?.claims.sub;

    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from('users')
        .update({
            first_name: firstName,
            middle_initial: middleInitial,
            last_name: lastName
        })
        .eq('user_id', userId);

    if (error) {
        console.error("Error updating user name:", error);
        return { success: false, error: "Failed to update user name" };
    }

    // Log the activity
    await logActivity(`Updated name to ${firstName} ${lastName}`);

    return { success: true, message: "Name updated successfully!" };
}
