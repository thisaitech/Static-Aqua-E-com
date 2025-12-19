// DIAGNOSTIC: Check if admin setup is correct
// Run this in your browser console (F12) after trying to login

import { createClient } from '@/lib/supabase/client'

export async function checkAdminSetup() {
  const supabase = createClient()

  
  // 1. Check if admins table exists
  const { data: admins, error: adminError } = await supabase
    .from('admins')
    .select('*')
  
  if (adminError) {
    console.error('❌ ADMINS TABLE ERROR:', adminError.message)
 
    return
  }
  


  
  // 2. Check if admin email exists
  const hasAdmin = admins.some(a => a.email === 'nanthini@thisaitech.com')
  
  if (!hasAdmin) {


  
    return
  }
  
  
  // 3. Check if admin user exists in auth
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {

    
    // 4. Check role detection
    const { data: adminCheck } = await supabase
      .from('admins')
      .select('*')
      .eq('email', user.email)
      .single()
    
    if (adminCheck) {
    
 
    } else {
   
    }
  } else {
 

  }
  

}

// Auto-run on import
checkAdminSetup()
