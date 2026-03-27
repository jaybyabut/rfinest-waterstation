'use server'
import { ensureAuthenticated } from "../../lib/supabase/server"

export async function logActivity(activity: string) {
    const { supabase, user } = await ensureAuthenticated();

    // Get the user's name from the users table
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

    const userName = userData ? `${userData.first_name} ${userData.last_name}` : user.email;

    const { error: logError } = await supabase
        .from('activity_log')
        .insert({
            activity,
            user_id: user.id,
            user_name: userName
        });

    if (logError) {
        console.error("Error inserting activity log:", logError);
        return { success: false, error: "Failed to log activity" };
    }

    return { success: true };
}
