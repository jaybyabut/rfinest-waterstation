'use server'
import { ensureRole, createAdminClient } from "../../lib/supabase/server"

export async function getAllOrders(fetchGroup: 'active' | 'delivered' | 'cancelled' | 'all' = 'all') {
    await ensureRole(['admin', 'employee']);
    const supabase = await createAdminClient();

    // TIME-BASED LOGIC: Kunin ang petsa eksaktong 4 na araw ang nakakalipas
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 4);
    const cutoffDate = targetDate.toISOString();

    const selectQuery = `
        order_id,
        order_dt,
        name,
        total_amount,
        transaction_type,
        current_status,
        location_pricing ( location_name ),
        payment_mode,
        proof_payment,
        order_items ( quantity, products ( product_name ) )
    `;

    // LOGIC PARA SA "ALL" TAB (Default View)
    if (fetchGroup === 'all') {
        // Kunin ang Active at Delivered (huling 4 na araw, WALANG LIMIT)
        const activeAndDeliveredPromise = supabase
            .from('orders')
            .select(selectQuery)
            .gte('order_dt', cutoffDate)
            .in('current_status', ['Pending', 'Processing', 'Pickup', 'Refilled', 'Out for Delivery', 'Delivered']);

        // Kunin ang Cancelled (huling 4 na araw, MAY 50 LIMIT)
        const cancelledPromise = supabase
            .from('orders')
            .select(selectQuery)
            .gte('order_dt', cutoffDate)
            .eq('current_status', 'Cancelled')
            .limit(50);

        const [adResult, cResult] = await Promise.all([activeAndDeliveredPromise, cancelledPromise]);

        if (adResult.error) {
            console.error("Error fetching active/delivered:", adResult.error);
            return { error: adResult.error.message };
        }
        if (cResult.error) {
            console.error("Error fetching cancelled:", cResult.error);
            return { error: cResult.error.message };
        }

        // Pagsamahin lahat tapos i-sort mula pinakabago pababa
        const combinedData = [...(adResult.data || []), ...(cResult.data || [])];
        combinedData.sort((a, b) => new Date(b.order_dt).getTime() - new Date(a.order_dt).getTime());

        return combinedData;
    }

    // LOGIC PARA SA MGA SPECIFIC TABS KAPAG PININDOT NG ADMIN
    let query = supabase
        .from('orders')
        .select(selectQuery)
        .gte('order_dt', cutoffDate); // I-apply ang 4-day rule

    if (fetchGroup === 'active') {
        query = query.in('current_status', ['Pending', 'Processing', 'Pickup', 'Refilled', 'Out for Delivery']);
    } else if (fetchGroup === 'delivered') {
        query = query.eq('current_status', 'Delivered'); // WALANG LIMIT
    } else if (fetchGroup === 'cancelled') {
        query = query.eq('current_status', 'Cancelled').limit(50); // MAY LIMIT NA 50
    }

    const { data, error } = await query.order('order_dt', { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
        return { error: error.message || "Failed to fetch orders" };
    }

    return data;
}
