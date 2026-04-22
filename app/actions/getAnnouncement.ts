'use server'
import { createAdminClient } from "../../lib/supabase/server"

export async function getAnnouncement() {
    const supabase = await createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error fetching announcement:", error);
        return null;
    }

    return data;
}