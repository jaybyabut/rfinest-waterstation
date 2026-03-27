'use server'
import { createClient } from "../../lib/supabase/server"

export async function getUserProfile() {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return null;
    }

    // Try to get from users table first (since that's where updateCustomerName writes to)
    const { data: userData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!usersError && userData) {
        return userData;
    }

    // Fallback to profiles table if users table doesn't have it or fails
    const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*, location_pricing(location_name)")
        .eq("id", user.id)
        .single();

    if (!profileError && profileData) {
        return profileData;
    }

    return null;
}
