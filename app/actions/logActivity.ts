'use server'
import { createClient } from "../../lib/supabase/server"

export async function logActivity(activity: string) {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        console.error("Error getting user for activity log:", authError);
        return { success: false, error: "Unauthorized" };
    }

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
