'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

type UserRole = 'admin' | 'user' | null

interface AuthContextType {
  user: User | null
  userRole: UserRole
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check active sessions and sets the user
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        await checkUserRole(session.user.email!)
      }
      
      setLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        await checkUserRole(session.user.email!)
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUserRole = async (email: string) => {
    try {
      // Simple admin check - just check if email matches
      if (email === 'nanthini@thisaitech.com') {
     
        setUserRole('admin')
        return 'admin'
      }

      // Try to check admins table (with better error handling)
      try {
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('email')
          .eq('email', email)
          .maybeSingle()

       

        if (adminData) {
  
          setUserRole('admin')
          return 'admin'
        }
      } catch (e) {
      
      }

      // Default to user
     
      setUserRole('user')
      return 'user'
    } catch (error) {
      console.error('Error checking user role:', error)
      setUserRole('user')
      return 'user'
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) return { error }

      if (data.user) {
        // Check user role first
        const role = await checkUserRole(email)
        
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Redirect based on role
        if (role === 'admin' || email === 'nanthini@thisaitech.com') {
 
          router.push('/admin/dashboard')
        } else {
  
          router.push('/')
        }
      }

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) return { error }

      if (data.user) {
        // Store user data in users table
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
          console.error('Error storing user data:', insertError)
        }

        setUserRole('user')
        router.push('/')
      }

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
