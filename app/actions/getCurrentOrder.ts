'use server'
import { ensureAuthenticated } from "../../lib/supabase/server"

export async function getCurrentOrder() {
    const { supabase, user } = await ensureAuthenticated();

    const { data, error } = await supabase
        .from('orders')
        .select(`
            order_id,
            order_dt,
            current_status,
            order_items (
                quantity,
                products (
                    product_name
                )
            )
        `)
        .eq('user_id', user.id)
        .not('current_status', 'eq', 'Delivered')
        .not('current_status', 'eq', 'Cancelled')
        .order('order_dt', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error fetching current order:", error);
        return { error: "Failed to fetch current order" };
    }

    return data;
}
