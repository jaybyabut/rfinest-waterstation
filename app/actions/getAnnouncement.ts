'use server'
import { createAdminClient } from "../../lib/supabase/server"

export async function getAnnouncement() {
    const supabase = await createAdminClient();

    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .lte('starts_at', now)   // Already started
        .gte('expires_at', now)  // Not yet expired
        .order('created_at', { ascending: false }) // Get the newest one first
        .limit(1)
        .single();

    // PGRST116 is the PostgREST error for "JSON object requested, but 0 rows returned"
    if (error) {
        if (error.code !== 'PGRST116') {
            console.error("Error fetching announcement:", error);
        }
        return null;
    }

    return data;
}