'use server'
import { ensureRole } from "../../lib/supabase/server"

export async function getAnalyticsData(selectedMonth: string) {
    const { supabase } = await ensureRole(['admin']);

    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    // Calculate dates for queries
    const todayPhParts = formatter.formatToParts(new Date());
    const phYear = todayPhParts.find(p => p.type === 'year')?.value;
    const phMonth = todayPhParts.find(p => p.type === 'month')?.value;
    const phDay = todayPhParts.find(p => p.type === 'day')?.value;

    const startOfToday = `${phYear}-${phMonth}-${phDay}T00:00:00`;
    const endOfToday = `${phYear}-${phMonth}-${phDay}T23:59:59.999`;

    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const monthIndex = parseInt(monthStr) - 1;

    // Last day of selected month
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();

    // Manila Time strings
    const startOfMonth = `${yearStr}-${monthStr}-01T00:00:00`;
    const endOfMonth = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}T23:59:59.999`;

    const result = {
        today: {
            gallons: { slim: 0, round: 0, total: 0 },
            earnings: { walkIn: 0, online: 0, cash: 0, eBank: 0, total: 0 }
        },
        monthly: {
            earnings: 0
        }
    };

    try {
        const { data: todayOrders, error: todayError } = await supabase
            .from('orders')
            .select(`
                total_amount,
                transaction_type,
                payment_mode,
                order_items (
                    quantity,
                    products (
                        product_name
                    )
                )
            `)
            .gte('order_dt', startOfToday)
            .lte('order_dt', endOfToday)
            .eq('current_status', 'Delivered');

        if (todayError) {
            console.error("Error fetching today's orders:", todayError);
            throw todayError;
        }

        if (todayOrders) {
            todayOrders.forEach(order => {
                // Calculate Earnings
                const amount = order.total_amount || 0;
                result.today.earnings.total += amount;

                // Group by transaction_type
                if (order.transaction_type?.toLowerCase() === 'walk-in') {
                    result.today.earnings.walkIn += amount;
                } else if (order.transaction_type?.toLowerCase() === 'call') {
                    result.today.earnings.online += amount;
                }

                // Group by payment_mode
                if (order.payment_mode?.toLowerCase() === 'cash') {
                    result.today.earnings.cash += amount;
                } else {
                    result.today.earnings.eBank += amount;
                }

                // Calculate Gallons
                order.order_items?.forEach((item: any) => {
                    const productName = item.products?.product_name?.toLowerCase() || "";
                    const qty = Number(item.quantity) || 0;

                    if (productName.includes('slim')) {
                        result.today.gallons.slim += qty;
                    } else if (productName.includes('round')) {
                        result.today.gallons.round += qty;
                    }
                    result.today.gallons.total += qty;
                });
            });
        }

        // Fetch Monthly Orders
        const { data: monthOrders, error: monthError } = await supabase
            .from('orders')
            .select('total_amount')
            .gte('order_dt', startOfMonth)
            .lt('order_dt', endOfMonth)
            .eq('current_status', 'Delivered');

        if (monthError) {
            console.error("Error fetching monthly orders:", monthError);
            throw monthError;
        }

        if (monthOrders) {
            result.monthly.earnings = monthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        }

        return { success: true, data: result };

    } catch (error) {
        console.error("Analytics aggregation error:", error);
        return { success: false, error: "Failed to aggregate analytics data." };
    }
}
