'use server'
import { createClient } from "@/lib/supabase/server"

export async function updateOrderStatus(orderId: number, newStatus: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('orders')
        .update({ current_status: newStatus })
        .eq('order_id', orderId);

    if (error) {
        console.error("Error updating order status:", error);
        return { error: "Failed to update order status" };
    }

    return { success: true };
}
