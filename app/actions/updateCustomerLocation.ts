'use server'
import { ensureAuthenticated } from "../../lib/supabase/server"
import { logActivity } from "./logActivity";

export async function updateCustomerLocation(address: string, locationId: string, passwordToVerify: string) {
    const { supabase, user } = await ensureAuthenticated();
    const userId = user.id;

    // 1. SECURITY CHECK: I-verify ang password bago galawin ang database
    if (!user.email) {
        return { success: false, error: "User email not found. Please log in again." };
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordToVerify,
    });

    if (verifyError) {
        // Ibabalik ito sa frontend kapag mali ang tinype na password
        return { success: false, error: "Incorrect password. Location update failed." };
    }

    // 2. KAPAG TAMA ANG PASSWORD: Proceed sa pag-update ng users table
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
