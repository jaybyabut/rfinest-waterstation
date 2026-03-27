'use server'
import { ensureRole } from "../../lib/supabase/server"

export async function getOnlineOrders() {
    const { supabase } = await ensureRole(['employee', 'admin']);

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
            address,
            payment_mode,
            proof_payment,
            order_items (
                quantity,
                products (
                    product_name
                )
            )
        `)
        .not('transaction_type', 'eq', 'Walk-in')
        .in('current_status', ['Pending', 'Pick-up', 'Processing', 'Refilled', 'Out for Delivery'])
        .order('order_dt', { ascending: true });

    if (error) {
        console.error("Error fetching online orders:", error);
        return { error: "Failed to fetch orders" };
    }

    return data;
}
