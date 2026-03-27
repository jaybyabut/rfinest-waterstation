'use server'
import { createClient } from "../../lib/supabase/server"

export async function getCustomerOrders() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "User not authenticated" };
    }

    const { data, error } = await supabase
        .from('orders')
        .select(`
            order_id,
            order_dt,
            total_amount,
            payment_mode,
            current_status,
            order_items (
                quantity,
                products (
                    product_name
                )
            )
        `)
        .eq('user_id', user.id)
        .order('order_dt', { ascending: false });

    if (error) {
        console.error("Error fetching customer orders:", error);
        return { error: "Failed to fetch orders" };
    }

    return data;
}
