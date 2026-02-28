'use server'
import { createClient } from "@/lib/supabase/server"



export async function getCustomerAddy() {
    const supabase = await createClient();
    const user = await supabase.auth.getClaims();
    const userId = user.data?.claims.sub;



    const { data: userDetails, error: userError } = await supabase
        .from('users')
        .select(`
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