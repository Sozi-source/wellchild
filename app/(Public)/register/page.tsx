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
  Users,
  ChevronRight,
  ChevronLeft,
  Key,
  Briefcase,
  Heart
} from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'guardian' | 'clinician';
};

type Step = 1 | 2 | 3;

export default function SignUpPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && user && userProfile) {
      router.push('/dashboard');
    }
  }, [user, userProfile, loading, router]);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'guardian',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = (): boolean => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

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

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => (prev - 1) as Step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { auth, db } = await import('@/app/lib/firebase/firebase');
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const userProfile = {
        uid: userCredential.user.uid,
        email: formData.email,
        name: formData.name.trim(),
        role: formData.role,
        patients: [],
        isActive: true,
        isVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
      
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      setErrors({ submit: error.message || 'Failed to create account' });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!formData.password) return { score: 0, text: '', color: '', width: '0%' };
    
    let score = 0;
    const requirements = [
      formData.password.length >= 6,
      formData.password.length >= 8,
      /[A-Z]/.test(formData.password),
      /[0-9]/.test(formData.password),
      /[^A-Za-z0-9]/.test(formData.password),
    ];
    
    score = requirements.filter(Boolean).length;
    const width = `${(score / 5) * 100}%`;
    
    const strength = {
      0: { text: 'Very weak', color: 'bg-red-500' },
      1: { text: 'Weak', color: 'bg-red-400' },
      2: { text: 'Fair', color: 'bg-yellow-500' },
      3: { text: 'Good', color: 'bg-green-400' },
      4: { text: 'Strong', color: 'bg-green-500' },
      5: { text: 'Very strong', color: 'bg-green-600' },
    };
    
    return { score, width, ...strength[score as keyof typeof strength] };
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Security', icon: Key },
    { number: 3, title: 'Role', icon: Briefcase },
  ];

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-sm text-gray-600">
            Join GrowthWatch in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
            </div>
            
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex flex-col items-center">
                  <div className={`
                    h-8 w-8 rounded-full flex items-center justify-center mb-2
                    ${isActive ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white' : ''}
                    ${isCompleted ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-400' : ''}
                    transition-all duration-300
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`
                    text-xs font-medium hidden sm:block
                    ${isActive ? 'text-gray-900' : ''}
                    ${isCompleted ? 'text-teal-600' : ''}
                    ${!isActive && !isCompleted ? 'text-gray-400' : ''}
                  `}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={currentStep === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
              {errors.submit && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-100">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{errors.submit}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
                    <p className="text-sm text-gray-600 mb-6">Tell us a bit about yourself</p>
                    
                    <div className="space-y-4">
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
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.name}
                          </p>
                        )}
                      </div>

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
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Security */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Security</h2>
                    <p className="text-sm text-gray-600 mb-6">Create a secure password</p>
                    
                    <div className="space-y-4">
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
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        
                        {formData.password && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">Password strength</span>
                              <span className="text-xs font-medium text-gray-700">{strength.text}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${strength.color} transition-all duration-300`}
                                style={{ width: strength.width }}
                              />
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
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Role Selection */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Your Role</h2>
                    <p className="text-sm text-gray-600 mb-6">Choose how you'll use GrowthWatch</p>
                    
                    <div className="space-y-4">
                      {/* Guardian Option */}
                      <div 
                        className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
                          formData.role === 'guardian'
                            ? 'border-teal-500 bg-teal-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, role: 'guardian' }))}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.role === 'guardian' ? 'bg-teal-100' : 'bg-gray-100'
                          }`}>
                            <Heart className={`h-6 w-6 ${
                              formData.role === 'guardian' ? 'text-teal-600' : 'text-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-lg font-semibold ${
                              formData.role === 'guardian' ? 'text-teal-900' : 'text-gray-900'
                            }`}>
                              Parent/Guardian
                            </h4>
                            <p className={`text-sm mt-2 ${
                              formData.role === 'guardian' ? 'text-teal-700' : 'text-gray-500'
                            }`}>
                              Monitor your child's growth, track milestones, and communicate with healthcare providers.
                            </p>
                            <ul className="mt-3 space-y-1">
                              <li className="flex items-center text-xs text-gray-600">
                                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                Track child growth measurements
                              </li>
                              <li className="flex items-center text-xs text-gray-600">
                                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                Receive milestone alerts
                              </li>
                              <li className="flex items-center text-xs text-gray-600">
                                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                Secure messaging with providers
                              </li>
                            </ul>
                          </div>
                          {formData.role === 'guardian' && (
                            <CheckCircle className="h-6 w-6 text-teal-600 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>

                      {/* Clinician Option */}
                      <div 
                        className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
                          formData.role === 'clinician'
                            ? 'border-teal-500 bg-teal-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, role: 'clinician' }))}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${
                            formData.role === 'clinician' ? 'bg-teal-100' : 'bg-gray-100'
                          }`}>
                            <Stethoscope className={`h-6 w-6 ${
                              formData.role === 'clinician' ? 'text-teal-600' : 'text-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-lg font-semibold ${
                              formData.role === 'clinician' ? 'text-teal-900' : 'text-gray-900'
                            }`}>
                              Healthcare Provider
                            </h4>
                            <p className={`text-sm mt-2 ${
                              formData.role === 'clinician' ? 'text-teal-700' : 'text-gray-500'
                            }`}>
                              Manage patient care, track growth patterns, and collaborate with families.
                            </p>
                            <ul className="mt-3 space-y-1">
                              <li className="flex items-center text-xs text-gray-600">
                                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                WHO-standard growth charts
                              </li>
                              <li className="flex items-center text-xs text-gray-600">
                                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                Multi-patient dashboard
                              </li>
                              <li className="flex items-center text-xs text-gray-600">
                                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                Clinical documentation
                              </li>
                            </ul>
                          </div>
                          {formData.role === 'clinician' && (
                            <CheckCircle className="h-6 w-6 text-teal-600 flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="terms"
                          name="terms"
                          type="checkbox"
                          required
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded transition-colors"
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
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </button>
                ) : (
                  <Link 
                    href="/login" 
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    ← Back to Login
                  </Link>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg hover:from-teal-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all shadow-sm hover:shadow"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg hover:from-teal-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-medium text-teal-600 hover:text-teal-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
            <div className="mt-2 flex justify-center items-center space-x-4 text-xs text-gray-400">
              <span className="flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                HIPAA Compliant
              </span>
              <span className="flex items-center">
                <Lock className="h-3 w-3 mr-1" />
                256-bit SSL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}