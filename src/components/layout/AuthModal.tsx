'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import LoginForm from '@/components/auth/LoginForm';

export function AuthModal() {
  const { isAuthModalOpen, toggleAuthModal } = useStore();
  const { user, signOut } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleAuthModal}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-strong rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary-500 to-accent-500 px-6 py-8 text-center">
              <button
                onClick={toggleAuthModal}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white">
                {user ? `Welcome, ${user.email}!` : 'Welcome Back'}
              </h2>
              <p className="text-white/80 mt-1">
                {user 
                  ? 'Manage your account' 
                  : 'Sign in to continue shopping'
                }
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {user ? (
                // Logged in state
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{user.email}</p>
                      <p className="text-sm text-slate-500">User Account</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={async () => {
                      await signOut();
                      toggleAuthModal();
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <LoginForm onClose={toggleAuthModal} />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

