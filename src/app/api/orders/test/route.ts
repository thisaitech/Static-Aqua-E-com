import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Test endpoint to check orders in database
export async function GET(request: Request) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        error: 'Unauthorized',
        user: null,
        authenticated: false
      }, { status: 401 });
    }

    // Fetch all orders for this user (without RLS check)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({
        error: error.message,
        details: error,
        user: { id: user.id, email: user.email },
        authenticated: true
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      authenticated: true,
      orderCount: orders?.length || 0,
      orders: orders || [],
    });
  } catch (error: any) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error?.message,
    }, { status: 500 });
  }
}
