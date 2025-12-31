'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Smartphone,
  Tablet,
  Monitor,
  Check,
  Download,
  Share2,
  Home,
  PlusCircle,
  User,
  ChevronUp,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle as CheckCircleIcon,
  Smartphone as MobileIcon,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Mail,
  MessageSquare,
  BarChart3,
  AlertCircle,
  Clock,
  Zap,
  Search,
  Filter,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  FileCheck,
  Cpu,
  Database,
  Cloud,
  Eye,
  Key,
  Users as UsersIcon,
  ClipboardCheck,
  Award,
  BadgeCheck,
  Target,
  PieChart,
  Activity
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

// ============================================================================
// MAIN LANDING PAGE COMPONENT
// ============================================================================

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInstallPromptVisible, setIsInstallPromptVisible] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isOffline, setIsOffline] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMobileNavVisible, setIsMobileNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeTouchIndex, setActiveTouchIndex] = useState(-1);
  const [activeFeature, setActiveFeature] = useState(0);
  
  // Get auth state from your context
  const { user, userProfile, signOut } = useAuth();
  const router = useRouter();
  
  // Check if user is logged in
  const isLoggedIn = !!user;

  // Helper functions to check user role
  const isAdmin = userProfile?.role === 'admin';
  const isHealthcareProvider = userProfile?.role === 'healthcare';
  const isParent = userProfile?.role === 'parent';

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

  // Check online/offline status
  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      setShowOfflineBanner(true);
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        setTimeout(() => setShowOfflineBanner(false), 3000);
      }, 1500);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle scroll for mobile nav visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 100) {
        setIsMobileNavVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsMobileNavVisible(false);
      } else {
        setIsMobileNavVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Touch feedback handler
  const handleTouchStart = (index?: number) => {
    if (index !== undefined) setActiveTouchIndex(index);
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => setActiveTouchIndex(-1), 150);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
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
    if (isHealthcareProvider) return '/dashboard/healthcare';
    if (isParent) return '/dashboard/parent';
    
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
      case 'admin': return 'Admin';
      case 'healthcare': return 'Healthcare Provider';
      case 'parent': return 'Parent';
      default: return 'User';
    }
  };

  // Features for carousel
  const features = [
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
      icon: UsersIcon,
      title: 'Collaborative Care',
      description: 'Secure sharing between healthcare providers and parents',
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
  const testimonials = [
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
      quote: 'The growth tracking and automated alerts have transformed how we monitor child development.',
      avatarColor: 'bg-teal-100',
      icon: Star
    },
    {
      name: 'Nurse Practitioner Lisa Wang',
      role: 'Pediatric Care Specialist',
      quote: 'Parents love being involved in their child\'s care through the secure portal.',
      avatarColor: 'bg-purple-100',
      icon: Award
    }
  ];

  // Security features
  const securityFeatures = [
    { icon: Shield, title: 'HIPAA & GDPR Compliant', description: 'Healthcare data protection standards' },
    { icon: Lock, title: 'End-to-End Encryption', description: 'All data encrypted in transit and at rest' },
    { icon: FileCheck, title: 'Audit Trail', description: 'Complete access and modification logs' },
    { icon: Database, title: 'Secure Infrastructure', description: 'AWS HIPAA-compliant hosting' },
    { icon: Eye, title: 'Role-Based Access', description: 'Granular permission controls' },
    { icon: Key, title: 'Two-Factor Auth', description: 'Optional 2FA for all users' }
  ];

  // How it works for healthcare providers
  const providerWorkflow = [
    {
      step: 1,
      title: 'Request Access',
      description: 'Healthcare professionals request account access',
      icon: Mail,
      action: 'Request Provider Access',
      href: '/request-provider-access'
    },
    {
      step: 2,
      title: 'Create Child Profiles',
      description: 'Register children in your care with medical history',
      icon: User,
      action: 'Learn More',
      href: '/features/child-management'
    },
    {
      step: 3,
      title: 'Invite Parents',
      description: 'Send secure invitations to parents/guardians',
      icon: Users,
      action: 'See Demo',
      href: '/demo/invitations'
    },
    {
      step: 4,
      title: 'Monitor & Collaborate',
      description: 'Track growth and communicate with parents',
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
      { icon: HelpCircle, label: 'FAQ', href: '#faq' },
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
                  userProfile.role === 'healthcare' ? 'bg-blue-100 text-blue-800' :
                  'bg-teal-100 text-teal-800'
                }`}>
                  {getUserRoleDisplay()}
                </span>
              </div>
            )}
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={item.label}>
                  <Link 
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg hover:bg-teal-50 transition-all ${
                      activeTouchIndex === index ? 'scale-95' : ''
                    } ${item.label === 'Dashboard' ? 'bg-teal-50 text-teal-700 font-medium' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                    onTouchStart={() => handleTouchStart(index)}
                    onTouchEnd={handleTouchEnd}
                    style={{ minHeight: '44px' }}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${item.label === 'Dashboard' ? 'text-teal-600' : ''}`} />
                    {item.label}
                  </Link>
                </li>
              ))}
              
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
              )}
            </ul>
          </nav>
        </aside>
      </>
    );
  };

  // Feature Carousel Component
  const FeatureCarousel = () => (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 p-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/2">
          <div className={`h-16 w-16 rounded-full bg-gradient-to-r ${features[activeFeature].color} flex items-center justify-center mb-6 shadow-lg`}>
          
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {features[activeFeature].title}
          </h3>
          <p className="text-gray-600 text-lg mb-6">
            {features[activeFeature].description}
          </p>
          <div className="flex space-x-3 mb-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveFeature(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeFeature 
                    ? `w-8 bg-gradient-to-r ${features[activeFeature].color.split(' ')[1]}` 
                    : 'w-2 bg-gray-300'
                }`}
                aria-label={`View feature ${index + 1}`}
              />
            ))}
          </div>
          <Link
            href="/features"
            className="inline-flex items-center text-teal-600 hover:text-teal-800 font-medium"
          >
            Explore all features
            <ChevronUp className="h-4 w-4 ml-1 rotate-90 transform" />
          </Link>
        </div>
        <div className="md:w-1/2">
          <div className={`rounded-xl ${features[activeFeature].bgColor} ${features[activeFeature].borderColor} border p-6 shadow-lg`}>
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
                    <span className="font-medium text-gray-900">HIPAA Compliant</span>
                    <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                  </div>
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-teal-600 mr-2" />
                    <span className="font-medium text-gray-900">End-to-End Encryption</span>
                    <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                  </div>
                </div>
              )}
              {activeFeature === 2 && (
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="h-10 w-10 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Team Collaboration</div>
                    <div className="text-sm text-gray-600">Secure provider-parent sharing</div>
                  </div>
                </div>
              )}
              {activeFeature === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 text-amber-600 mr-2" />
                      <span className="font-medium">Vaccination Due</span>
                    </div>
                    <span className="text-sm font-medium text-amber-700">Tomorrow</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium">Follow-up Appointment</span>
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

  // Get Started Dropdown Component
  const GetStartedDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 font-medium transition-all flex items-center gap-2 min-h-[44px]"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <PlusCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Get Started</span>
          <span className="sm:hidden">Start</span>
          <ChevronUp className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-slide-up">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">How would you like to get started?</h3>
              
              <div className="space-y-3">
                {/* Healthcare Provider Option */}
                <Link
                  href="/request-provider-access"
                  className="flex items-start p-3 rounded-lg hover:bg-blue-50 border border-blue-100 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="bg-blue-100 p-2 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-800">Healthcare Provider</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Request professional access for your clinic
                    </div>
                  </div>
                </Link>

                {/* Parent Option */}
                <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-start">
                    <div className="bg-teal-100 p-2 rounded-lg mr-3">
                      <Users className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Parent/Guardian</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Access by invitation only
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Your healthcare provider will send you an invitation link
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Link
                      href="/parent-info"
                      className="text-sm text-teal-600 hover:text-teal-800 font-medium inline-flex items-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Learn more about parent access
                      <ChevronUp className="h-3 w-3 ml-1 rotate-270 transform" />
                    </Link>
                  </div>
                </div>

                {/* Demo Option */}
                <Link
                  href="/request-demo"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-teal-200 hover:bg-teal-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Play className="h-5 w-5 text-teal-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Schedule a Demo</div>
                    <div className="text-sm text-gray-600">See the platform in action</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Play icon component
  const Play = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

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
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
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
        .animate-slide-down { animation: slideDown 0.3s ease-out; }
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
                  Child Health Monitor
                </span>
                <span className="ml-2 text-xl font-semibold text-gray-900 sm:hidden">
                  CHM
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link 
                href="#features"
                className="text-gray-600 hover:text-teal-600 font-medium px-3 py-2 min-h-[44px] flex items-center"
              >
                Features
              </Link>
              <Link 
                href="#security"
                className="text-gray-600 hover:text-teal-600 font-medium px-3 py-2 min-h-[44px] flex items-center"
              >
                Security
              </Link>
              <Link 
                href="#how-it-works"
                className="text-gray-600 hover:text-teal-600 font-medium px-3 py-2 min-h-[44px] flex items-center"
              >
                How It Works
              </Link>
              <Link 
                href="#testimonials"
                className="text-gray-600 hover:text-teal-600 font-medium px-3 py-2 min-h-[44px] flex items-center"
              >
                Testimonials
              </Link>
              
              {isLoggedIn && (
                <Link
                  href={getDashboardUrl()}
                  className="bg-teal-100 text-teal-700 px-4 py-2 rounded-md hover:bg-teal-200 font-medium flex items-center gap-2 active:scale-95 transition-transform min-h-[44px]"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  if ('share' in navigator) {
                    navigator.share({
                      title: 'Child Health Monitor',
                      text: 'Secure Child Health Monitoring Platform',
                      url: window.location.href,
                    });
                  }
                }}
                className="p-2 rounded-md hover:bg-gray-100 lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Share"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
              
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
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium active:scale-95 transition-transform min-h-[44px] flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-teal-600 font-medium px-3 py-2 min-h-[44px] flex items-center"
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
      <section id="hero" className="pt-8 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Welcome back message for logged in users */}
            {isLoggedIn && (
              <div className="mb-8 p-4 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl max-w-md mx-auto animate-fade-in shadow-sm">
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
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Professional Child Health
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                Monitoring Platform
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 animate-fade-in animation-delay-200">
              Secure, collaborative platform designed for healthcare providers to monitor 
              child growth and development with WHO-standard tools.
            </p>

            {/* Feature Carousel */}
            <div className="mb-12 animate-fade-in animation-delay-400">
              <FeatureCarousel />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-3xl mx-auto animate-fade-in animation-delay-600">
              {[
                { value: '500+', label: 'Healthcare Providers' },
                { value: '10,000+', label: 'Children Monitored' },
                { value: '50K+', label: 'Measurements' },
                { value: '99.9%', label: 'Uptime' }
              ].map((stat, index) => (
                <div key={index} className="text-center p-4">
                  <div className="text-2xl md:text-3xl font-bold text-teal-600 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 animate-fade-in animation-delay-800">
              {isLoggedIn ? (
                <>
                  <Link
                    href={getDashboardUrl()}
                    className="group bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-4 rounded-xl hover:from-teal-700 hover:to-teal-800 font-medium text-lg transition-all w-full sm:w-auto text-center min-h-[56px] flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Link>
                  <Link
                    href={`/dashboard/${userProfile?.role}/profile`}
                    className="group border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-xl hover:bg-teal-50 font-medium text-lg transition-all w-full sm:w-auto text-center min-h-[56px]"
                  >
                    <UserIcon className="h-5 w-5 mr-2 inline" />
                    View Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/request-provider-access"
                    className="group bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-4 rounded-xl hover:from-teal-700 hover:to-teal-800 font-medium text-lg transition-all w-full sm:w-auto text-center min-h-[56px] flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    <Stethoscope className="h-5 w-5 mr-2" />
                    Request Provider Access
                  </Link>
                  <Link
                    href="/request-demo"
                    className="group border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-xl hover:bg-teal-50 font-medium text-lg transition-all w-full sm:w-auto text-center min-h-[56px]"
                  >
                    <Play className="h-5 w-5 mr-2 inline" />
                    Schedule Demo
                  </Link>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-in animation-delay-1000">
              <div className="flex items-center text-sm text-gray-500">
                <Shield className="h-4 w-4 text-green-500 mr-1" />
                HIPAA Compliant
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Lock className="h-4 w-4 text-blue-500 mr-1" />
                End-to-End Encryption
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 text-purple-500 mr-1" />
                Role-Based Access
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need for professional child health monitoring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                description: 'Streamlined patient management for healthcare providers',
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
                description: 'Secure sharing between providers and parents',
                features: ['Parent portals', 'Multi-provider access', 'Secure messaging']
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
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="h-4 w-4 text-teal-500 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              How It Works for Healthcare Providers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple workflow designed for clinical efficiency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {providerWorkflow.map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-white rounded-xl p-6 border border-gray-200 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                    <step.icon className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {step.description}
                  </p>
                  <Link
                    href={step.href}
                    className="inline-flex items-center text-teal-600 hover:text-teal-800 font-medium text-sm"
                  >
                    {step.action}
                    <ChevronUp className="h-3 w-3 ml-1 rotate-90 transform" />
                  </Link>
                </div>
                {step.step < 4 && (
                  <div className="hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-gray-300" />
                )}
              </div>
            ))}
          </div>

          {/* Parent Access Info */}
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  For Parents & Guardians
                </h3>
                <p className="text-gray-600 mb-6">
                  Parents receive secure invitations from their healthcare provider 
                  to access their child's health information.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                    <span>View growth charts and measurements</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                    <span>Receive vaccination reminders</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                    <span>Communicate securely with healthcare team</span>
                  </li>
                </ul>
                <Link
                  href="/parent-info"
                  className="inline-flex items-center mt-6 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Learn more about parent access
                  <ChevronUp className="h-4 w-4 ml-1 rotate-90 transform" />
                </Link>
              </div>
              <div className="bg-white p-6 rounded-xl border border-blue-200">
                <div className="text-center">
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Invitation-Based Access</h4>
                  <p className="text-gray-600 text-sm">
                    Parents can only access the platform through invitations 
                    sent by verified healthcare providers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Healthcare-Grade Security
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built with healthcare compliance and data protection as top priorities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-teal-100 p-2 rounded-lg mr-3">
                    <feature.icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-8 border border-teal-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Compliance Certifications
                </h3>
                <p className="text-gray-600 mb-6">
                  Regularly audited and certified for healthcare data protection standards.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-white text-teal-700 rounded-full text-sm font-medium border border-teal-200">
                    HIPAA Compliant
                  </span>
                  <span className="px-3 py-1 bg-white text-teal-700 rounded-full text-sm font-medium border border-teal-200">
                    GDPR Ready
                  </span>
                  <span className="px-3 py-1 bg-white text-teal-700 rounded-full text-sm font-medium border border-teal-200">
                    SOC 2 Type II
                  </span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-teal-200">
                <ShieldCheck className="h-12 w-12 text-teal-600 mb-4" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600 mb-2">✓</div>
                  <p className="text-gray-600 text-sm">Security Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 hover:border-teal-300 transition-all duration-300"
              >
                <div className="flex items-center mb-4 md:mb-6">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mr-3 md:mr-4 ${testimonial.avatarColor}`}>
                    <testimonial.icon className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
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
                <p className="text-gray-700 italic text-sm md:text-base">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">
            {isLoggedIn ? 
              `Welcome back to Child Health Monitor` : 
              'Ready to Transform Pediatric Care?'
            }
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-8 md:mb-10">
            {isLoggedIn ? 
              'Continue providing exceptional care with our professional tools.' : 
              'Join healthcare providers using our secure monitoring platform.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isLoggedIn ? (
              <>
                <Link
                  href={getDashboardUrl()}
                  className="bg-white text-teal-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-medium text-lg transition-all w-full sm:w-auto text-center min-h-[56px] flex items-center justify-center shadow-lg"
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Link>
                <Link
                  href={`/dashboard/${userProfile?.role}/profile`}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 font-medium text-lg transition-all w-full sm:w-auto text-center min-h-[56px]"
                >
                  <UserIcon className="h-5 w-5 mr-2 inline" />
                  My Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/request-provider-access"
                  className="bg-white text-teal-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-medium text-lg transition-all w-full sm:w-auto text-center min-h-[56px] flex items-center justify-center shadow-lg"
                >
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Request Provider Access
                </Link>
                <Link
                  href="/request-demo"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 font-medium text-lg transition-all w-full sm:w-auto text-center min-h-[56px]"
                >
                  <Play className="h-5 w-5 mr-2 inline" />
                  Schedule Demo
                </Link>
              </>
            )}
          </div>
          <p className="text-white/80 mt-6 md:mt-8 text-sm md:text-base">
            {isLoggedIn ? 
              '24/7 Support • Professional Tools • Secure Data' : 
              'HIPAA Compliant • 30-day Free Trial • Full Implementation Support'
            }
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center mb-4 md:mb-6">
                <Stethoscope className="h-6 w-6 md:h-8 md:w-8 text-teal-400" />
                <span className="ml-2 text-lg md:text-xl font-semibold">Child Health Monitor</span>
              </div>
              <p className="text-gray-400 text-xs md:text-sm">
                Secure child growth monitoring platform for healthcare providers.
              </p>
            </div>

            {[
              { title: 'Platform', links: ['Features', 'Security', 'How It Works'] },
              { title: 'Access', links: ['Provider Access', 'Parent Access', 'Request Demo'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms', 'HIPAA Compliance', 'GDPR'] }
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <Link 
                        href={`/${link.toLowerCase().replace(/\s+/g, '-')}`} 
                        className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors inline-block py-1"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8 text-center text-gray-400 text-xs md:text-sm">
            <p>© {new Date().getFullYear()} Child Health Monitor. All rights reserved.</p>
            <p className="mt-2">Built for healthcare professionals with Next.js 14 & Firebase</p>
          </div>
        </div>
      </footer>
    </div>
  );
}