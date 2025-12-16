'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Package, 
  Calendar,
  DollarSign,
  Truck,
  Check,
  Clock,
  RefreshCw,
  ShoppingBag,
  ArrowLeft,
  X,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/navigation';

interface OrderProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  mrp?: number;
  quantity: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  products: OrderProduct[];
  subtotal: number;
  shipping_charge: number;
  total_amount: number;
  order_status: 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
}

const statusColors = {
  placed: 'bg-blue-100 text-blue-700',
  packed: 'bg-purple-100 text-purple-700',
  shipped: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusIcons = {
  placed: Clock,
  packed: Package,
  shipped: Truck,
  delivered: Check,
  cancelled: X,
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export default function MyOrdersPage() {
  const router = useRouter();
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-600 mt-1">
                Total Orders: {orders.length}
              </p>
            </div>
            <Button
              onClick={fetchOrders}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <Link href="/">
              <Button>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusIcons[order.order_status];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-primary transition-colors"
                >
                  <div className="p-4 sm:p-6">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.order_status]}`}>
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {order.order_status}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-primary">{formatPrice(order.total_amount)}</p>
                      </div>
                    </div>

                    {/* Products Preview */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        {order.products.length} item(s)
                      </h4>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {order.products.slice(0, 4).map((product, index) => (
                          <div key={index} className="flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        ))}
                        {order.products.length > 4 && (
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              +{order.products.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200">
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Subtotal: </span>
                          <span className="font-medium">{formatPrice(order.subtotal)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Shipping: </span>
                          <span className="font-medium">
                            {order.shipping_charge === 0 ? (
                              <span className="text-green-600">FREE</span>
                            ) : (
                              formatPrice(order.shipping_charge)
                            )}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-sm text-gray-600 mt-1">Order #{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Status */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Order Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedOrder.order_status]}`}>
                      {React.createElement(statusIcons[selectedOrder.order_status], { className: 'w-4 h-4 inline mr-1' })}
                      {selectedOrder.order_status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-primary" />
                    Delivery Address
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm">
                    <p className="font-medium text-gray-900">{selectedOrder.customer_name}</p>
                    <p className="text-gray-700">{selectedOrder.customer_phone}</p>
                    <p className="text-gray-700 mt-2">{selectedOrder.shipping_address}</p>
                    <p className="text-gray-700">{selectedOrder.shipping_city}, {selectedOrder.shipping_state}</p>
                    <p className="text-gray-700">PIN: {selectedOrder.shipping_pincode}</p>
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-primary" />
                    Order Items ({selectedOrder.products.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.products.map((product, index) => (
                      <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatPrice(product.price * product.quantity)}</p>
                          {product.mrp && product.mrp > product.price && (
                            <p className="text-xs text-gray-500 line-through">{formatPrice(product.mrp * product.quantity)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping Charge:</span>
                    <span className="font-medium">
                      {selectedOrder.shipping_charge === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(selectedOrder.shipping_charge)
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary">{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-primary" />
                    Payment Details
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">{selectedOrder.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[selectedOrder.payment_status]}`}>
                        {selectedOrder.payment_status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="font-medium">{formatDate(selectedOrder.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
