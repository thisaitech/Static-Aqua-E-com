'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  Image as ImageIcon,
  ShoppingBag,
  Users,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Grid3x3,
  Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Grid3x3 },
  { href: '/admin/banners', label: 'Hero Banners', icon: ImageIcon },
  { href: '/admin/top-deals', label: 'Top Deals', icon: Flame },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userRole, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
      } else if (userRole !== 'admin') {
        router.push('/')
      }
    }
  }, [user, userRole, loading, router])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user || userRole !== 'admin') {
    return null
  }

  const getPageTitle = () => {
    const item = menuItems.find(item => pathname === item.href)
    return item?.label || 'Admin Panel'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-900 z-50 transition-transform duration-300 lg:translate-x-0 shadow-2xl shadow-purple-900/50',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-purple-800/50 bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-200 via-fuchsia-200 to-purple-300 bg-clip-text text-transparent">Admin Panel</h2>
              <p className="text-xs text-purple-300/80 font-medium">Rainbow Aquarium</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <X className="w-5 h-5 text-purple-200" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/50 scale-105'
                      : 'text-purple-200/90 hover:bg-white/10 hover:text-white hover:translate-x-1'
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Decorative gradient at bottom */}
          <div className="h-24 bg-gradient-to-t from-purple-600/20 to-transparent pointer-events-none" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-purple-100/50 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            {/* Left: Mobile menu + Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <Menu className="w-5 h-5 text-purple-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-700 bg-clip-text text-transparent">
                  {getPageTitle()}
                </h1>
                <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full mt-1" />
              </div>
            </div>

            {/* Right: User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-purple-50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-500/30 ring-2 ring-white group-hover:scale-105 transition-transform">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-800">{user.email?.split('@')[0]}</p>
                  <p className="text-xs font-medium bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-purple-600 group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-100 py-2 z-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-fuchsia-50/50 -z-10" />
                    <button
                      onClick={() => {
                        signOut()
                        setUserMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all duration-200 group"
                    >
                      <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
