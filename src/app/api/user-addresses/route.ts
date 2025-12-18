import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch user's addresses from users.addresses column
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's addresses from public.users table
    const { data: userData, error } = await supabase
      .from('users')
      .select('addresses')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user addresses:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const addresses = userData?.addresses || [];

    // Sort: default first, then by creation date (newest first)
    const sortedAddresses = [...addresses].sort((a: any, b: any) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return NextResponse.json({ addresses: sortedAddresses });
  } catch (error) {
    console.error('Error in GET /api/user-addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add new address to users.addresses array
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, phone, email, address, city, district, pin_code, is_default } = body;

    // Validate required fields
    if (!full_name || !phone || !address || !city || !district || !pin_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch current addresses
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('addresses')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    let currentAddresses = userData?.addresses || [];

    // If this is being set as default, unset all other defaults
    if (is_default) {
      currentAddresses = currentAddresses.map((addr: any) => ({
        ...addr,
        is_default: false
      }));
    }

    // Create new address object
    const newAddress = {
      id: crypto.randomUUID(),
      full_name,
      phone,
      email: email || user.email,
      address,
      city,
      district,
      pin_code,
      is_default: is_default || currentAddresses.length === 0, // First address is default
      created_at: new Date().toISOString()
    };

    // Add new address to array
    const updatedAddresses = [...currentAddresses, newAddress];

    // Update user's addresses
    const { data, error: updateError } = await supabase
      .from('users')
      .update({ addresses: updatedAddresses })
      .eq('id', user.id)
      .select('addresses')
      .single();

    if (updateError) {
      console.error('Error updating addresses:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ address: newAddress, addresses: data.addresses }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/user-addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update an address in the array
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id: addressId, full_name, phone, email, address, city, district, pin_code, is_default } = body;

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
    }

    // Fetch current addresses
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('addresses')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    let addresses = userData?.addresses || [];

    // Find and update the address
    const addressIndex = addresses.findIndex((addr: any) => addr.id === addressId);
    if (addressIndex === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If setting as default, unset others
    if (is_default) {
      addresses = addresses.map((addr: any) => ({
        ...addr,
        is_default: addr.id === addressId
      }));
    }

    // Update the address
    addresses[addressIndex] = {
      ...addresses[addressIndex],
      full_name: full_name || addresses[addressIndex].full_name,
      phone: phone || addresses[addressIndex].phone,
      email: email || addresses[addressIndex].email,
      address: address || addresses[addressIndex].address,
      city: city || addresses[addressIndex].city,
      district: district || addresses[addressIndex].district,
      pin_code: pin_code || addresses[addressIndex].pin_code,
      is_default: is_default !== undefined ? is_default : addresses[addressIndex].is_default,
      updated_at: new Date().toISOString()
    };

    // Update user's addresses
    const { data, error: updateError } = await supabase
      .from('users')
      .update({ addresses })
      .eq('id', user.id)
      .select('addresses')
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ address: addresses[addressIndex], addresses: data.addresses });
  } catch (error) {
    console.error('Error in PATCH /api/user-addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove address from array
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
    }

    // Fetch current addresses
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('addresses')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const addresses = userData?.addresses || [];

    // Remove the address
    const updatedAddresses = addresses.filter((addr: any) => addr.id !== addressId);

    // If we deleted the default address and there are still addresses, make the first one default
    const hasDefault = updatedAddresses.some((addr: any) => addr.is_default);
    if (!hasDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].is_default = true;
    }

    // Update user's addresses
    const { error: updateError } = await supabase
      .from('users')
      .update({ addresses: updatedAddresses })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, addresses: updatedAddresses });
  } catch (error) {
    console.error('Error in DELETE /api/user-addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
