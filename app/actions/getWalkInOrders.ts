'use server'
import { createClient } from "@/lib/supabase/server"

export async function getWalkInOrders() {
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
        .eq('transaction_type', 'Walk-in')
        .not('current_status', 'eq', 'Delivered')
        .not('current_status', 'eq', 'Cancelled')
        .order('order_dt', { ascending: true });

    if (error) {
        console.error("Error fetching walk-in orders:", error);
        return { error: "Failed to fetch orders" };
    }

    return data;
}
