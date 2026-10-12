'use server'
import { ensureRole, createAdminClient } from "../../lib/supabase/server"

export async function getAllOrders() {
    await ensureRole(['admin', 'employee']);
    const supabase = await createAdminClient();

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
            payment_mode,
            proof_payment,
            order_items (
                quantity,
                products (
                    product_name
                )
            )
        `)
        .order('order_dt', { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error fetching orders:", error);
        return { error: error.message || "Failed to fetch orders" };
    }

    return data;

}
