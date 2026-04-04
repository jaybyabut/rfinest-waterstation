'use server'
import { ensureRole, createAdminClient } from "../../lib/supabase/server"

export async function getQueueOrders() {
    await ensureRole(['station', 'admin']);

    // Use the admin client (service role) to bypass RLS and fetch ALL orders
    const supabaseAdmin = await createAdminClient();

    const { data, error } = await supabaseAdmin
        .from('orders')
        .select(`
            order_id,
            order_dt,
            name,
            address,
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
        .order('order_dt', { ascending: true });

    if (error) {
        console.error("Error fetching queue orders:", error);
        return { error: "Failed to fetch queue orders" };
    }

    return data;
}