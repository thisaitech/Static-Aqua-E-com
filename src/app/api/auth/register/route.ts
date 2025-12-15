import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password, userData } = await request.json()

  const supabase = createClient()

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Store additional user data in users table
  if (data.user) {
    const { error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email: email,
          ...userData,
          created_at: new Date().toISOString(),
        },
      ])

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ user: data.user })
}
