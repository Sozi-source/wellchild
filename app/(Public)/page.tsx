// app/(Public)/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Stethoscope, 
  Shield, 
  Users, 
  TrendingUp, 
  Calendar,
  FileText,
  Bell,
  Lock,
  CheckCircle,
  Star,
  Heart,
  Menu,
  X,
  ChevronUp,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Activity,
  Award,
  ClipboardCheck,
  BarChart3,
  ShieldCheck,
  Database,
  Eye,
  Key,
  Play,
  MessageSquare
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Feature {
  icon: any;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatarColor: string;
  icon: any;
}

interface SecurityFeature {
  icon: any;
  title: string;
  description: string;
}

interface WorkflowStep {
  step: number;
  title: string;
  description: string;
  icon: any;
  action: string;
  href: string;
}

// ============================================================================
// MAIN LANDING PAGE COMPONENT
// ============================================================================

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [activeFeature, setActiveFeature] = useState(0);
  
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  
  const isLoggedIn = !!user;
  const isAdmin = userProfile?.role === 'admin';
  const isClinician = userProfile?.role === 'clinician';
  const isGuardian = userProfile?.role === 'guardian';

  // Feature carousel auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Detect device type
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width >= 768 && width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get appropriate dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!userProfile) return '/login';
    
    if (isAdmin) return '/dashboard/admin';
    if (isClinician) return '/dashboard/clinician';
    if (isGuardian) return '/dashboard/guardian';
    
    return '/dashboard';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!userProfile) return '';
    if (userProfile.name) return userProfile.name.split(' ')[0];
    if (userProfile.email) return userProfile.email.split('@')[0];
    return 'User';
  };

  // Get user role display
  const getUserRoleDisplay = () => {
    if (!userProfile) return '';
    switch (userProfile.role) {
      case 'admin': return 'Administrator';
      case 'clinician': return 'Healthcare Clinician';
      case 'guardian': return 'Parent/Guardian';
      default: return 'User';
    }
  };

  // Features for carousel - FIXED: Use proper icon components
  const features: Feature[] = [
    {
      icon: TrendingUp,
      title: 'Growth Monitoring',
      description: 'Track height, weight, and development milestones with WHO-standard charts',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      icon: ShieldCheck,
      title: 'HIPAA Compliant',
      description: 'End-to-end encrypted data with healthcare-grade security compliance',
      color: 'from-teal-500 to-emerald-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100'
    },
    {
      icon: Users,
      title: 'Collaborative Care',
      description: 'Secure sharing between clinicians and guardians',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Automated notifications for vaccinations and follow-ups',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    }
  ];

  // Testimonials data
  const testimonials: Testimonial[] = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Pediatrician, Boston Children\'s Hospital',
      quote: 'This platform has reduced our administrative workload by 40% while improving patient outcomes.',
      avatarColor: 'bg-blue-100',
      icon: Heart
    },
    {
      name: 'Dr. Michael Rodriguez',
      role: 'Head of Pediatrics, Memorial Clinic',
      quote: 'The growth tracking and automated alerts have transformed how we monitor patient development.',
      avatarColor: 'bg-teal-100',
      icon: Star
    },
    {
      name: 'Nurse Practitioner Lisa Wang',
      role: 'Pediatric Care Specialist',
      quote: 'Guardians love being involved in their patient\'s care through the secure portal.',
      avatarColor: 'bg-purple-100',
      icon: Award
    }
  ];

  // Security features
  const securityFeatures: SecurityFeature[] = [
    { icon: Shield, title: 'HIPAA & GDPR Compliant', description: 'Healthcare data protection standards' },
    { icon: Lock, title: 'End-to-End Encryption', description: 'All data encrypted in transit and at rest' },
    { icon: FileText, title: 'Audit Trail', description: 'Complete access and modification logs' },
    { icon: Database, title: 'Secure Infrastructure', description: 'AWS HIPAA-compliant hosting' },
    { icon: Eye, title: 'Role-Based Access', description: 'Granular permission controls' },
    { icon: Key, title: 'Two-Factor Auth', description: 'Optional 2FA for all users' }
  ];

  // How it works for healthcare providers
  const providerWorkflow: WorkflowStep[] = [
    {
      step: 1,
      title: 'Request Access',
      description: 'Healthcare professionals request account access',
      icon: MessageSquare,
      action: 'Request Clinician Access',
      href: '/request-clinician-access'
    },
    {
      step: 2,
      title: 'Create Patient Profiles',
      description: 'Register patients in your care with medical history',
      icon: UserIcon,
      action: 'Learn More',
      href: '/features/patient-management'
    },
    {
      step: 3,
      title: 'Invite Guardians',
      description: 'Send secure invitations to parents/guardians',
      icon: Users,
      action: 'See Demo',
      href: '/demo/invitations'
    },
    {
      step: 4,
      title: 'Monitor & Collaborate',
      description: 'Track growth and communicate with guardians',
      icon: Activity,
      action: 'View Features',
      href: '/features/collaboration'
    }
  ];

  // ============================================================================
  // COMPONENTS
  // ============================================================================

  // Mobile Navigation Drawer
  const MobileMenuDrawer = () => {
    const menuItems = [
      { icon: TrendingUp, label: 'Features', href: '#features' },
      { icon: Shield, label: 'Security', href: '#security' },
      { icon: Users, label: 'How It Works', href: '#how-it-works' },
      { icon: Star, label: 'Testimonials', href: '#testimonials' },
    ];

    if (isLoggedIn) {
      menuItems.unshift({ 
        icon: LayoutDashboard, 
        label: 'Dashboard', 
        href: getDashboardUrl()
      });
    }

    return (
      <>
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />

        <aside 
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Mobile navigation"
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Stethoscope className="h-8 w-8 text-teal-600" />
                <span className="ml-2 text-xl font-semibold">
                  {isLoggedIn ? `Hi, ${getUserDisplayName()}` : 'Menu'}
                </span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {isLoggedIn && userProfile?.email && (
              <div className="mt-2 text-xs text-gray-600 truncate">
                {userProfile.email}
              </div>
            )}
            {isLoggedIn && userProfile?.role && (
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  userProfile.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  userProfile.role === 'clinician' ? 'bg-blue-100 text-blue-800' :
                  'bg-teal-100 text-teal-800'
                }`}>
                  {getUserRoleDisplay()}
                </span>
              </div>
            )}
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.label}>
                    <Link 
                      href={item.href}
                      className={`flex items-center p-3 rounded-lg hover:bg-teal-50 transition-all ${
                        item.label === 'Dashboard' ? 'bg-teal-50 text-teal-700 font-medium' : ''
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                      style={{ minHeight: '44px' }}
                    >
                      <IconComponent className={`h-5 w-5 mr-3 ${item.label === 'Dashboard' ? 'text-teal-600' : ''}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              
              {isLoggedIn ? (
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center p-3 rounded-lg hover:bg-red-50 w-full text-left transition-all"
                    style={{ minHeight: '44px' }}
                  >
                    <LogOut className="h-5 w-5 mr-3 text-red-600" />
                    <span className="text-red-600">Logout</span>
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                      style={{ minHeight: '44px' }}
                    >
                      <UserIcon className="h-5 w-5 mr-3 text-blue-600" />
                      <span className="text-blue-600 font-medium">Login</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="flex items-center p-3 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                      style={{ minHeight: '44px' }}
                    >
                      <span className="font-medium">Sign Up</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </aside>
      </>
    );
  };

  // Feature Carousel Component - FIXED VERSION
  const FeatureCarousel = () => {
    const currentFeature = features[activeFeature];
    const IconComponent = currentFeature.icon;
    
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8">
          <div className="lg:w-1/2">
            <div className={`h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-r ${currentFeature.color} flex items-center justify-center mb-4 md:mb-6 shadow-lg`}>
              <IconComponent className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              {currentFeature.title}
            </h3>
            <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-6">
              {currentFeature.description}
            </p>
            <div className="flex space-x-3 mb-6 md:mb-8">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeFeature 
                      ? `w-8 bg-gradient-to-r ${currentFeature.color.split(' ')[1]}` 
                      : 'w-2 bg-gray-300'
                  }`}
                  aria-label={`View feature ${index + 1}`}
                />
              ))}
            </div>
            <Link
              href="/features"
              className="inline-flex items-center text-teal-600 hover:text-teal-800 font-medium text-sm md:text-base"
            >
              Explore all features
              <ChevronUp className="h-4 w-4 ml-1 rotate-90 transform" />
            </Link>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className={`rounded-xl ${currentFeature.bgColor} ${currentFeature.borderColor} border p-4 md:p-6 shadow-lg`}>
              <div className="space-y-4">
                {activeFeature === 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Height Percentile</span>
                      <span className="text-lg font-bold text-blue-600">75th</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
                    </div>
                  </>
                )}
                {activeFeature === 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-teal-600 mr-2" />
                      <span className="font-medium text-gray-900 text-sm md:text-base">HIPAA Compliant</span>
                      <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                    </div>
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 text-teal-600 mr-2" />
                      <span className="font-medium text-gray-900 text-sm md:text-base">End-to-End Encryption</span>
                      <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                    </div>
                  </div>
                )}
                {activeFeature === 2 && (
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="flex -space-x-2">
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                        <UserIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      </div>
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center">
                        <UserIcon className="h-4 w-4 md:h-5 md:w-5 text-teal-600" />
                      </div>
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center">
                        <UserIcon className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm md:text-base">Team Collaboration</div>
                      <div className="text-xs md:text-sm text-gray-600">Secure clinician-guardian sharing</div>
                    </div>
                  </div>
                )}
                {activeFeature === 3 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center">
                        <Bell className="h-5 w-5 text-amber-600 mr-2" />
                        <span className="font-medium text-sm md:text-base">Vaccination Due</span>
                      </div>
                      <span className="text-sm font-medium text-amber-700">Tomorrow</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-sm md:text-base">Follow-up Appointment</span>
                      </div>
                      <span className="text-sm font-medium text-blue-700">Next Week</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get Started Dropdown Component
  const GetStartedDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="bg-teal-600 text-white px-4 py-2.5 rounded-md hover:bg-teal-700 font-medium transition-all flex items-center gap-2 min-h-[44px] text-sm md:text-base"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="hidden sm:inline">Get Started</span>
          <span className="sm:hidden">Start</span>
          <ChevronUp className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-slide-up">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Get Started</h3>
              
              <div className="space-y-3">
                {/* Clinician Option */}
                <Link
                  href="/request-clinician-access"
                  className="flex items-start p-3 rounded-lg hover:bg-blue-50 border border-blue-100 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="bg-blue-100 p-2 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-800 text-sm md:text-base">Healthcare Clinician</div>
                    <div className="text-xs md:text-sm text-gray-600 mt-1">
                      Request professional access
                    </div>
                  </div>
                </Link>

                {/* Guardian Option */}
                <Link
                  href="/signup"
                  className="flex items-start p-3 rounded-lg hover:bg-teal-50 border border-teal-100 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="bg-teal-100 p-2 rounded-lg mr-3 group-hover:bg-teal-200 transition-colors">
                    <Users className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-medium text-teal-800 text-sm md:text-base">Parent/Guardian</div>
                    <div className="text-xs md:text-sm text-gray-600 mt-1">
                      Create an account
                    </div>
                  </div>
                </Link>

                {/* Demo Option */}
                <Link
                  href="/request-demo"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-teal-200 hover:bg-teal-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Play className="h-5 w-5 text-teal-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 text-sm md:text-base">Schedule Demo</div>
                    <div className="text-xs md:text-sm text-gray-600">See the platform in action</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // MAIN PAGE RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-white relative">
      {/* Embedded Components */}
      <MobileMenuDrawer />

      {/* Inline CSS for animations */}
      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        
        /* Animation delays */
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        
        /* Mobile optimizations */
        @media (max-width: 767px) {
          input, select, textarea { font-size: 16px !important; }
        }
        
        * { -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1); }
        body { overscroll-behavior-y: contain; }
      `}</style>

      {/* Main Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Menu */}
            <div className="flex items-center">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100 mr-2 lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <Link 
                href="/" 
                className="flex items-center active:scale-95 transition-transform min-h-[44px]"
              >
                <Stethoscope className="h-8 w-8 text-teal-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900 hidden sm:inline">
                  Patient Health Monitor
                </span>
                <span className="ml-2 text-xl font-semibold text-gray-900 sm:hidden">
                  PHM
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link 
                href="#features"
                className="text-gray-600 hover:text-teal-600 font-medium px-3 py-2 min-h-[44px] flex items-center text-sm md:text-base"
              >
                Features
              </Link>
              <Link 
                href="#security"
                className="text-gray-600 hover:text-teal-600 font-medium px-3 py-2 min-h-[44px] flex items-center text-sm md:text-base"
              >
                Security
              </Link>
              <Link 
                href="#how-it-works"
                className="text-gray-600 hover:text-teal-600 font-medium px-3 py-2 min-h-[44px] flex items-center text-sm md:text-base"
              >
                How It Works
              </Link>
              <Link 
                href="#testimonials"
                className="text-gray-600 hover:text-teal-600 font-medium px-3 py-2 min-h-[44px] flex items-center text-sm md:text-base"
              >
                Testimonials
              </Link>
              
              {isLoggedIn && (
                <Link
                  href={getDashboardUrl()}
                  className="bg-teal-100 text-teal-700 px-4 py-2.5 rounded-md hover:bg-teal-200 font-medium flex items-center gap-2 active:scale-95 transition-transform min-h-[44px] text-sm md:text-base"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden md:flex items-center">
                    <div className="text-right mr-3">
                      <div className="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
                      <div className="text-xs text-gray-500">{getUserRoleDisplay()}</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-teal-600" />
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-md hover:bg-gray-50 font-medium active:scale-95 transition-transform min-h-[44px] flex items-center gap-2 text-sm md:text-base"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-teal-600 font-medium px-3 py-2 min-h-[44px] flex items-center text-sm md:text-base"
                  >
                    Login
                  </Link>
                  <GetStartedDropdown />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-8 pb-12 md:pt-16 md:pb-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Welcome back message for logged in users */}
            {isLoggedIn && (
              <div className="mb-6 md:mb-8 p-4 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl max-w-md mx-auto animate-fade-in shadow-sm">
                <div className="flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-teal-800 font-medium text-sm">
                      Welcome back, {getUserDisplayName()}!
                    </p>
                    <Link 
                      href={getDashboardUrl()} 
                      className="text-teal-600 hover:text-teal-800 text-xs font-medium inline-flex items-center"
                    >
                      Go to Dashboard
                      <ChevronUp className="h-3 w-3 ml-1 rotate-90 transform" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Main Heading */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 animate-fade-in">
              Professional Patient Health
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                Monitoring Platform
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-6 md:mb-8 animate-fade-in animation-delay-200 px-4">
              Secure, collaborative platform designed for healthcare clinicians to monitor 
              patient growth and development with WHO-standard tools.
            </p>

            {/* Feature Carousel */}
            <div className="mb-8 md:mb-12 animate-fade-in animation-delay-400 px-2">
              <FeatureCarousel />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in animation-delay-600 px-4">
              {[
                { value: '500+', label: 'Clinicians' },
                { value: '10K+', label: 'Patients' },
                { value: '50K+', label: 'Records' },
                { value: '99.9%', label: 'Uptime' }
              ].map((stat, index) => (
                <div key={index} className="text-center p-3 md:p-4">
                  <div className="text-xl md:text-2xl font-bold text-teal-600 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4 animate-fade-in animation-delay-800">
              {isLoggedIn ? (
                <>
                  <Link
                    href={getDashboardUrl()}
                    className="group bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg hover:from-teal-700 hover:to-teal-800 font-medium text-base md:text-lg transition-all w-full sm:w-auto text-center min-h-[52px] md:min-h-[56px] flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Link>
                  <Link
                    href={`/dashboard/${userProfile?.role}/profile`}
                    className="group border-2 border-teal-600 text-teal-600 px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-teal-50 font-medium text-base md:text-lg transition-all w-full sm:w-auto text-center min-h-[52px] md:min-h-[56px]"
                  >
                    <UserIcon className="h-5 w-5 mr-2 inline" />
                    View Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/request-clinician-access"
                    className="group bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg hover:from-teal-700 hover:to-teal-800 font-medium text-base md:text-lg transition-all w-full sm:w-auto text-center min-h-[52px] md:min-h-[56px] flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    <Stethoscope className="h-5 w-5 mr-2" />
                    Request Clinician Access
                  </Link>
                  <Link
                    href="/signup"
                    className="group border-2 border-teal-600 text-teal-600 px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-teal-50 font-medium text-base md:text-lg transition-all w-full sm:w-auto text-center min-h-[52px] md:min-h-[56px]"
                  >
                    <Users className="h-5 w-5 mr-2 inline" />
                    Sign Up as Guardian
                  </Link>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-3 md:gap-4 animate-fade-in animation-delay-1000 px-4">
              <div className="flex items-center text-xs md:text-sm text-gray-500">
                <Shield className="h-3 w-3 md:h-4 md:w-4 text-green-500 mr-1" />
                HIPAA Compliant
              </div>
              <div className="flex items-center text-xs md:text-sm text-gray-500">
                <Lock className="h-3 w-3 md:h-4 md:w-4 text-blue-500 mr-1" />
                End-to-End Encryption
              </div>
              <div className="flex items-center text-xs md:text-sm text-gray-500">
                <Users className="h-3 w-3 md:h-4 md:w-4 text-purple-500 mr-1" />
                Role-Based Access
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-10 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
              Comprehensive Healthcare Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Everything you need for professional patient health monitoring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Growth Charts',
                description: 'WHO-standard growth charts with automated percentile calculations',
                features: ['Height, weight, head circumference', 'BMI tracking', 'Growth velocity']
              },
              {
                icon: ClipboardCheck,
                title: 'Clinical Workflow',
                description: 'Streamlined patient management for healthcare clinicians',
                features: ['Patient registration', 'Appointment scheduling', 'Progress notes']
              },
              {
                icon: Bell,
                title: 'Smart Alerts',
                description: 'Automated notifications and reminders',
                features: ['Vaccination reminders', 'Growth alerts', 'Follow-up notifications']
              },
              {
                icon: Users,
                title: 'Collaboration',
                description: 'Secure sharing between clinicians and guardians',
                features: ['Guardian portals', 'Multi-clinician access', 'Secure messaging']
              },
              {
                icon: FileText,
                title: 'Reporting',
                description: 'Comprehensive health reports and analytics',
                features: ['Growth reports', 'Vaccination records', 'Health summaries']
              },
              {
                icon: BarChart3,
                title: 'Analytics',
                description: 'Data-driven insights for better care',
                features: ['Trend analysis', 'Population health', 'Outcome tracking']
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="bg-teal-100 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base mb-3 md:mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-1.5 md:space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-xs md:text-sm text-gray-500">
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-teal-500 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-10 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
              How It Works for Healthcare Clinicians
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Simple workflow designed for clinical efficiency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {providerWorkflow.map((step) => {
              const IconComponent = step.icon;
              return (
                <div key={step.step} className="relative">
                  <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 h-full">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base">
                        {step.step}
                      </div>
                      <IconComponent className="h-6 w-6 md:h-8 md:w-8 text-teal-600" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">
                      {step.description}
                    </p>
                    <Link
                      href={step.href}
                      className="inline-flex items-center text-teal-600 hover:text-teal-800 font-medium text-xs md:text-sm"
                    >
                      {step.action}
                      <ChevronUp className="h-3 w-3 ml-1 rotate-90 transform" />
                    </Link>
                  </div>
                  {step.step < 4 && (
                    <div className="hidden lg:block absolute top-8 md:top-12 -right-4 w-8 h-0.5 bg-gray-300" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Guardian Access Info */}
          <div className="mt-12 md:mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl p-6 md:p-8 border border-blue-100">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                  For Parents & Guardians
                </h3>
                <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
                  Guardians can create accounts to monitor their patient's health information 
                  and collaborate with healthcare clinicians.
                </p>
                <ul className="space-y-2 md:space-y-3">
                  <li className="flex items-center text-sm md:text-base">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2 md:mr-3" />
                    <span>View growth charts and measurements</span>
                  </li>
                  <li className="flex items-center text-sm md:text-base">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2 md:mr-3" />
                    <span>Receive vaccination reminders</span>
                  </li>
                  <li className="flex items-center text-sm md:text-base">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2 md:mr-3" />
                    <span>Communicate securely with healthcare team</span>
                  </li>
                </ul>
                <Link
                  href="/signup"
                  className="inline-flex items-center mt-4 md:mt-6 text-blue-600 hover:text-blue-800 font-medium text-sm md:text-base"
                >
                  Sign up as a guardian
                  <ChevronUp className="h-3 w-3 md:h-4 md:w-4 ml-1 rotate-90 transform" />
                </Link>
              </div>
              <div className="bg-white p-5 md:p-6 rounded-xl border border-blue-200">
                <div className="text-center">
                  <Users className="h-10 w-10 md:h-12 md:w-12 text-blue-600 mx-auto mb-3 md:mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2 text-base md:text-lg">Guardian Accounts</h4>
                  <p className="text-gray-600 text-xs md:text-sm">
                    Guardians can create accounts to access and monitor their patient's health information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-10 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
              Healthcare-Grade Security
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Built with healthcare compliance and data protection as top priorities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {securityFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center mb-3 md:mb-4">
                    <div className="bg-teal-100 p-1.5 md:p-2 rounded-lg mr-2 md:mr-3">
                      <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-teal-600" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs md:text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 md:mt-12 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl md:rounded-2xl p-6 md:p-8 border border-teal-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                  Compliance Certifications
                </h3>
                <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
                  Regularly audited and certified for healthcare data protection standards.
                </p>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <span className="px-2 md:px-3 py-1 bg-white text-teal-700 rounded-full text-xs md:text-sm font-medium border border-teal-200">
                    HIPAA Compliant
                  </span>
                  <span className="px-2 md:px-3 py-1 bg-white text-teal-700 rounded-full text-xs md:text-sm font-medium border border-teal-200">
                    GDPR Ready
                  </span>
                  <span className="px-2 md:px-3 py-1 bg-white text-teal-700 rounded-full text-xs md:text-sm font-medium border border-teal-200">
                    SOC 2 Type II
                  </span>
                </div>
              </div>
              <div className="bg-white p-5 md:p-6 rounded-xl border border-teal-200">
                <ShieldCheck className="h-10 w-10 md:h-12 md:w-12 text-teal-600 mb-3 md:mb-4" />
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-teal-600 mb-1 md:mb-2">✓</div>
                  <p className="text-gray-600 text-xs md:text-sm">Security Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-10 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
              Trusted by Healthcare Professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => {
              const IconComponent = testimonial.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 hover:border-teal-300 transition-all duration-300"
                >
                  <div className="flex items-center mb-3 md:mb-4">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mr-2 md:mr-3 ${testimonial.avatarColor}`}>
                      <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                        {testimonial.name}
                      </h4>
                      <p className="text-gray-600 text-xs md:text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-xs md:text-sm lg:text-base">
                    "{testimonial.quote}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-16 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3 md:mb-4 lg:mb-6">
            {isLoggedIn ? 
              `Welcome back to Patient Health Monitor` : 
              'Ready to Transform Pediatric Care?'
            }
          </h2>
          <p className="text-white/90 text-base md:text-lg mb-6 md:mb-8 lg:mb-10">
            {isLoggedIn ? 
              'Continue providing exceptional care with our professional tools.' : 
              'Join healthcare clinicians using our secure monitoring platform.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            {isLoggedIn ? (
              <>
                <Link
                  href={getDashboardUrl()}
                  className="bg-white text-teal-600 px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-gray-100 font-medium text-base md:text-lg transition-all w-full sm:w-auto text-center min-h-[52px] md:min-h-[56px] flex items-center justify-center shadow-lg"
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Link>
                <Link
                  href={`/dashboard/${userProfile?.role}/profile`}
                  className="bg-transparent border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-white/10 font-medium text-base md:text-lg transition-all w-full sm:w-auto text-center min-h-[52px] md:min-h-[56px]"
                >
                  <UserIcon className="h-5 w-5 mr-2 inline" />
                  My Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/request-clinician-access"
                  className="bg-white text-teal-600 px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-gray-100 font-medium text-base md:text-lg transition-all w-full sm:w-auto text-center min-h-[52px] md:min-h-[56px] flex items-center justify-center shadow-lg"
                >
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Request Clinician Access
                </Link>
                <Link
                  href="/signup"
                  className="bg-transparent border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-white/10 font-medium text-base md:text-lg transition-all w-full sm:w-auto text-center min-h-[52px] md:min-h-[56px]"
                >
                  <Users className="h-5 w-5 mr-2 inline" />
                  Sign Up as Guardian
                </Link>
              </>
            )}
          </div>
          <p className="text-white/80 mt-4 md:mt-6 lg:mt-8 text-xs md:text-sm">
            {isLoggedIn ? 
              '24/7 Support • Professional Tools • Secure Data' : 
              'HIPAA Compliant • 30-day Free Trial • Full Implementation Support'
            }
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center mb-3 md:mb-4">
                <Stethoscope className="h-5 w-5 md:h-6 md:w-6 text-teal-400" />
                <span className="ml-2 text-base md:text-lg font-semibold">Patient Health Monitor</span>
              </div>
              <p className="text-gray-400 text-xs md:text-sm">
                Secure patient growth monitoring platform for healthcare clinicians.
              </p>
            </div>

            {[
              { title: 'Platform', links: ['Features', 'Security', 'How It Works'] },
              { title: 'Access', links: ['Clinician Access', 'Guardian Signup', 'Request Demo'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms', 'HIPAA Compliance', 'GDPR'] }
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">
                  {section.title}
                </h4>
                <ul className="space-y-1 md:space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <Link 
                        href={`/${link.toLowerCase().replace(/\s+/g, '-')}`} 
                        className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors inline-block py-0.5 md:py-1"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-6 md:mt-10 pt-4 md:pt-6 text-center text-gray-400 text-xs md:text-sm">
            <p>© {new Date().getFullYear()} Patient Health Monitor. All rights reserved.</p>
            <p className="mt-1 md:mt-2">Built for healthcare professionals with Next.js 14 & Firebase</p>
          </div>
        </div>
      </footer>
    </div>
  );
}