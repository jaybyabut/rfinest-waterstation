import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { orderId, newStatus, updatedAt } = await req.json();

    if (!orderId || !newStatus || !updatedAt) {
      return NextResponse.json({ error: 'orderId, newStatus, and updatedAt are required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Conflict resolution: only update if updatedAt is newer than DB value
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('updated_at')
      .eq('order_id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const existingUpdatedAt = new Date(order.updated_at).getTime();
    const incomingUpdatedAt = new Date(updatedAt).getTime();

    if (incomingUpdatedAt > existingUpdatedAt) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          current_status: newStatus,
          updated_at: updatedAt
        })
        .eq('order_id', orderId);

      if (updateError) {
        console.error('Update Status Sync Error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Sync Status API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
