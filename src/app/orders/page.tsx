'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Package, FileText, Download, Eye, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  products: any[];
  subtotal: number;
  shipping_charge: number;
  total_amount: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
}

interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  total_amount: number;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Record<string, Invoice>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    fetchInvoices();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch orders:', errorData);

        if (response.status === 401) {
          // User not authenticated - redirect to login
          window.location.href = '/';
          return;
        }
        throw new Error(errorData.error || 'Failed to fetch orders');
      }

      const data = await response.json();


      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();
      if (data.invoices) {
        const invoiceMap: Record<string, Invoice> = {};
        data.invoices.forEach((invoice: Invoice) => {
          invoiceMap[invoice.order_id] = invoice;
        });
        setInvoices(invoiceMap);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      placed: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      packed: 'bg-yellow-100 text-yellow-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-8">My Orders</h1>
          <div className="bg-white rounded-2xl shadow-card p-12 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No orders yet</h2>
            <p className="text-slate-600 mb-6">Start shopping to see your orders here!</p>
            <Link href="/">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800">My Orders</span>
        </nav>

        <h1 className="text-3xl font-bold text-slate-800 mb-8">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => {
            const invoice = invoices[order.id];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-card overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Order ID</p>
                      <p className="text-lg font-bold text-slate-800">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Order Date</p>
                      <p className="font-medium text-slate-800">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Order Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.order_status)}`}>
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Payment Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.products.map((product: any, index: number) => (
                      <div key={index} className="flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800">{product.name}</h4>
                          <p className="text-sm text-slate-500">Qty: {product.quantity}</p>
                        </div>
                        <p className="font-semibold text-slate-800">
                          {formatPrice(product.price * product.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-slate-500">Total Amount</p>
                        <p className="text-2xl font-bold text-primary-600">
                          {formatPrice(order.total_amount)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Payment: {order.payment_method === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}
                        </p>
                      </div>

                      {/* Invoice Button */}
                      <div className="flex gap-3">
                        <Link href={`/order-success?orderId=${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        {invoice && (
                          <Link href={`/invoice/${invoice.id}`}>
                            <Button size="sm">
                              <FileText className="w-4 h-4 mr-2" />
                              View Invoice
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
