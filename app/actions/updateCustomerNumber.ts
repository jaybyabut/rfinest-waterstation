'use server'
import { ensureAuthenticated } from "../../lib/supabase/server"
import { logActivity } from "./logActivity";

export async function updateCustomerNumber(mobileNo: string, passwordToVerify: string) {
    const { supabase, user } = await ensureAuthenticated();
    const userId = user.id;

    if (!user.email) {
        return { success: false, error: "User email not found. Please log in again." };
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordToVerify,
    });

    if (verifyError) {
        return { success: false, error: "Incorrect password. Mobile number update failed." };
    }

    const { error } = await supabase
        .from('users')
        .update({
            mobile_no: mobileNo
        })
        .eq('user_id', userId);

    if (error) {
        console.error("Error updating user mobile number:", error);
        return { success: false, error: "Failed to update user mobile number" };
    }

    await logActivity(`Updated mobile number to ${mobileNo}`);

    return { success: true, message: "Mobile number updated successfully!" };
}
