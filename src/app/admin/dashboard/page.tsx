'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, CheckCircle, Tag, IndianRupee, PackageX, AlertTriangle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  outOfStock: number
  newArrivals: number
  completedOrders: number
  totalRevenue: number
}

interface Product {
  id: string
  name: string
  stock_status: string
  quantity: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    newArrivals: 0,
    completedOrders: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchStats()

    // Set up real-time subscription for products table changes
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchStats()
        }
      )
      .subscribe()

    // Set up real-time subscription for orders table changes
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(productsChannel)
      supabase.removeChannel(ordersChannel)
    }
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch all products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')

      if (productsError) {
        console.error('Error fetching products:', productsError)
        return
      }

      // Fetch all orders for revenue calculation
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, payment_status')


      if (ordersError) {
        console.error('Error fetching orders:', ordersError)
        console.error('Error details:', {
          message: ordersError.message,
          details: ordersError.details,
          hint: ordersError.hint,
          code: ordersError.code
        })
      }

      if (products) {
        // Count products with is_active = true
        const activeProducts = products.filter(p => p.is_active === true).length

        // Count products with stock_status = 'out_of_stock'
        const outOfStock = products.filter(p => p.stock_status === 'out_of_stock').length

        // Count products with is_new = true
        const newArrivals = products.filter(p => p.is_new === true).length

        // Calculate total revenue and count completed orders
        let totalRevenue = 0
        let completedOrders = 0
        if (orders && orders.length > 0) {
          const completedOrdersList = orders.filter(order => order.payment_status === 'completed')
          completedOrders = completedOrdersList.length
          totalRevenue = completedOrdersList.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        } else {
       
        }


        setStats({
          totalProducts: products.length,
          activeProducts,
          outOfStock,
          newArrivals,
          completedOrders,
          totalRevenue,
        })

        // Separate low stock and out of stock products
        const lowStock = products.filter(p => p.stock_status === 'low_stock')
        const outStock = products.filter(p => p.stock_status === 'out_of_stock')

        setLowStockProducts(lowStock)
        setOutOfStockProducts(outStock)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const dashboardCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconBg: 'from-blue-400 to-cyan-400'
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      iconBg: 'from-emerald-400 to-teal-400'
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50',
      iconBg: 'from-orange-400 to-amber-400'
    },
    {
      title: 'New Arrivals',
      value: stats.newArrivals,
      icon: Tag,
      gradient: 'from-purple-500 to-fuchsia-500',
      bgGradient: 'from-purple-50 to-fuchsia-50',
      iconBg: 'from-purple-400 to-fuchsia-400'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      gradient: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-50 to-purple-50',
      iconBg: 'from-indigo-400 to-purple-400'
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStock,
      icon: PackageX,
      gradient: 'from-rose-500 to-pink-500',
      bgGradient: 'from-rose-50 to-pink-50',
      iconBg: 'from-rose-400 to-pink-400'
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Grid - Professional gradient cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.title}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 p-4 sm:p-5 md:p-6 hover:shadow-2xl hover:shadow-purple-200/50 hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              {/* Animated gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />

              {/* Icon with gradient */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${card.iconBg} flex items-center justify-center shadow-lg shadow-purple-200/50 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-md" />
                </div>
              </div>

              {/* Title with gradient on hover */}
              <p className={`text-xs sm:text-sm font-semibold mb-2 leading-tight break-words bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                {card.title}
              </p>

              {/* Value - Large and bold */}
              <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 group-hover:scale-105 transition-transform duration-300">
                {loading ? (
                  <span className="inline-block animate-pulse bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">...</span>
                ) : (
                  card.value
                )}
              </p>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </div>
          )
        })}
      </div>

      {/* Stock Alerts Section - Modern glassmorphic design */}
      {!loading && (lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="space-y-5">
          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/50 rounded-2xl p-5 overflow-hidden shadow-xl shadow-amber-100/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full blur-3xl" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-500/30">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent mb-3">
                    Low Stock Alert ({lowStockProducts.length} {lowStockProducts.length === 1 ? 'Product' : 'Products'})
                  </h3>
                  <div className="space-y-2.5">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                        <span className="text-sm font-semibold text-slate-700">{product.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">Qty: {product.quantity}</span>
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-100 hover:bg-amber-200 px-4 py-1.5 rounded-full transition-colors"
                          >
                            Update
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Out of Stock Alert */}
          {outOfStockProducts.length > 0 && (
            <div className="relative bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200/50 rounded-2xl p-5 overflow-hidden shadow-xl shadow-rose-100/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-3xl" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg shadow-rose-500/30">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold bg-gradient-to-r from-rose-700 to-pink-700 bg-clip-text text-transparent mb-3">
                    Out of Stock Alert ({outOfStockProducts.length} {outOfStockProducts.length === 1 ? 'Product' : 'Products'})
                  </h3>
                  <div className="space-y-2.5">
                    {outOfStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                        <span className="text-sm font-semibold text-slate-700">{product.name}</span>
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-100 hover:bg-rose-200 px-4 py-1.5 rounded-full transition-colors"
                        >
                          Restock
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
