'use server'
import { createClient } from "@/lib/supabase/server"

export async function getAllOrders() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('orders')
        .select(`
            order_id,
            order_dt,
            name,
            total_amount,
            transaction_type,
            current_status,
            location_pricing (
                location_name
            ),
            order_items (
                quantity,
                products (
                    product_name
                )
            )
        `)
        .order('order_dt', { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
        return { error: "Failed to fetch orders" };
    }

    return data;

}