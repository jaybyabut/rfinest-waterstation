'use server'
import { ensureAuthenticated } from "../../lib/supabase/server"

export async function getUserId() {
    try {
        const { user } = await ensureAuthenticated();
        return user.id;
    } catch {
        return null;
    }
}
