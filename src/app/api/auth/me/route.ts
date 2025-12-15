import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ user: null, role: null })
  }

  // Check if user is admin
  const { data: adminData } = await supabase
    .from('admins')
    .select('*')
    .eq('email', user.email)
    .single()

  if (adminData) {
    return NextResponse.json({ user, role: 'admin' })
  }

  // Otherwise, user role
  return NextResponse.json({ user, role: 'user' })
}
