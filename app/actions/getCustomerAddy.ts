'use server'
import { ensureAuthenticated } from "../../lib/supabase/server"

export async function getCustomerAddy() {
    const { supabase, user } = await ensureAuthenticated();
    const userId = user.id;



    const { data: userDetails, error: userError } = await supabase
        .from('users')
        .select(`
                first_name,
                middle_initial,
                last_name,
                address,
                location_id,
                location_pricing(
                    location_name,
                    location_price
                )
        `)
        .eq('user_id', userId)
        .single();

    if (userError) {
        console.error("Error fetching user details:", userError);
        return { error: "Failed to fetch user information" };
    }

    return userDetails;
}
