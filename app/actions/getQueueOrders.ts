'use server'
import { createClient } from "@/lib/supabase/server"

export async function getQueueOrders() {
    const supabase = await createClient();

    // Fetch orders that are not 'Delivered' and not 'Cancelled'
    const { data, error } = await supabase
        .from('orders')
        .select(`
            order_id,
            order_dt,
            name,
            total_amount,
            transaction_type,
            current_status,
            note,
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
        .not('current_status', 'eq', 'Delivered')
        .not('current_status', 'eq', 'Cancelled')
        .order('order_dt', { ascending: true }); // Oldest first for queue

    if (error) {
        console.error("Error fetching queue orders:", error);
        return { error: "Failed to fetch queue orders" };
    }

    return data;
}
