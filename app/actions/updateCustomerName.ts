'use server'
import { createClient } from "@/lib/supabase/server"

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

    return { success: true, message: "Name updated successfully!" };
}
