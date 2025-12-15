'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Package, CheckCircle, Tag, Percent } from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  liveProducts: number
  outOfStock: number
  newArrivals: number
  offersActive: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    liveProducts: 0,
    outOfStock: 0,
    newArrivals: 0,
    offersActive: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch all products
      const { data: products, error } = await supabase
        .from('products')
        .select('*')

      if (error) {
        console.error('Error fetching stats:', error)
        return
      }

      if (products) {
        const totalProducts = products.length
        const liveProducts = products.filter(p => p.is_active && p.stock_quantity > 0).length
        const outOfStock = products.filter(p => p.stock_quantity === 0).length
        const newArrivals = products.filter(p => p.is_new_arrival).length
        const offersActive = products.filter(p => p.offer_type && p.offer_value > 0).length

        setStats({
          totalProducts,
          liveProducts,
          outOfStock,
          newArrivals,
          offersActive,
        })
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
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Active Products',
      value: stats.liveProducts,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Products with Offers',
      value: stats.offersActive,
      icon: Percent,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      iconBg: 'bg-orange-100'
    },
    {
      title: 'New Arrivals',
      value: stats.newArrivals,
      icon: Tag,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-100'
    },
  ]

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="bg-white rounded-xl border border-[#E2E8F0] border-t-4 border-t-[#2563EB] p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#2563EB]" />
                </div>
              </div>
              <p className="text-sm text-[#64748B] mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-[#0F172A]">
                {loading ? '...' : card.value}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
