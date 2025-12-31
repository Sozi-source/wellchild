'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Home, 
  Users, 
  UserCircle, 
  FileText, 
  BarChart3, 
  Activity,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Settings,
  ChevronDown,
  User,
  Shield,
  Stethoscope,
  Baby,
  TrendingUp,
  Clipboard,
  Calendar,
  MessageSquare,
  HelpCircle,
  Sun,
  Moon,
  Smartphone,
  Share2
} from 'lucide-react';

export default function Navigation() {
  const { user, userProfile, logout } = useAuth(); // Added userProfile
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [touchActive, setTouchActive] = useState<string | null>(null);
  const [notifications] = useState(3); // Mock notification count
  const [darkMode, setDarkMode] = useState(false);

  // Use userProfile for role information
  const userRole = userProfile?.role || user?.role || 'guardian'; // Default to guardian
  const userName = userProfile?.name || user?.name || 'User';
  const userEmail = userProfile?.email || user?.email || '';

  // Handle scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [pathname]);

  // Close menus on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      // Haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleTouchStart = (id: string) => {
    setTouchActive(id);
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => setTouchActive(null), 150);
  };

  const handleShare = () => {
    if ('share' in navigator) {
      navigator.share({
        title: 'WellChild Clinic',
        text: 'Track child growth with WHO standards',
        url: window.location.href,
      });
    }
  };

  // FIXED: Navigation items by role with correct URLs
  const navItems = {
    guardian: [ // Changed from 'parent' to 'guardian'
      { href: '/dashboard/guardian', label: 'Dashboard', icon: Home, color: 'text-blue-600' },
      { href: '/dashboard/guardian/child', label: 'My Children', icon: Baby, color: 'text-pink-600' },
      { href: '/dashboard/guardian/measurements', label: 'Measurements', icon: Activity, color: 'text-emerald-600' },
      { href: '/dashboard/guardian/growth-charts', label: 'Growth Charts', icon: TrendingUp, color: 'text-purple-600' },
      { href: '/dashboard/guardian/vaccinations', label: 'Vaccinations', icon: Shield, color: 'text-amber-600' },
    ],
    clinician: [ // Changed from 'healthcare' to 'clinician'
      { href: '/dashboard/clinician', label: 'Dashboard', icon: Home, color: 'text-blue-600' },
      { href: '/dashboard/clinician/patients', label: 'Patients', icon: Users, color: 'text-teal-600' },
      { href: '/dashboard/clinician/measurements', label: 'Measurements', icon: Activity, color: 'text-emerald-600' },
      { href: '/dashboard/clinician/medical-records', label: 'Medical Records', icon: FileText, color: 'text-orange-600' },
      { href: '/dashboard/clinician/appointments', label: 'Appointments', icon: Calendar, color: 'text-purple-600' },
    ],
    admin: [
      { href: '/dashboard/admin', label: 'Dashboard', icon: Home, color: 'text-blue-600' },
      { href: '/dashboard/admin/users', label: 'Users', icon: Users, color: 'text-teal-600' },
      { href: '/dashboard/admin/patients', label: 'Patients', icon: Baby, color: 'text-pink-600' },
      { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3, color: 'text-purple-600' },
      { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings, color: 'text-gray-600' },
    ]
  };

  // Get current nav items based on role
  const currentNavItems = userRole in navItems ? navItems[userRole as keyof typeof navItems] : navItems.guardian;

  // FIXED: Check if current path starts with any of the dashboard routes
  const isDashboardRoute = pathname.startsWith('/dashboard/');
  
  // Don't show navigation on auth pages
  const hideNav = [
    '/login', 
    '/register', 
    '/forgot-password', 
    '/reset-password',
    '/auth/',
    '/signin',
    '/signup'
  ].some(route => pathname.startsWith(route));
  
  if (hideNav || !isDashboardRoute) {
    return null;
  }

  // Check if active based on pathname
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch(role) {
      case 'guardian': return 'Guardian';
      case 'clinician': return 'Healthcare Provider';
      case 'admin': return 'Administrator';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Navigation */}
      <nav 
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left: Logo and Desktop Navigation */}
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden p-2 rounded-lg mr-2 active:scale-95 transition-transform touch-target ${
                  touchActive === 'menu-btn' ? 'bg-gray-100' : ''
                }`}
                style={{ minWidth: '44px', minHeight: '44px' }}
                onTouchStart={() => handleTouchStart('menu-btn')}
                onTouchEnd={handleTouchEnd}
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* Logo */}
              <Link 
                href={user ? `/${userRole === 'clinician' ? 'dashboard/clinician' : userRole === 'admin' ? 'dashboard/admin' : 'dashboard/guardian'}` : '/'}
                className="flex items-center space-x-2 active:scale-95 transition-transform touch-target"
                style={{ minHeight: '44px' }}
                onTouchStart={() => handleTouchStart('logo')}
                onTouchEnd={handleTouchEnd}
              >
                <Stethoscope className="h-7 w-7 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">
                    WellChild
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">Clinic</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              {user && (
                <div className="hidden lg:flex lg:ml-10 lg:space-x-1">
                  {currentNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const itemId = `desktop-${item.href}`;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-4 py-2 rounded-lg mx-1 transition-all ${
                          active
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        } ${touchActive === itemId ? 'scale-95' : ''} touch-target`}
                        style={{ minHeight: '44px' }}
                        onTouchStart={() => handleTouchStart(itemId)}
                        onTouchEnd={handleTouchEnd}
                      >
                        <Icon className={`h-4 w-4 mr-2 ${item.color}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: User Profile and Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Button - Mobile Only */}
              {user && (
                <button
                  onClick={() => {/* Implement search */}}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform touch-target"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                  onTouchStart={() => handleTouchStart('search')}
                  onTouchEnd={handleTouchEnd}
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 text-gray-600" />
                </button>
              )}

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform touch-target"
                style={{ minWidth: '44px', minHeight: '44px' }}
                onTouchStart={() => handleTouchStart('share')}
                onTouchEnd={handleTouchEnd}
                aria-label="Share"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>

              {user ? (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => {/* Implement notifications */}}
                      className={`p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform touch-target ${
                        touchActive === 'notifications' ? 'bg-gray-100' : ''
                      }`}
                      style={{ minWidth: '44px', minHeight: '44px' }}
                      onTouchStart={() => handleTouchStart('notifications')}
                      onTouchEnd={handleTouchEnd}
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5 text-gray-600" />
                      {notifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {notifications}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Theme Toggle */}
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform touch-target"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {darkMode ? (
                      <Sun className="h-5 w-5 text-gray-600" />
                    ) : (
                      <Moon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>

                  {/* Profile Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform touch-target ${
                        touchActive === 'profile' ? 'bg-gray-100' : ''
                      }`}
                      style={{ minHeight: '44px' }}
                      onTouchStart={() => handleTouchStart('profile')}
                      onTouchEnd={handleTouchEnd}
                      aria-label="User menu"
                      aria-expanded={isProfileMenuOpen}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        userRole === 'guardian' ? 'bg-blue-100' :
                        userRole === 'clinician' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        <span className={`text-sm font-semibold ${
                          userRole === 'guardian' ? 'text-blue-600' :
                          userRole === 'clinician' ? 'text-green-600' :
                          'text-purple-600'
                        }`}>
                          {userName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                          {userName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getRoleDisplayName(userRole)}
                        </p>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${
                        isProfileMenuOpen ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Profile Dropdown */}
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-slide-down">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{userName}</p>
                          <p className="text-xs text-gray-500">{getRoleDisplayName(userRole)}</p>
                          <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                        </div>
                        
                        <div className="py-1">
                          <Link
                            href={`/dashboard/${userRole}/profile`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <User className="h-4 w-4 mr-3" />
                            My Profile
                          </Link>
                          <Link
                            href={`/dashboard/${userRole}/settings`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Settings
                          </Link>
                          <Link
                            href={`/dashboard/${userRole}/help`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <HelpCircle className="h-4 w-4 mr-3" />
                            Help & Support
                          </Link>
                        </div>
                        
                        <div className="border-t border-gray-100 py-1">
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsProfileMenuOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Non-authenticated user actions
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform touch-target"
                    style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-transform touch-target"
                    style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && user && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 animate-slide-down">
            <div className="px-4 py-3">
              {/* User Info */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  userRole === 'guardian' ? 'bg-blue-100' :
                  userRole === 'clinician' ? 'bg-green-100' :
                  'bg-purple-100'
                }`}>
                  <span className={`text-lg font-semibold ${
                    userRole === 'guardian' ? 'text-blue-600' :
                    userRole === 'clinician' ? 'text-green-600' :
                    'text-purple-600'
                  }`}>
                    {userName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{userName}</p>
                  <p className="text-sm text-gray-500">{getRoleDisplayName(userRole)}</p>
                </div>
              </div>

              {/* Mobile Navigation Items */}
              <div className="space-y-1">
                {currentNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const itemId = `mobile-${item.href}`;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center p-3 rounded-lg transition-all ${
                        active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      } ${touchActive === itemId ? 'scale-95' : ''} touch-target`}
                      style={{ minHeight: '52px' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      onTouchStart={() => handleTouchStart(itemId)}
                      onTouchEnd={handleTouchEnd}
                    >
                      <Icon className={`h-5 w-5 mr-3 ${item.color}`} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/dashboard/${userRole}/profile`}
                    className="flex items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 active:scale-95 transition-transform touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="text-sm">Profile</span>
                  </Link>
                  <Link
                    href={`/dashboard/${userRole}/settings`}
                    className="flex items-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 active:scale-95 transition-transform touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center w-full mt-4 p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-transform touch-target"
                  style={{ minHeight: '52px' }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Inline Styles for Animations */}
      <style jsx global>{`
        @keyframes slide-down {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down { animation: slide-down 0.2s ease-out; }
        
        .touch-target {
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* iOS safe area */
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
        .pt-safe {
          padding-top: env(safe-area-inset-top);
        }
      `}</style>
    </>
  );
}