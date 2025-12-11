'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { generateId } from '@/lib/utils';

export function AuthModal() {
  const { isAuthModalOpen, toggleAuthModal, login, user, logout } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    login({
      id: generateId(),
      email: formData.email,
      name: formData.name || formData.email.split('@')[0],
    });
    
    setLoading(false);
    setFormData({ name: '', email: '', password: '' });
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    login({
      id: generateId(),
      email: 'user@gmail.com',
      name: 'Google User',
    });
    setLoading(false);
  };

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
                {user ? `Welcome, ${user.name}!` : (isLogin ? 'Welcome Back' : 'Create Account')}
              </h2>
              <p className="text-white/80 mt-1">
                {user 
                  ? 'Manage your account' 
                  : (isLogin ? 'Sign in to continue shopping' : 'Join Rainbow Aqua family')
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
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      logout();
                      toggleAuthModal();
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  {/* Google Login */}
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-colors bg-white text-slate-700 font-medium disabled:opacity-50"
                  >
                    <Chrome className="w-5 h-5 text-[#4285F4]" />
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-sm text-slate-400">or</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="pl-12"
                          required={!isLogin}
                        />
                      </div>
                    )}
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-12"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-12 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {isLogin && (
                      <div className="text-right">
                        <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
                          Forgot password?
                        </a>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </Button>
                  </form>

                  {/* Toggle */}
                  <p className="text-center mt-6 text-slate-600">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-primary-600 font-semibold hover:text-primary-700"
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

