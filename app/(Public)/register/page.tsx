// app/auth/signup/page.tsx - COMPLETE SIGNUP FORM
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Stethoscope,
  Users
} from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && userProfile) {
      const dashboardPath = userProfile.role === 'clinician' 
        ? '/dashboard/clinician' 
        : '/dashboard/guardian';
      router.push(dashboardPath);
    }
  }, [user, userProfile, loading, router]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'guardian' as 'guardian' | 'clinician',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (formError) setFormError('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setFormError('');
    
    try {
      // Import Firebase auth functions
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { auth, db } = await import('@/app/lib/firebase/firebase');
      
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const firebaseUser = userCredential.user;
      
      // 2. Create user profile in Firestore
      const userProfile = {
        uid: firebaseUser.uid,
        email: formData.email,
        name: formData.name.trim(),
        role: formData.role,
        patients: [],
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      
      console.log('User created successfully:', firebaseUser.uid);
      
      // 3. Redirect to dashboard
      const dashboardPath = formData.role === 'clinician' 
        ? '/dashboard/clinician' 
        : '/dashboard/guardian';
      
      router.push(dashboardPath);
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle Firebase auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setFormError('This email is already registered. Please use a different email or login.');
          break;
        case 'auth/weak-password':
          setFormError('Password is too weak. Please choose a stronger password (min 6 characters).');
          break;
        case 'auth/invalid-email':
          setFormError('Please enter a valid email address.');
          break;
        case 'auth/operation-not-allowed':
          setFormError('Email/password sign up is not enabled. Please contact support.');
          break;
        case 'auth/too-many-requests':
          setFormError('Too many attempts. Please try again later.');
          break;
        case 'permission-denied':
          setFormError('Database permission denied. Please contact support.');
          break;
        default:
          setFormError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!formData.password) return { score: 0, text: '', color: '' };
    
    let score = 0;
    const requirements = [
      formData.password.length >= 6,
      formData.password.length >= 8,
      /[A-Z]/.test(formData.password),
      /[0-9]/.test(formData.password),
      /[^A-Za-z0-9]/.test(formData.password),
    ];
    
    score = requirements.filter(Boolean).length;
    
    const strength = {
      0: { text: 'Very weak', color: 'bg-red-500' },
      1: { text: 'Weak', color: 'bg-red-400' },
      2: { text: 'Fair', color: 'bg-yellow-500' },
      3: { text: 'Good', color: 'bg-green-400' },
      4: { text: 'Strong', color: 'bg-green-500' },
      5: { text: 'Very strong', color: 'bg-green-600' },
    };
    
    return { score, ...strength[score as keyof typeof strength] };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join WellChild to manage pediatric health records securely
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="px-8 pt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Sign Up</h3>
              <Link 
                href="/login" 
                className="text-sm font-medium text-teal-600 hover:text-teal-500 transition-colors"
              >
                Already have an account?
              </Link>
            </div>
            
            {/* Form Error */}
            {formError && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 border border-red-100">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{formError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-colors`}
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-colors`}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Guardian Option */}
                <div 
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    formData.role === 'guardian'
                      ? 'border-teal-500 bg-teal-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => !isLoading && setFormData(prev => ({ ...prev, role: 'guardian' }))}
                >
                  <input
                    type="radio"
                    name="role"
                    value="guardian"
                    checked={formData.role === 'guardian'}
                    onChange={handleChange}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      formData.role === 'guardian' ? 'bg-teal-100' : 'bg-gray-100'
                    }`}>
                      <Users className={`h-5 w-5 ${
                        formData.role === 'guardian' ? 'text-teal-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-semibold ${
                        formData.role === 'guardian' ? 'text-teal-900' : 'text-gray-900'
                      }`}>
                        Parent/Guardian
                      </h4>
                      <p className={`text-xs mt-1 ${
                        formData.role === 'guardian' ? 'text-teal-700' : 'text-gray-500'
                      }`}>
                        Monitor child health and growth
                      </p>
                    </div>
                    {formData.role === 'guardian' && (
                      <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Clinician Option */}
                <div 
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    formData.role === 'clinician'
                      ? 'border-teal-500 bg-teal-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => !isLoading && setFormData(prev => ({ ...prev, role: 'clinician' }))}
                >
                  <input
                    type="radio"
                    name="role"
                    value="clinician"
                    checked={formData.role === 'clinician'}
                    onChange={handleChange}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      formData.role === 'clinician' ? 'bg-teal-100' : 'bg-gray-100'
                    }`}>
                      <Stethoscope className={`h-5 w-5 ${
                        formData.role === 'clinician' ? 'text-teal-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-semibold ${
                        formData.role === 'clinician' ? 'text-teal-900' : 'text-gray-900'
                      }`}>
                        Healthcare Provider
                      </h4>
                      <p className={`text-xs mt-1 ${
                        formData.role === 'clinician' ? 'text-teal-700' : 'text-gray-500'
                      }`}>
                        Manage patient care and records
                      </p>
                    </div>
                    {formData.role === 'clinician' && (
                      <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
              {errors.role && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.role}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-10 py-3 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-colors`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password Strength */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Password strength</span>
                    <span className="text-xs font-medium text-gray-700">{strength.text}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className={`flex items-center text-xs ${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className={`h-3 w-3 mr-1 ${formData.password.length >= 6 ? '' : 'invisible'}`} />
                      6+ characters
                    </div>
                    <div className={`flex items-center text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className={`h-3 w-3 mr-1 ${/[A-Z]/.test(formData.password) ? '' : 'invisible'}`} />
                      Uppercase
                    </div>
                    <div className={`flex items-center text-xs ${/[\d]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className={`h-3 w-3 mr-1 ${/[\d]/.test(formData.password) ? '' : 'invisible'}`} />
                      Number
                    </div>
                    <div className={`flex items-center text-xs ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className={`h-3 w-3 mr-1 ${/[^A-Za-z0-9]/.test(formData.password) ? '' : 'invisible'}`} />
                      Special
                    </div>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-10 py-3 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-colors`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded transition-colors"
                  disabled={isLoading}
                />
              </div>
              <div className="ml-3">
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
                    Privacy Policy
                  </Link>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  By creating an account, you agree to our terms and acknowledge our privacy practices.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <p className="text-center text-sm text-gray-600">
              By signing up, you confirm that you've read and accepted our{' '}
              <Link href="/terms" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
                Privacy Policy
              </Link>
            </p>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="font-medium text-teal-600 hover:text-teal-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}