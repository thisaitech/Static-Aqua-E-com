'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from 'lucide-react'

interface UserData {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchUsers()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }
      

      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-6">
      {/* Header */}
      <div className="mb-3 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Users</h1>
        <p className="text-xs sm:text-sm text-gray-600">Manage registered users</p>
      </div>

      {/* Stats */}
      <div className="mb-3 sm:mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 shadow-lg p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mt-0.5 sm:mt-1">{users.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Cards */}
      {users.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 shadow-lg p-8 text-center">
          <p className="text-gray-600">No users found</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 p-3 sm:p-4 hover:shadow-2xl hover:shadow-purple-200/50 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  {/* Name */}
                  {user.full_name && (
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 truncate">
                      {user.full_name}
                    </h3>
                  )}

                  {/* Email */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent font-semibold truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Phone */}
                  {user.phone && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-xs sm:text-sm text-gray-700">{user.phone}</span>
                    </div>
                  )}

                  {/* Registration Date */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] sm:text-xs text-gray-500">Joined {formatDate(user.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
