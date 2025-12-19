import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  district: string;
  pincode: string;
  is_default: boolean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const userId = params.id;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify that the user is updating their own data
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { full_name, phone, addresses, address } = body;


    let updateData: any = {};

    if (full_name !== undefined) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;

    // Handle addresses array (new approach)
    if (addresses !== undefined) {
   
      updateData.addresses = addresses;
    }
    // Handle single address (for backward compatibility)
    else if (address !== undefined) {
      const { full_name: addrName, phone: addrPhone, address: addrStreet, city, state, district, pincode } = address;

      // Get existing addresses
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('addresses')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching existing addresses:', fetchError);
      }

      const existingAddresses: Address[] = existingUser?.addresses || [];

      // Create new address object
      const newAddress: Address = {
        id: `addr-${Date.now()}`,
        label: 'Home',
        full_name: addrName || full_name || '',
        phone: addrPhone || phone || '',
        address: addrStreet || '',
        city: city || '',
        state: state || district || '',
        district: district || '',
        pincode: pincode || '',
        is_default: existingAddresses.length === 0 // First address is default
      };


      // If this is the first address or marked as default, unset other defaults
      if (newAddress.is_default) {
        existingAddresses.forEach(addr => addr.is_default = false);
      }

      // Add new address to array
      updateData.addresses = [...existingAddresses, newAddress];
    }

    // Update user data
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }


    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('Error in user update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const userId = params.id;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user data
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('Error in user fetch API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
