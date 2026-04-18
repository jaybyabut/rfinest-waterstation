'use server'
import { ensureAuthenticated } from "../../lib/supabase/server"
import { logActivity } from "./logActivity";

interface SaveOrderEditParams {
    orderId: string;
    slimCount: number;
    roundCount: number;
    pricePerUnit: number;
}

export async function saveOrderEdit({ orderId, slimCount, roundCount, pricePerUnit }: SaveOrderEditParams) {
    const { supabase, user } = await ensureAuthenticated();

    // Validation
    if (slimCount < 0 || roundCount < 0) {
        return { error: "Quantities cannot be negative." };
    }
    if (slimCount === 0 && roundCount === 0) {
        return { error: "Order must have at least one item." };
    }

    const newTotal = (slimCount + roundCount) * pricePerUnit;

    const role = user.app_metadata?.role || user.user_metadata?.role || user.role;

    try {
        let updateQuery = supabase
            .from("orders")
            .update({ total_amount: newTotal })
            .eq("order_id", orderId)
            .in("current_status", ["Pending", "Pickup"])
            .select("order_id");
        
        if (role !== 'admin' && role !== 'employee') {
            updateQuery = updateQuery.eq("user_id", user.id);
        }

        // Update order total
        const { data, error: orderError } = await updateQuery;

        if (orderError) throw orderError;
        
        if (!data || data.length === 0) {
            return { error: "Update failed: Order might have been processed already or does not exist." };
        }

        // Fetch product IDs
        const { data: allProducts, error: productsError } = await supabase
            .from("products")
            .select("product_id, product_name");

        if (productsError) throw productsError;

        const slimProduct = allProducts?.find((p) => p.product_name?.toLowerCase().includes("slim"));
        const roundProduct = allProducts?.find((p) => p.product_name?.toLowerCase().includes("round"));

        const slimProductId = slimProduct?.product_id;
        const roundProductId = roundProduct?.product_id;

        // Get existing items for this order
        const { data: currentItems, error: itemsFetchError } = await supabase
            .from("order_items")
            .select("product_id")
            .eq("order_id", orderId);

        if (itemsFetchError) throw itemsFetchError;

        const existingProductIds = currentItems?.map(item => item.product_id) || [];

        // Helper to upsert/delete order items
        const saveItem = async (productId: string | undefined, quantity: number) => {
            if (!productId) return;
            const itemExists = existingProductIds.includes(productId);

            if (itemExists && quantity === 0) {
                const { error } = await supabase.from("order_items").delete()
                    .eq("order_id", orderId).eq("product_id", productId);
                if (error) throw error;
            } else if (itemExists && quantity > 0) {
                const { error } = await supabase.from("order_items").update({
                    quantity: quantity, unit_price: pricePerUnit, subtotal: quantity * pricePerUnit
                }).eq("order_id", orderId).eq("product_id", productId);
                if (error) throw error;
            } else if (!itemExists && quantity > 0) {
                const { error } = await supabase.from("order_items").insert({
                    order_id: orderId, product_id: productId, quantity: quantity, unit_price: pricePerUnit, subtotal: quantity * pricePerUnit
                });
                if (error) throw error;
            }
        };

        await saveItem(slimProductId, slimCount);
        await saveItem(roundProductId, roundCount);

        // Log the activity
        await logActivity(`Edited order #${orderId.substring(0, 8)} — new total: ₱${newTotal}`);

        return { success: true };
    } catch (e) {
        console.error("Error saving order edit:", e);
        return { error: "An unexpected error occurred while updating the order." };
    }
}
