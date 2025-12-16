import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch orders (role-based)
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
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // If not admin, filter by user_id
    if (!adminData) {
      query = query.eq('user_id', user.id);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    return NextResponse.json({ orders, isAdmin: !!adminData });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST - Create new order
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
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
      products,
      subtotal,
      shipping_charge,
      total_amount,
      payment_method,
      razorpay_order_id,
    } = body;

    // Validate required fields
    if (!customer_name || !customer_email || !products || products.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_pincode,
        products,
        subtotal,
        shipping_charge,
        total_amount,
        payment_method,
        razorpay_order_id,
        order_status: 'placed',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
