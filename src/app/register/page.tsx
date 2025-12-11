'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Eye, 
  EyeOff, 
  Chrome,
  ChevronRight,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { tamilNaduDistricts, borderingStates } from '@/data/tamilnadu-districts';
import { useStore } from '@/context/StoreContext';
import { generateId } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid Indian phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.district) {
      newErrors.district = 'District is required';
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Invalid PIN code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    login({
      id: generateId(),
      email: formData.email,
      name: formData.name,
    });
    
    setLoading(false);
    router.push('/');
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    login({
      id: generateId(),
      email: 'user@gmail.com',
      name: 'Google User',
    });
    setLoading(false);
    router.push('/');
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800">Register</span>
        </nav>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 px-8 py-10 text-center">
            <h1 className="text-3xl font-bold text-white font-display mb-2">
              Create Your Account
            </h1>
            <p className="text-white/80">
              Join Rainbow Aqua family and start shopping
            </p>
          </div>

          {/* Progress Steps */}
          <div className="px-8 py-6 border-b border-slate-200">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-600' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= 1 ? 'bg-primary-100 text-primary-600' : 'bg-slate-100'
                  }`}>
                    {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                  </div>
                  <span className="font-medium hidden sm:inline">Account Info</span>
                </div>
                <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-primary-500' : 'bg-slate-200'}`} />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-600' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= 2 ? 'bg-primary-100 text-primary-600' : 'bg-slate-100'
                  }`}>
                    2
                  </div>
                  <span className="font-medium hidden sm:inline">Address Details</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Google Sign Up */}
                <button
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-colors bg-white text-slate-700 font-medium mb-6 disabled:opacity-50"
                >
                  <Chrome className="w-5 h-5 text-[#4285F4]" />
                  Continue with Google
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-sm text-slate-400">or register with email</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="space-y-5">
                  {/* Full Name */}
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="pl-12"
                      error={errors.name}
                    />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="pl-12"
                      error={errors.email}
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="tel"
                      placeholder="Phone Number (10 digits)"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="pl-12"
                      error={errors.phone}
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className="pl-12 pr-12"
                      error={errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      className="pl-12"
                      error={errors.confirmPassword}
                    />
                  </div>
                </div>

                <Button
                  className="w-full mt-8"
                  size="lg"
                  onClick={handleNext}
                >
                  Continue to Address
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
              >
                <div className="space-y-5">
                  {/* Address */}
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <textarea
                      placeholder="Street Address / House No. / Landmark"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      className="input-field w-full pl-12 py-3 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 min-h-[100px] resize-none"
                    />
                    {errors.address && <p className="mt-1.5 text-sm text-red-500">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* City */}
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        placeholder="City / Town"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="pl-12"
                        error={errors.city}
                      />
                    </div>

                    {/* PIN Code */}
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        placeholder="PIN Code"
                        value={formData.pincode}
                        onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="pl-12"
                        error={errors.pincode}
                      />
                    </div>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      District (Tamil Nadu & Bordering States)
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => updateField('district', e.target.value)}
                      className="input-field w-full px-4 py-3 rounded-xl bg-white text-slate-800"
                    >
                      <option value="">Select District</option>
                      <optgroup label="Tamil Nadu Districts">
                        {tamilNaduDistricts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Bordering States/UTs">
                        {borderingStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    {errors.district && <p className="mt-1.5 text-sm text-red-500">{errors.district}</p>}
                  </div>

                  {/* State (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      State
                    </label>
                    <Input
                      value={formData.district && borderingStates.includes(formData.district) 
                        ? formData.district 
                        : 'Tamil Nadu'
                      }
                      readOnly
                      className="bg-slate-50"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-[2]"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </motion.form>
            )}

            {/* Login Link */}
            <p className="text-center mt-6 text-slate-600">
              Already have an account?{' '}
              <Link href="/" className="text-primary-600 font-semibold hover:text-primary-700">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

