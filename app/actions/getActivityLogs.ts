'use server'
import { ensureRole } from "../../lib/supabase/server"

export async function getActivityLogs() {
    const { supabase } = await ensureRole(['admin', 'employee', 'station']);

    const { data: logs, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error fetching activity logs:", error);
        return { error: "Failed to fetch activity logs" };
    }

    return { logs };
}
