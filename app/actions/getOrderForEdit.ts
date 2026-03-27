'use server'
import { ensureRole } from "../../lib/supabase/server"

interface OrderItemRecord {
    product_id: string;
    quantity: number;
    subtotal: number;
    products?: { product_name: string }[] | { product_name: string } | null;
}

export async function getOrderForEdit(orderId: string) {
    const { supabase } = await ensureRole(['admin']);

    const { data, error } = await supabase
        .from("orders")
        .select(`
            order_id,
            name,
            number,
            total_amount,
            current_status,
            location_pricing ( location_name, location_price ),
            order_items (
                product_id, quantity, subtotal,
                products ( product_name )
            )
        `)
        .eq("order_id", orderId)
        .single();

    if (error || !data) {
        console.error("Error fetching order for edit:", error);
        return { error: "Order not found. Please try again." };
    }

    let slimCount = 0;
    let roundCount = 0;

    data?.order_items?.forEach((item: OrderItemRecord) => {
        const productData = Array.isArray(item.products) ? item.products[0] : item.products;
        const productName = productData?.product_name?.toLowerCase() || "";
        if (productName.includes("slim")) {
            slimCount = item.quantity || 0;
        } else if (productName.includes("round")) {
            roundCount = item.quantity || 0;
        }
    });

    const locData = Array.isArray(data.location_pricing) ? data.location_pricing[0] : data.location_pricing;

    return {
        success: true,
        order: {
            orderId: data.order_id,
            displayId: `ORD-${orderId.substring(0, 8).toUpperCase()}`,
            customerName: data.name || "N/A",
            contactNumber: data.number || "N/A",
            zone: locData?.location_name || "N/A",
            pricePerUnit: locData?.location_price || 0,
            slimCount,
            roundCount,
        }
    };
}
