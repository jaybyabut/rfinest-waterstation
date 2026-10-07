'use server'
import { ensureAuthenticated } from "../../lib/supabase/server"

/**
 * Sanitizes a string for safe storage in activity logs.
 * - Strips HTML tags
 * - Removes control characters (newlines, tabs, null bytes, etc.)
 * - Trims whitespace
 * - Enforces a max length
 */
function sanitizeLogInput(input: string, maxLength = 500): string {
    return input
        .replace(/<[^>]*>/g, '')           // Strip HTML tags
        .replace(/[\x00-\x1F\x7F]/g, ' ')  // Replace control chars with space
        .trim()
        .substring(0, maxLength);
}

export async function logActivity(
    activity: string,
    options?: { supabase: any; user: any }
) {
    // If caller already has an authenticated client, reuse it to avoid a redundant auth round-trip
    const { supabase, user } = options?.supabase && options?.user
        ? options
        : await ensureAuthenticated();

    const safeActivity = sanitizeLogInput(activity);

    // Get the user's name from the users table
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

    const rawName = userData ? `${userData.first_name} ${userData.last_name}` : user.email || 'Unknown';
    const safeName = sanitizeLogInput(rawName, 100);

    const { error: logError } = await supabase
        .from('activity_log')
        .insert({
            activity: safeActivity,
            user_id: user.id,
            user_name: safeName
        });

    if (logError) {
        console.error("Error inserting activity log:", logError);
        return { success: false, error: "Failed to log activity" };
    }

    return { success: true };
}
