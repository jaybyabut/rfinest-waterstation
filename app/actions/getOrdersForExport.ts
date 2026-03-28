"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOrdersForExport(selectedMonth: string) {
  try {
    const supabase = await createClient();

    // 1. Kunin ang start at end date ng napiling buwan
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1; // 0-indexed ang buwan sa JS Date

    const startDate = new Date(year, month, 1).toISOString();
    // Kukunin ang pinaka-last millisecond ng buwan
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString(); 

    // 2. I-query ang database, isama yung related tables na kailangan sa CSV
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        order_id,
        order_dt,
        name,
        total_amount,
        transaction_type,
        payment_mode,
        current_status,
        location_pricing ( location_name ),
        order_items (
          quantity,
          products ( product_name )
        )
      `)
      .gte('order_dt', startDate)
      .lte('order_dt', endDate)
      .order('order_dt', { ascending: false });

    if (error) {
      console.error("Error fetching orders for export:", error);
      return [];
    }

    if (!orders) return [];

    // 3. I-format ang data para swak na swak sa hinihingi ng frontend Excel exporter natin
    const formattedOrders = orders.map((order: any) => {
      let slimCount = 0;
      let roundCount = 0;

      // Bilangin ang Slim at Round gallons per order
      if (order.order_items && Array.isArray(order.order_items)) {
        order.order_items.forEach((item: any) => {
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          const productName = product?.product_name?.toLowerCase() || "";

          if (productName.includes("slim")) slimCount += item.quantity;
          else if (productName.includes("round")) roundCount += item.quantity;
        });
      }

      // Kunin ang Location/Zone name
      const location = Array.isArray(order.location_pricing) ? order.location_pricing[0] : order.location_pricing;
      const zoneName = location?.location_name || "Walk-in";

      // Format the date to a readable string (e.g., 2026-03-24)
      const dateObj = new Date(order.order_dt);
      const formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

      return {
        id: `ORD-${order.order_id}`,
        date: formattedDate,
        name: order.name || "Unknown",
        zone: zoneName,
        slim: slimCount,
        round: roundCount,
        total: order.total_amount || 0,
        type: order.transaction_type || "N/A",
        payment: order.payment_mode || "Cash",
        status: order.current_status || "Pending"
      };
    });

    return formattedOrders;

  } catch (error) {
    console.error("Unexpected error in getOrdersForExport:", error);
    return [];
  }
}
