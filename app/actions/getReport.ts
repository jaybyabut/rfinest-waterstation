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

    const startOfToday = `${phYear}-${phMonth}-${phDay}T00:00:00+08:00`;
    const endOfToday = `${phYear}-${phMonth}-${phDay}T23:59:59.999+08:00`;

    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const monthIndex = parseInt(monthStr) - 1;

    // Last day of selected month
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();

    // Manila Time strings (with UTC+8 offset for correct timestamptz comparison)
    const startOfMonth = `${yearStr}-${monthStr}-01T00:00:00+08:00`;
    const endOfMonth = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}T23:59:59.999+08:00`;

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
        const { data: todayOrdersRaw, error: todayError } = await supabase
            .from('orders')
            .select(`
                order_dt,
                updated_at,
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
            .eq('current_status', 'Delivered')
            // MODIFIED: Fetch kapag updated OR created today
            .or(`updated_at.gte.${startOfToday},order_dt.gte.${startOfToday}`)
            .range(0, 9999);

        if (todayError) {
            console.error("Error fetching today's orders:", todayError);
            throw todayError;
        }

        if (todayOrdersRaw) {
            // ================= FIX: FALLBACK LOGIC =================
            // Gamitin ang updated_at, pero kung walang laman (lumang data), gamitin ang order_dt
            const todayOrders = todayOrdersRaw.filter((order: any) => {
                const dateToUse = new Date(order.updated_at || order.order_dt);
                return dateToUse >= new Date(startOfToday) && dateToUse <= new Date(endOfToday);
            });

            todayOrders.forEach((order: any) => {
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
                } else if (order.payment_mode?.toLowerCase() === 'e-bank') {
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
        const { data: monthOrdersRaw, error: monthError } = await supabase
            .from('orders')
            .select('order_dt, updated_at, total_amount')
            .eq('current_status', 'Delivered')
            // MODIFIED: Fetch kapag updated OR created sa selected month
            .or(`updated_at.gte.${startOfMonth},order_dt.gte.${startOfMonth}`)
            .range(0, 9999);

        if (monthError) {
            console.error("Error fetching monthly orders:", monthError);
            throw monthError;
        }

        if (monthOrdersRaw) {
            // ================= FIX: FALLBACK LOGIC =================
            const monthOrders = monthOrdersRaw.filter((order: any) => {
                const dateToUse = new Date(order.updated_at || order.order_dt);
                return dateToUse >= new Date(startOfMonth) && dateToUse <= new Date(endOfMonth);
            });

            result.monthly.earnings = monthOrders.reduce((sum: any, order: any) => sum + (order.total_amount || 0), 0);
        }

        return { success: true, data: result };

    } catch (error) {
        console.error("Analytics aggregation error:", error);
        return { success: false, error: "Failed to aggregate analytics data." };
    }
}
