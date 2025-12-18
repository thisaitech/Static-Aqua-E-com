import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, // Our database order ID
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update order in database with payment details
    // Use service role client to bypass RLS
    if (orderId) {
      console.log('Updating order:', orderId, 'with payment details');

      // Create service role client (bypasses RLS)
      const supabaseAdmin = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          payment_status: 'completed',
          order_status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select();

      if (updateError) {
        console.error('❌ Error updating order:', updateError);
        console.error('Order ID:', orderId);
        console.error('Update error details:', JSON.stringify(updateError));
        // Return error so client knows update failed
        return NextResponse.json(
          {
            error: 'Failed to update order status',
            details: updateError.message,
            verified: true, // Payment is verified but DB update failed
          },
          { status: 500 }
        );
      }

      console.log('✅ Order updated successfully:', updateData);
    } else {
      console.warn('⚠️ No orderId provided for payment verification');
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
