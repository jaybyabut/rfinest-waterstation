'use server'
import { ensureAuthenticated } from "../../lib/supabase/server"
import { logActivity } from "./logActivity";

interface OrderInfo {
    slimCount: number;
    roundCount: number;
    locationId?: number;
    selectedZone?: string;
    name: string;
    location: string;
    mobileNumber: string;
    transaction_type: string;
    payment_mode: string;
    note?: string;
    pricePerUnit?: number;
}

export async function createOrder(orderInfo: OrderInfo) {
    const { supabase, user } = await ensureAuthenticated();

    // Validation: Prevent negative quantities or empty orders
    if (orderInfo.slimCount < 0 || orderInfo.roundCount < 0) {
        return { error: "Quantities cannot be negative." };
    }
    
    if (orderInfo.slimCount === 0 && orderInfo.roundCount === 0) {
        return { error: "Order must contain at least one item." };
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

    console.log("createOrder: Products fetched:", products);

    const slimProduct = products?.find((p: any) => p.product_name === 'Slim Gallon');
    const roundProduct = products?.find((p: any) => p.product_name === 'Round Gallon');


    // Fetch location details (price and id)
    let locationPrice = 0;
    let locationId = orderInfo.locationId;

    if (locationId) {
        const { data: locData, error: locError } = await supabase
            .from('location_pricing')
            .select('location_price')
            .eq('location_id', locationId)
            .single();

        if (locError || !locData) {
            console.error("Error fetching location by ID:", locError);
            return { error: "Invalid location ID" };
        }
        locationPrice = locData.location_price;
    } else if (orderInfo.selectedZone) {
        const { data: locData, error: locError } = await supabase
            .from('location_pricing')
            .select('location_id, location_price')
            .eq('location_name', orderInfo.selectedZone)
            .single();

        if (locError || !locData) {
            console.error("Error fetching location by Name:", locError);
            return { error: "Invalid location zone" };
        }
        locationPrice = locData.location_price;
        locationId = locData.location_id;
    } else {
        return { error: "Location or Zone is required to determine price" };
    }



    const items = [];
    if (orderInfo.slimCount > 0) {
        if (!slimProduct) return { error: "Slim Gallon product not found in database" };
        items.push({
            product_id: slimProduct.product_id,
            quantity: orderInfo.slimCount,
            unit_price: locationPrice
        });
    }
    if (orderInfo.roundCount > 0) {
        if (!roundProduct) return { error: "Round Gallon product not found in database" };
        items.push({
            product_id: roundProduct.product_id,
            quantity: orderInfo.roundCount,
            unit_price: locationPrice
        });
    }

    if (items.length === 0) {
        return { error: "No items to order" };
    }
    let rpcData, error;

    if (orderInfo.transaction_type === 'Walk-in') {
        const { data, error: rpcError } = await supabase.rpc('create_complete_order', {
            p_user_id: null,
            p_name: orderInfo.name,
            p_address: orderInfo.location,
            p_number: orderInfo.mobileNumber,
            p_location_id: locationId,
            p_items: items,
            p_transaction_type: orderInfo.transaction_type,
            p_payment_mode: orderInfo.payment_mode,
            p_note: orderInfo.note,
        });
        rpcData = data;
        error = rpcError;
    } else {
        const { data, error: rpcError } = await supabase.rpc('create_complete_order', {
            p_user_id: null,
            p_name: orderInfo.name,
            p_address: orderInfo.location,
            p_number: orderInfo.mobileNumber,
            p_location_id: locationId,
            p_items: items,
            p_transaction_type: orderInfo.transaction_type,
            p_payment_mode: orderInfo.payment_mode,
            p_note: orderInfo.note,

        });
        rpcData = data;
        error = rpcError;
    }

    if (error) {
        console.error("RPC Error:", error);
        return { error: error.message };
    }

    // Log the activity
    await logActivity(`Created ${orderInfo.transaction_type} order for ${orderInfo.name}`, { supabase, user });

    return { success: true, data: rpcData };
}
