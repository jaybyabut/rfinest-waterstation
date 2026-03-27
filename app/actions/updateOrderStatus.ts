'use server'
import { ensureRole } from "@/lib/supabase/server"
import { logActivity } from "./logActivity";

export async function updateOrderStatus(orderId: number, newStatus: string) {
    const { supabase } = await ensureRole(['admin', 'employee']);

    const { error } = await supabase
        .from('orders')
        .update({ current_status: newStatus })
        .eq('order_id', orderId);

    if (error) {
        console.error("Error updating order status:", error);
        return { error: "Failed to update order status" };
    }

    // Log the activity
    await logActivity(`Updated order #${orderId} status to ${newStatus}`);

    return { success: true };
}
