// DIAGNOSTIC: Check if admin setup is correct
// Run this in your browser console (F12) after trying to login

import { createClient } from '@/lib/supabase/client'

export async function checkAdminSetup() {
  const supabase = createClient()
  
  console.log('=== ADMIN SETUP DIAGNOSTIC ===')
  
  // 1. Check if admins table exists
  const { data: admins, error: adminError } = await supabase
    .from('admins')
    .select('*')
  
  if (adminError) {
    console.error('❌ ADMINS TABLE ERROR:', adminError.message)
    console.log('🔧 FIX: Run the SQL script from START_HERE.md Step 2')
    return
  }
  
  console.log('✅ Admins table exists')
  console.log('📋 Admin emails:', admins.map(a => a.email))
  
  // 2. Check if admin email exists
  const hasAdmin = admins.some(a => a.email === 'nanthini@thisaitech.com')
  
  if (!hasAdmin) {
    console.error('❌ Admin email NOT found in admins table')
    console.log('🔧 FIX: Run this SQL:')
    console.log(`INSERT INTO admins (email) VALUES ('nanthini@thisaitech.com');`)
    return
  }
  
  console.log('✅ Admin email found in database')
  
  // 3. Check if admin user exists in auth
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    console.log('✅ You are logged in as:', user.email)
    
    // 4. Check role detection
    const { data: adminCheck } = await supabase
      .from('admins')
      .select('*')
      .eq('email', user.email)
      .single()
    
    if (adminCheck) {
      console.log('✅ You are recognized as ADMIN')
      console.log('🎯 Should redirect to /admin/dashboard')
    } else {
      console.log('ℹ️ You are a regular USER')
    }
  } else {
    console.log('❌ Not logged in')
    console.log('🔧 Try logging in first')
  }
  
  console.log('=== END DIAGNOSTIC ===')
}

// Auto-run on import
checkAdminSetup()
