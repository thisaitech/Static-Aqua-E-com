'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  Truck,
  Check,
  Clock,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

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
  user_id: string;
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order');

      await fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
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

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-600">Orders will appear here once customers place them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.order_status];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-primary transition-colors"
              >
                {/* Order Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      Order #{order.id.slice(0, 8)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.order_status]}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {order.order_status}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(order.created_at)}
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-4 space-y-3">
                  {/* Customer Info */}
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">{order.customer_name}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Phone className="w-3 h-3 mr-2 text-gray-400" />
                      {order.customer_phone}
                    </div>
                  </div>

                  {/* Products Count */}
                  <div className="flex items-center text-sm">
                    <Package className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{order.products.length} item(s)</span>
                  </div>

                  {/* Amount */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Shipping:</span>
                      <span>{order.shipping_charge === 0 ? 'FREE' : formatPrice(order.shipping_charge)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className={`px-3 py-2 rounded-lg text-center text-xs font-medium ${paymentStatusColors[order.payment_status]}`}>
                    Payment: {order.payment_status.toUpperCase()}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <Button
                    onClick={() => setSelectedOrder(order)}
                    variant="outline"
                    className="w-full text-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
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
              {/* Order Status Update */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Order Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['placed', 'packed', 'shipped', 'delivered'] as const).map((status) => {
                    const StatusIcon = statusIcons[status];
                    return (
                      <Button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        disabled={updatingStatus === selectedOrder.id}
                        variant={selectedOrder.order_status === status ? 'primary' : 'outline'}
                        className="flex-1 min-w-[120px]"
                      >
                        {updatingStatus === selectedOrder.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{selectedOrder.customer_email}</span>
                  </div>
                  <div className="flex items-center text-sm md:col-span-2">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{selectedOrder.customer_phone}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Shipping Address
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 text-sm">
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state}</p>
                  <p>PIN: {selectedOrder.shipping_pincode}</p>
                </div>
              </div>

              {/* Products */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-primary" />
                  Products ({selectedOrder.products.length})
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
                        <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
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
                    {selectedOrder.shipping_charge === 0 ? 'FREE' : formatPrice(selectedOrder.shipping_charge)}
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
                  Payment Information
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
                  {selectedOrder.razorpay_order_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Razorpay Order ID:</span>
                      <span className="font-mono text-xs">{selectedOrder.razorpay_order_id}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
