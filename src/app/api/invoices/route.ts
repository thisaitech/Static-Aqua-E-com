import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST - Create invoice for an order
export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Check authentication and admin status
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!adminData) {
      console.error('User is not an admin:', user.id);
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    console.log('Creating invoice for order:', orderId);

    // Fetch the order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      return NextResponse.json({ error: `Order not found: ${orderError.message}` }, { status: 404 });
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if invoice already exists for this order
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, invoice_number, invoice_date')
      .eq('order_id', orderId)
      .single();

    if (existingInvoice) {
      console.log('Invoice already exists:', existingInvoice);
      return NextResponse.json({
        invoice: existingInvoice,
        message: 'Invoice already exists for this order'
      });
    }

    // Generate invoice number using the database function
    console.log('Generating invoice number...');
    const { data: invoiceNumberData, error: invoiceNumError } = await supabase
      .rpc('generate_invoice_number');

    if (invoiceNumError) {
      console.error('Error generating invoice number:', invoiceNumError);
      return NextResponse.json({
        error: `Failed to generate invoice number: ${invoiceNumError.message}. Please ensure the generate_invoice_number() function exists in your database.`
      }, { status: 500 });
    }

    const invoiceNumber = invoiceNumberData;
    console.log('Generated invoice number:', invoiceNumber);

    // Create invoice record
    const invoiceData = {
      order_id: orderId,
      invoice_number: invoiceNumber,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      billing_address: order.shipping_address,
      billing_city: order.shipping_city,
      billing_state: order.shipping_state,
      billing_pincode: order.shipping_pincode,
      items: order.products,
      subtotal: order.subtotal,
      shipping_charge: order.shipping_charge,
      tax_amount: 0, // Add tax calculation if needed
      discount_amount: 0, // Add discount if applicable
      total_amount: order.total_amount,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      razorpay_payment_id: order.razorpay_payment_id,
    };

    console.log('Creating invoice with data:', invoiceData);

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return NextResponse.json({
        error: `Failed to create invoice: ${invoiceError.message}. Details: ${invoiceError.hint || 'No additional details'}`
      }, { status: 500 });
    }

    console.log('Invoice created successfully:', invoice);
    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('Error in invoice creation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}

// GET - Fetch invoices
export async function GET(request: Request) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('invoices')
      .select(`
        *,
        orders!inner(
          user_id,
          order_status
        )
      `)
      .order('created_at', { ascending: false });

    // If not admin, filter by user's orders
    if (!adminData) {
      query = query.eq('orders.user_id', user.id);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }

    return NextResponse.json({ invoices, isAdmin: !!adminData });
  } catch (error) {
    console.error('Error in invoice fetch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
