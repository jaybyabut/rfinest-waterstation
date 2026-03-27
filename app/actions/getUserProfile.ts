'use server'
import { ensureAuthenticated } from "../../lib/supabase/server"

export async function getUserProfile() {
    try {
        const { supabase, user } = await ensureAuthenticated();

        // Try to get from users table first (since that's where updateCustomerName writes to)
        const { data: userData, error: usersError } = await supabase
            .from("users")
            .select("user_id, first_name, middle_initial, last_name, address, mobile_no, location_id")
            .eq("user_id", user.id)
            .single();

        if (!usersError && userData) {
            return userData;
        }

        // Fallback to profiles table if users table doesn't have it
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, first_name, middle_initial, last_name, address, mobile_no, location_id, location_pricing(location_name)")
            .eq("id", user.id)
            .single();

        if (!profileError && profileData) {
            return profileData;
        }

        return null;
    } catch {
        return null;
    }
}
