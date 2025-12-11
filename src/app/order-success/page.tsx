'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function OrderSuccessPage() {
  const orderNumber = `RA${Date.now().toString().slice(-8)}`;

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto px-4 text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-slate-800 mb-3 font-display"
        >
          Order Placed Successfully!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-600 mb-6"
        >
          Thank you for your order. We've received it and will process it shortly.
        </motion.p>

        {/* Order Number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-50 rounded-2xl p-6 mb-8"
        >
          <p className="text-sm text-slate-500 mb-1">Order Number</p>
          <p className="text-2xl font-bold text-primary-600">{orderNumber}</p>
        </motion.div>

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-card mb-8"
        >
          <h3 className="font-semibold text-slate-800 mb-4">What happens next?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Order Confirmation</p>
                <p className="text-sm text-slate-500">You'll receive an email with order details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Shipping Update</p>
                <p className="text-sm text-slate-500">We'll notify you when your order ships</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </motion.div>

        {/* Contact */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-slate-500 mt-8"
        >
          Questions? Contact us on{' '}
          <a 
            href="https://wa.me/919876543210" 
            className="text-green-600 font-medium hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}

