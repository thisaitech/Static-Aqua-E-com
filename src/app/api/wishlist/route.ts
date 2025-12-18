import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch user's wishlist
export async function GET(request: Request) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch wishlist
    const { data: wishlist, error } = await supabase
      .from('wishlists')
      .select('product_ids')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = No rows found
      throw error;
    }

    return NextResponse.json({
      product_ids: wishlist?.product_ids || []
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST - Update user's wishlist
export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { product_ids } = body;

    if (!Array.isArray(product_ids)) {
      return NextResponse.json({ error: 'product_ids must be an array' }, { status: 400 });
    }

    // Upsert wishlist
    const { data, error } = await supabase
      .from('wishlists')
      .upsert({
        user_id: user.id,
        product_ids,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ wishlist: data }, { status: 200 });
  } catch (error) {
    console.error('Error updating wishlist:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

// DELETE - Clear user's wishlist
export async function DELETE(request: Request) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear wishlist by setting product_ids to empty array
    const { error } = await supabase
      .from('wishlists')
      .upsert({
        user_id: user.id,
        product_ids: [],
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ message: 'Wishlist cleared' }, { status: 200 });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return NextResponse.json({ error: 'Failed to clear wishlist' }, { status: 500 });
  }
}
