'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  CreditCard, 
  Truck, 
  Check,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatPrice } from '@/lib/utils';
import { calculateShipping } from '@/lib/shipping';
import { tamilNaduDistricts, borderingStates } from '@/data/tamilnadu-districts';

// Declare Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, user } = useStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirm'>('shipping');
  const [shippingData, setShippingData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    district: '',
    pincode: '',
  });

  // Calculate shipping based on order value
  const shippingCost = calculateShipping(cartTotal);
  const total = cartTotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please login to place an order');
      return;
    }

    try {
      setLoading(true);

      // Prepare order data
      const orderData = {
        customer_name: shippingData.name,
        customer_email: shippingData.email,
        customer_phone: shippingData.phone,
        shipping_address: shippingData.address,
        shipping_city: shippingData.city,
        shipping_state: shippingData.district,
        shipping_pincode: shippingData.pincode,
        products: cart.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          mrp: item.mrp,
          quantity: item.quantity,
        })),
        subtotal: cartTotal,
        shipping_charge: shippingCost,
        total_amount: total,
        payment_method: 'razorpay_upi',
      };

      // Create order in database first
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          razorpay_order_id: `order_${Date.now()}`, // Temporary ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { order } = await response.json();

      // Initialize Razorpay (you need to add Razorpay script in your layout)
      // For now, we'll simulate success and redirect
      // In production, integrate actual Razorpay payment flow here

      clearCart();
      router.push(`/order-success?orderId=${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Your cart is empty</h1>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
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
          <span className="text-slate-800">Checkout</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card p-6 md:p-8"
            >
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {['Shipping', 'Payment', 'Confirm'].map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      i === 0 ? 'bg-primary-500 text-white' :
                      i === 1 && step !== 'shipping' ? 'bg-primary-500 text-white' :
                      i === 2 && step === 'confirm' ? 'bg-primary-500 text-white' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {i < ['shipping', 'payment', 'confirm'].indexOf(step) ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`ml-2 hidden sm:inline ${
                      i <= ['shipping', 'payment', 'confirm'].indexOf(step) 
                        ? 'text-slate-800 font-medium' 
                        : 'text-slate-400'
                    }`}>
                      {s}
                    </span>
                    {i < 2 && (
                      <div className={`w-12 sm:w-24 h-0.5 mx-3 ${
                        i < ['shipping', 'payment', 'confirm'].indexOf(step) 
                          ? 'bg-primary-500' 
                          : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {step === 'shipping' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Shipping Details</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      value={shippingData.name}
                      onChange={(e) => setShippingData({...shippingData, name: e.target.value})}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="john@example.com"
                      value={shippingData.email}
                      onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
                    />
                  </div>

                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={shippingData.phone}
                    onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Address
                    </label>
                    <textarea
                      placeholder="Street address, house number, landmark"
                      value={shippingData.address}
                      onChange={(e) => setShippingData({...shippingData, address: e.target.value})}
                      className="input-field w-full px-4 py-3 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      placeholder="City / Town"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                    />
                    <Input
                      label="PIN Code"
                      placeholder="6-digit PIN"
                      value={shippingData.pincode}
                      onChange={(e) => setShippingData({...shippingData, pincode: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      District
                    </label>
                    <select
                      value={shippingData.district}
                      onChange={(e) => setShippingData({...shippingData, district: e.target.value})}
                      className="input-field w-full px-4 py-3 rounded-xl bg-white text-slate-800"
                    >
                      <option value="">Select District</option>
                      <optgroup label="Tamil Nadu Districts">
                        {tamilNaduDistricts.map((district) => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Bordering States/UTs">
                        {borderingStates.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <Button size="lg" className="w-full" onClick={() => setStep('payment')}>
                    Continue to Payment
                  </Button>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Payment Method</h2>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'cod', label: 'Cash on Delivery', icon: Truck },
                      { id: 'upi', label: 'UPI Payment', icon: CreditCard },
                      { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-primary-400 transition-colors"
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          defaultChecked={method.id === 'cod'}
                          className="w-5 h-5 text-primary-600"
                        />
                        <method.icon className="w-6 h-6 text-slate-600" />
                        <span className="font-medium text-slate-800">{method.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1" onClick={() => setStep('shipping')}>
                      Back
                    </Button>
                    <Button size="lg" className="flex-[2]" onClick={() => setStep('confirm')}>
                      Review Order
                    </Button>
                  </div>
                </div>
              )}

              {step === 'confirm' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Order Review</h2>
                  
                  {/* Shipping Address */}
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="font-medium text-slate-800 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Shipping To
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {shippingData.name}<br />
                      {shippingData.address}<br />
                      {shippingData.city}, {shippingData.district} - {shippingData.pincode}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" /> {shippingData.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" /> {shippingData.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1" onClick={() => setStep('payment')}>
                      Back
                    </Button>
                    <Button 
                      size="lg" 
                      className="flex-[2]" 
                      onClick={handlePlaceOrder}
                      disabled={loading}
                    >
                      {loading ? 'Placing Order...' : `Place Order • ${formatPrice(total)}`}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-card p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-800 line-clamp-2">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-slate-800">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
                </div>
                {shippingCost === 0 && (
                  <p className="text-xs text-green-600">🎉 Free shipping on orders above ₹2,000!</p>
                )}
                <div className="flex justify-between text-lg font-bold text-slate-800 pt-3 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

