'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
  const [paymentMethod] = useState<'razorpay'>('razorpay');
  const [shippingData, setShippingData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    district: '',
    pincode: '',
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isNewAddress, setIsNewAddress] = useState(false);

  // Load user's saved addresses from users.addresses column
  useEffect(() => {
    const loadUserAddresses = async () => {
      if (!user) return;

      try {
        // Fetch all addresses from users.addresses (JSONB array)
        const response = await fetch('/api/user-addresses');
        if (response.ok) {
          const { addresses } = await response.json();

          if (addresses && addresses.length > 0) {
            setSavedAddresses(addresses);

            // Find default address or use first one
            const defaultAddress = addresses.find((addr: any) => addr.is_default) || addresses[0];

            setShippingData({
              name: defaultAddress.full_name || user.name || '',
              email: defaultAddress.email || user.email || '',
              phone: defaultAddress.phone || '',
              address: defaultAddress.address || '',
              city: defaultAddress.city || '',
              district: defaultAddress.district || '',
              pincode: defaultAddress.pin_code || '',
            });
            setSelectedAddressId(defaultAddress.id);
            setIsNewAddress(false);
            console.log('User addresses loaded from users.addresses column:', addresses.length);
          } else {
            // No saved addresses, mark as new
            setIsNewAddress(true);
          }
        }
      } catch (error) {
        console.error('Error loading user addresses:', error);
      }
    };

    loadUserAddresses();
  }, [user]);

  // Handle address selection from dropdown
  const handleAddressSelect = (addressId: string) => {
    if (addressId === 'new') {
      // User wants to add a new address
      setSelectedAddressId(null);
      setIsNewAddress(true);
      setShippingData({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        district: '',
        pincode: '',
      });
    } else {
      // User selected an existing address
      const selectedAddr = savedAddresses.find(addr => addr.id === addressId);
      if (selectedAddr) {
        setSelectedAddressId(addressId);
        setIsNewAddress(false);
        setShippingData({
          name: selectedAddr.full_name || '',
          email: selectedAddr.email || '',
          phone: selectedAddr.phone || '',
          address: selectedAddr.address || '',
          city: selectedAddr.city || '',
          district: selectedAddr.district || '',
          pincode: selectedAddr.pin_code || '',
        });
      }
    }
  };

  // Calculate shipping based on order value
  const shippingCost = calculateShipping(cartTotal);
  const total = cartTotal + shippingCost;

  const handleRazorpayPayment = async (dbOrderId: string) => {
    try {
      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        alert('Payment gateway is loading. Please try again in a moment.');
        setLoading(false);
        return;
      }

      // Create Razorpay order
      const razorpayOrderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `ord_${Date.now()}`, // Keep it short (max 40 chars)
          notes: {
            orderId: dbOrderId,
          },
        }),
      });

      if (!razorpayOrderResponse.ok) {
        const errorData = await razorpayOrderResponse.json();
        console.error('Razorpay order creation failed:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to create Razorpay order');
      }

      const { order: razorpayOrder } = await razorpayOrderResponse.json();
      console.log('Razorpay order created:', razorpayOrder);

      // Initialize Razorpay checkout
      const options = {
        key: 'rzp_test_RrVPw4temWVxGs', // Use the actual key directly
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Rainbow Aqua',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        // Remove image to avoid CORS issues in localhost
        // image: '/logo.png',
        handler: async function (response: any) {
          try {
            // Verify payment
            console.log('Verifying payment for order:', dbOrderId);
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: dbOrderId,
              }),
            });

            const verifyData = await verifyResponse.json();
            console.log('Verify response:', verifyData);

            if (!verifyResponse.ok) {
              console.error('❌ Payment verification failed:', verifyData);
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            console.log('✅ Payment verified successfully');

            // Generate invoice after successful payment (non-blocking)
            try {
              const invoiceResponse = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: dbOrderId }),
              });

              if (invoiceResponse.ok) {
                const { invoice } = await invoiceResponse.json();
                console.log('Invoice generated:', invoice.invoice_number);
              } else {
                const errorData = await invoiceResponse.json();
                console.error('Invoice generation failed:', errorData);
                // Don't block payment success - invoice can be generated later
              }
            } catch (invoiceError) {
              console.error('Error generating invoice:', invoiceError);
              // Don't block payment success - invoice can be generated later
            }

            clearCart();
            router.push(`/order-success?orderId=${dbOrderId}`);
          } catch (error) {
            console.error('Error verifying payment:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: shippingData.name,
          email: shippingData.email,
          contact: shippingData.phone,
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            alert('Payment cancelled. Your order is saved and you can complete payment later.');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Error initiating Razorpay payment:', error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      // Check Supabase authentication
      const supabase = createClient();
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !supabaseUser) {
        alert('Please login to place an order');
        setLoading(false);
        return;
      }

      // Save address to users.addresses array if this is a new address
      let addressId = selectedAddressId;

      if (isNewAddress || !addressId) {
        try {
          const addressResponse = await fetch('/api/user-addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: shippingData.name,
              phone: shippingData.phone,
              email: shippingData.email,
              address: shippingData.address,
              city: shippingData.city,
              district: shippingData.district,
              pin_code: shippingData.pincode,
              is_default: savedAddresses.length === 0 // Set as default if it's the first address
            }),
          });

          if (addressResponse.ok) {
            const { address } = await addressResponse.json();
            addressId = address.id;
            console.log('New address saved to users.addresses array:', addressId);
          }
        } catch (addressError) {
          console.error('Error saving address:', addressError);
          // Don't block order placement if address save fails
        }
      } else {
        console.log('Using existing address:', addressId);
      }

      // Prepare order data
      const orderData = {
        address_id: addressId,
        customer_name: shippingData.name,
        customer_email: shippingData.email,
        customer_phone: shippingData.phone,
        shipping_address: shippingData.address,
        shipping_city: shippingData.city,
        shipping_state: shippingData.district,
        shipping_pincode: shippingData.pincode,
        products: cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          mrp: item.product.mrp,
          quantity: item.quantity,
        })),
        subtotal: cartTotal,
        shipping_charge: shippingCost,
        total_amount: total,
        payment_method: paymentMethod === 'razorpay' ? 'razorpay' : 'cod',
        razorpay_order_id: null,
      };

      // Debug: Log what we're sending
      console.log('Cart items:', cart.length);
      console.log('Order data products:', orderData.products.length);
      console.log('Products being sent:', JSON.stringify(orderData.products, null, 2));

      // Create order in database first
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create order');
      }

      const { order } = await response.json();

      if (paymentMethod === 'razorpay') {
        // Initiate Razorpay payment
        await handleRazorpayPayment(order.id);
      } else {
        // COD - Generate invoice and redirect
        try {
          const invoiceResponse = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id }),
          });

          if (invoiceResponse.ok) {
            const { invoice } = await invoiceResponse.json();
            console.log('Invoice generated:', invoice.invoice_number);
          }
        } catch (invoiceError) {
          console.error('Error generating invoice:', invoiceError);
        }

        clearCart();
        router.push(`/order-success?orderId=${order.id}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
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

                  {/* Address Selection Dropdown */}
                  {savedAddresses.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Select Delivery Address <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedAddressId || 'new'}
                        onChange={(e) => handleAddressSelect(e.target.value)}
                        className="input-field w-full px-4 py-3 rounded-xl bg-white text-slate-800"
                      >
                        {savedAddresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.full_name} - {addr.address}, {addr.city}, {addr.district} - {addr.pin_code}
                            {addr.is_default ? ' (Default)' : ''}
                          </option>
                        ))}
                        <option value="new">+ Add New Address</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      value={shippingData.name}
                      onChange={(e) => setShippingData({...shippingData, name: e.target.value})}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="john@example.com"
                      value={shippingData.email}
                      onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
                      required
                    />
                  </div>

                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={shippingData.phone}
                    onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Street address, house number, landmark"
                      value={shippingData.address}
                      onChange={(e) => setShippingData({...shippingData, address: e.target.value})}
                      className="input-field w-full px-4 py-3 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 min-h-[100px] resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      placeholder="City / Town"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                      required
                    />
                    <Input
                      label="PIN Code"
                      placeholder="6-digit PIN"
                      value={shippingData.pincode}
                      onChange={(e) => setShippingData({...shippingData, pincode: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      District <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={shippingData.district}
                      onChange={(e) => setShippingData({...shippingData, district: e.target.value})}
                      className="input-field w-full px-4 py-3 rounded-xl bg-white text-slate-800"
                      required
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

                  <Button size="lg" className="w-full" onClick={() => {
                    // Validate all fields
                    if (!shippingData.name.trim()) {
                      alert('Please enter your full name');
                      return;
                    }
                    if (!shippingData.email.trim()) {
                      alert('Please enter your email address');
                      return;
                    }
                    if (!shippingData.phone.trim()) {
                      alert('Please enter your phone number');
                      return;
                    }
                    if (shippingData.phone.trim().length !== 10) {
                      alert('Please enter a valid 10-digit phone number');
                      return;
                    }
                    if (!shippingData.address.trim()) {
                      alert('Please enter your address');
                      return;
                    }
                    if (!shippingData.city.trim()) {
                      alert('Please enter your city');
                      return;
                    }
                    if (!shippingData.pincode.trim()) {
                      alert('Please enter your PIN code');
                      return;
                    }
                    if (shippingData.pincode.trim().length !== 6) {
                      alert('Please enter a valid 6-digit PIN code');
                      return;
                    }
                    if (!shippingData.district) {
                      alert('Please select your district');
                      return;
                    }
                    setStep('payment');
                  }}>
                    Continue to Payment
                  </Button>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">Payment Method</h2>

                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 border-2 rounded-xl border-primary-500 bg-primary-50">
                      <CreditCard className="w-6 h-6 text-slate-600" />
                      <div className="flex-1">
                        <span className="font-medium text-slate-800 block">Pay with Razorpay</span>
                        <span className="text-xs text-slate-500">UPI, Cards, NetBanking & More</span>
                      </div>
                    </div>
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

