'use server'
import { createClient } from "@/lib/supabase/server"

export async function getUserId() {
    const supabase = await createClient();
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
        console.error("Error fetching user:", authError.message);
        return null;
    }
    return user?.id;
}