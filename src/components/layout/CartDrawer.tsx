'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export function CartDrawer() {
  const { 
    isCartOpen, 
    toggleCart, 
    cart, 
    cartTotal, 
    removeFromCart, 
    updateCartQuantity,
    clearCart 
  } = useStore();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm"
            onClick={toggleCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="cart-slide-in fixed top-0 right-0 bottom-0 w-full sm:w-[450px] bg-white dark:bg-slate-900 z-[95] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">Your Cart</h2>
                  <p className="text-sm text-slate-500">{cart.length} items</p>
                </div>
              </div>
              <button
                onClick={toggleCart}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">Your cart is empty</h3>
                  <p className="text-slate-500 mt-1 mb-6">Add some products to get started!</p>
                  <Button onClick={toggleCart}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 dark:text-white line-clamp-2 text-sm">
                        {item.product.name}
                      </h4>
                      <p className="text-primary-600 font-semibold mt-1">
                        {item.product.contactForPrice 
                          ? 'Contact for Price' 
                          : formatPrice(item.product.price)
                        }
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-l-lg transition-colors"
                          >
                            <Minus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                          </button>
                          <span className="px-3 text-sm font-medium text-slate-800 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-r-lg transition-colors"
                          >
                            <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-6 space-y-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="text-xl font-bold text-slate-800 dark:text-white">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Shipping calculated at checkout</p>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={clearCart}
                  >
                    Clear
                  </Button>
                  <Link href="/checkout" className="flex-[2]" onClick={toggleCart}>
                    <Button className="w-full flex items-center justify-center gap-2">
                      Checkout
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <button
                  onClick={toggleCart}
                  className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

