'use server'
import { ensureRole } from "../../lib/supabase/server"
import { logActivity } from "./logActivity";

export async function saveAnnouncement(title: string, content: string, isActive: boolean, expirationDate: string | null) {
    const { supabase } = await ensureRole(['admin']); 
    
    // To expire immediately if false, we set expires_at equal to starts_at (today) by using CURRENT_DATE trick or '1970-01-01'
    // But since the schema has CHECK (expires_at >= starts_at) and starts_at defaults to CURRENT_DATE,
    // we must ensure expires_at is exactly today (or greater)
    const today = new Date().toISOString().split('T')[0];
    const expiresAt = isActive ? (expirationDate || '2099-12-31') : today;

    const { error } = await supabase
        .from('announcements')
        .insert({ 
            title: title || 'System Announcement', 
            content: content, 
            expires_at: expiresAt,
            starts_at: today
        });

    if (error) {
        console.error("Error saving announcement:", error);
        return { success: false, error: error.message };
    }

    await logActivity(`Updated system announcement`);
    return { success: true };
}
