import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { idempotencyKey, orderData } = await req.json();

    if (!idempotencyKey) {
      return NextResponse.json({ error: 'Idempotency key is required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Check for duplicate using idempotency key
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('order_id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json({ success: true, alreadyExists: true, data: existingOrder });
    }

    // Call create_complete_order RPC
    // Note: The RPC might need to be updated to accept p_idempotency_key
    // For now, we'll try to insert it if the RPC allows or manually update after
    const { data, error } = await supabase.rpc('create_complete_order', {
      p_user_id: orderData.userId || null,
      p_name: orderData.name,
      p_address: orderData.location,
      p_number: orderData.mobileNumber,
      p_location_id: orderData.locationId,
      p_items: orderData.items,
      p_transaction_type: orderData.transaction_type,
      p_payment_mode: orderData.payment_mode,
      p_note: orderData.note,
    });

    if (error) {
      console.error('RPC Sync Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update the idempotency key for the newly created order
    // Assuming data returns the new order_id or similar
    // Based on createOrder.ts, it returns rpcData
    if (data) {
      await supabase
        .from('orders')
        .update({ idempotency_key: idempotencyKey })
        .eq('order_id', data); // Assuming RPC returns order_id
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Sync Order API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
