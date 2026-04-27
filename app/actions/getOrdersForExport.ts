"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOrdersForExport(selectedMonth: string) {
  try {
    const supabase = await createClient();

    // 1. Kunin ang start at end date ng napiling buwan sa Manila Time
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const monthIndex = parseInt(monthStr) - 1;
    const startDate = `${yearStr}-${monthStr}-01T00:00:00`;
    
    // Kunin ang huling araw ng buwan
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const endDate = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}T23:59:59.999`;

    // 2. I-query ang database
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

    // ================= FIX 1: FILTER ONLY DELIVERED ORDERS =================
    const validOrders = orders.filter((order: any) => {
      const status = order.current_status?.toLowerCase() || "";
      return status === "delivered";
    });

    // ================= FIX 2: PRE-CALCULATE DAILY TOTALS (MANILA TIME) =================
    const dailyTotals: Record<string, number> = {};
    const manilaFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    validOrders.forEach((order: any) => {
      const formattedDate = manilaFormatter.format(new Date(order.order_dt));
      
      // I-save na rin natin yung formattedDate sa object para di na ulitin sa baba
      order._formattedDate = formattedDate; 
      
      // I-add yung total_amount ng order na 'to sa total ng araw na 'yon
      dailyTotals[formattedDate] = (dailyTotals[formattedDate] || 0) + (order.total_amount || 0);
    });

    // 3. I-format ang data para swak na swak sa hinihingi ng frontend Excel exporter natin
    const seenDates = new Set<string>();

    const formattedOrders = validOrders.map((order: any) => {
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

      // Kunin yung pre-calculated date natin
      const fDate = order._formattedDate;

      // Logic: Ilagay lang ang daily total sa PINAKA-UNANG order na lalabas para sa araw na 'yon
      let currentDailyTotal: number | string = ""; 
      if (!seenDates.has(fDate)) {
        currentDailyTotal = dailyTotals[fDate];
        seenDates.add(fDate); // I-mark na nalagyan na natin ng total ang araw na ito
      }

      return {
        id: `ORD-${order.order_id}`,
        date: fDate,
        name: order.name || "Unknown",
        zone: zoneName,
        slim: slimCount,
        round: roundCount,
        total: order.total_amount || 0,
        daily_total: currentDailyTotal, // <-- DITO PAPASOK ANG DAILY TOTAL COLUMN NATIN
        type: order.transaction_type || "N/A",
        payment: order.payment_mode || "Cash"
      };
    });

    return formattedOrders;

  } catch (error) {
    console.error("Unexpected error in getOrdersForExport:", error);
    return [];
  }
}
