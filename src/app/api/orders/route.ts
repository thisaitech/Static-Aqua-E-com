import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// GET - Fetch orders (role-based)
export async function GET(request: Request) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in GET /api/orders:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching orders for user:', user.id);
    console.log('User email:', user.email);

    // Check if user is admin by email
    const isAdmin = user.email === 'nanthini@thisaitech.com';

    console.log('Is admin (by email):', isAdmin);

    // Use service role client for admin to bypass RLS
    const queryClient = isAdmin
      ? createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
      : supabase;

    let query = queryClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // If not admin, filter by user_id
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log(`Fetched ${orders?.length || 0} orders from Supabase`);
    if (orders && orders.length > 0) {
      console.log('First order sample:', JSON.stringify(orders[0], null, 2));
    }

    return NextResponse.json({ orders, isAdmin });
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

    // Debug: Log products being saved
    console.log('Creating order with products:', JSON.stringify(products, null, 2));
    console.log('Number of products:', products.length);

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

    if (error) {
      console.error('Supabase error creating order:', error);
      throw error;
    }

    // Debug: Log what was actually saved
    console.log('Order created successfully:', order.id);
    console.log('Saved products:', JSON.stringify(order.products, null, 2));
    console.log('Saved products count:', order.products?.length || 0);

    // Decrease stock quantity for each product using service role
    try {
      // Use service role client to bypass RLS for product updates
      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      for (const product of products) {
        const productId = product.id;
        const quantity = product.quantity || 1;

        console.log(`Processing stock update for product ${productId}, ordered quantity: ${quantity}`);

        // Get current stock quantity using service role
        const { data: currentProduct, error: fetchError } = await serviceClient
          .from('products')
          .select('quantity')
          .eq('id', productId)
          .single();

        if (fetchError) {
          console.error(`Error fetching product ${productId}:`, fetchError);
          continue; // Skip this product but continue with others
        }

        if (currentProduct && currentProduct.quantity !== null) {
          const newQuantity = Math.max(0, currentProduct.quantity - quantity);

          console.log(`Updating stock for product ${productId}: ${currentProduct.quantity} -> ${newQuantity}`);

          // Update product quantity using service role
          const { error: updateError } = await serviceClient
            .from('products')
            .update({ quantity: newQuantity })
            .eq('id', productId);

          if (updateError) {
            console.error(`Error updating stock for product ${productId}:`, updateError);
            console.error('Update error details:', JSON.stringify(updateError, null, 2));
          } else {
            console.log(`✓ Stock successfully updated for product ${productId}: ${currentProduct.quantity} -> ${newQuantity}`);
          }
        } else {
          console.log(`Product ${productId} has null quantity, skipping stock update`);
        }
      }
    } catch (stockError) {
      console.error('Error updating stock quantities:', stockError);
      // Don't fail the order creation if stock update fails
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
