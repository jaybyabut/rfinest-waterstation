'use server'
import { ensureAuthenticated } from "../../lib/supabase/server"
import { logActivity } from "./logActivity";
import { validatePasswordStrength } from "../../lib/validatePassword";

export async function updatePassword(oldPassword: string, newPassword: string) {
    const { supabase, user } = await ensureAuthenticated();

    if (!user.email) {
        return { success: false, error: "Missing email address." };
    }

    // Server-side password strength validation
    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
        return { success: false, error: passwordError };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
    });

    if (signInError) {
        return { success: false, error: "Incorrect current password." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (updateError) {
        console.error("Error updating user password:", updateError);
        return { success: false, error: "Failed to update password: " + updateError.message };
    }

    // Log the activity
    await logActivity(`Updated account password`);

    return { success: true, message: "Password updated successfully!" };
}
