'use server'
import { ensureAuthenticated } from "../../lib/supabase/server"
import { logActivity } from "./logActivity";

export async function createOnlineOrder(formData: FormData) {
    const { supabase, user } = await ensureAuthenticated();
    const userId = user.id;

    // Extract order info from FormData
    const slimCount = parseInt(formData.get('slimCount') as string) || 0;
    const roundCount = parseInt(formData.get('roundCount') as string) || 0;
    const paymentMethod = formData.get('paymentMethod') as string;
    const transaction_type = formData.get('transaction_type') as string;
    const payment_mode = formData.get('payment_mode') as string;

    // Get receipt file
    const receipt = formData.get('receipt') as File | null;
    let proof_payment_url = null;

    // Validation: Prevent negative quantities
    if (slimCount < 0 || roundCount < 0) {
        return { error: "Quantities cannot be negative." };
    }

    if (slimCount === 0 && roundCount === 0) {
        return { error: "Order must contain at least one item." };
    }

    const { data: userDetails, error: userError } = await supabase
        .from('users')
        .select(`
                first_name, 
                last_name, 
                address, 
                location_id,
                mobile_no, 
            location_pricing (
                location_price
            )
        `)
        .eq('user_id', userId)
        .single();

    if (userError) {
        console.error("Error fetching user details:", userError);
        return { error: "Failed to fetch user information" };
    }

    const pricingData = userDetails?.location_pricing as any;
    const locationPrice = Array.isArray(pricingData)
        ? pricingData[0]?.location_price
        : pricingData?.location_price;
    const locationId = userDetails?.location_id;

    // Handle File Upload if E-Bank with security validation
    if (paymentMethod === 'E-Bank' && receipt && receipt.size > 0) {
        const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/heic'];
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB

        if (!ALLOWED_TYPES.includes(receipt.type)) {
            return { error: "Only PNG, JPG, and HEIC images are allowed for receipts." };
        }

        if (receipt.size > MAX_SIZE) {
            return { error: "Receipt image too large. Max size is 5MB." };
        }

        // Safe extension extraction
        const fileExt = receipt.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('proof_payment')
            .upload(filePath, receipt);

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return { error: "Failed to upload receipt image." };
        }
        proof_payment_url = filePath;
    } else if (paymentMethod === 'E-Bank' && (!receipt || receipt.size === 0)) {
        return { error: "Receipt image is required for E-Bank payments." };
    }

    // get product details
    const { data: products, error: productError } = await supabase
        .from('products')
        .select('product_id, product_name')
        .in('product_name', ['Slim Gallon', 'Round Gallon']);

    if (productError) {
        console.error("Error fetching products:", productError);
        return { error: "Failed to fetch product information" };
    }

    const slimProduct = products?.find((p: any) => p.product_name === 'Slim Gallon');
    const roundProduct = products?.find((p: any) => p.product_name === 'Round Gallon');

    const items = [];
    if (slimCount > 0) {
        if (!slimProduct) return { error: "Slim Gallon product not found in database" };
        items.push({
            product_id: slimProduct.product_id,
            quantity: slimCount,
            unit_price: locationPrice
        });
    }
    if (roundCount > 0) {
        if (!roundProduct) return { error: "Round Gallon product not found in database" };
        items.push({
            product_id: roundProduct.product_id,
            quantity: roundCount,
            unit_price: locationPrice
        });
    }

    if (items.length === 0) {
        return { error: "No items to order" };
    }

    const { data: rpcData, error } = await supabase.rpc('create_complete_order', {
        p_user_id: userId,
        p_name: userDetails?.first_name + ' ' + userDetails?.last_name,
        p_address: userDetails?.address,
        p_number: userDetails.mobile_no,
        p_location_id: locationId,
        p_items: items,
        p_transaction_type: transaction_type,
        p_payment_mode: payment_mode,
        p_proof_payment: proof_payment_url,
    });

    if (error) {
        console.error("RPC Error:", error);
        return { error: error.message };
    }


    return { success: true, data: rpcData };
}
