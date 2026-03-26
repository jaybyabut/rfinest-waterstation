'use server'
import { createClient } from "@/lib/supabase/server"

export async function getOrderHistory(filter: string, customStartDate?: string, customEndDate?: string) {
    const supabase = await createClient();

    let query = supabase
        .from('orders')
        .select(`
            order_id,
            order_dt,
            name,
            total_amount,
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
        .in('current_status', ['Delivered', 'Out for Delivery', 'Completed', 'Cancelled'])
        .order('order_dt', { ascending: false });


    const getDates = (filter: string) => {
        const nowLocal = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
        const yestLocal = new Date(nowLocal);
        yestLocal.setDate(yestLocal.getDate() - 1);
        const lastWeekLocal = new Date(nowLocal);
        lastWeekLocal.setDate(lastWeekLocal.getDate() - 7);

        const toStartStr = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}T00:00:00+08:00`;
        };

        const toEndStr = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}T23:59:59+08:00`;
        };

        if (filter === 'Today') return { start: toStartStr(nowLocal), end: toEndStr(nowLocal) };
        if (filter === 'Yesterday') return { start: toStartStr(yestLocal), end: toEndStr(yestLocal) };
        if (filter === 'Last Week') return { start: toStartStr(lastWeekLocal), end: toEndStr(nowLocal) };
        if (filter === 'Custom' && customStartDate && customEndDate) {
            return {
                start: `${customStartDate}T00:00:00+08:00`,
                end: `${customEndDate}T23:59:59+08:00`
            };
        }
        return null;
    };

    const dates = getDates(filter);
    if (dates) {
        query = query.gte('order_dt', dates.start).lte('order_dt', dates.end);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching order history:", error);
        return { error: "Failed to fetch order history" };
    }


    return data;
}
