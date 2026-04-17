'use server'
import { createAdminClient } from "../../lib/supabase/server"

export async function getAnnouncement() {
    // We use the admin client because customers might not have RLS SELECT access on the 'announcements' table by default
    const supabase = await createAdminClient();
    
    // Fetch the most recent announcement
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { 
        console.error("Error fetching announcement:", error);
        return null;
    }
    
    return data;
}
