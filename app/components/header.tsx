// app/components/Header.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Bell, 
  ChevronDown, 
  User, 
  Home, 
  Users, 
  FilePlus, 
  Calendar, 
  Settings, 
  BarChart, 
  LogOut,
  Menu,
  X,
  Search,
  ArrowLeft,
  Activity,
  Clipboard,
  Heart,
  Shield,
  Baby,
  PlusCircle
} from 'lucide-react';

// Type definitions
type UserRole = 'admin' | 'healthcare' | 'parent';
type AuthUser = {
  name?: string;
  email?: string;
  role: UserRole;
} | null;

interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
  role?: UserRole[];
  action?: () => void;
  exact?: boolean;
}

interface BottomNavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  action?: () => void;
  exact?: boolean;
}

interface UserInfo {
  name: string;
  initials: string;
  email: string;
}

interface RoleConfig {
  label: string;
  color: string;
  icon: React.ReactNode;
}

interface AuthContextType {
  user: AuthUser;
  logout: () => Promise<void>;
}

// Custom hook for auth context - IMPORTANT: Replace with your actual auth context import
// Remove this and uncomment the import below if you have a real auth context
const useAuth = (): AuthContextType => {
  // This is a stub - replace with your actual auth context
  return {
    user: null,
    logout: async () => {}
  };
};
// If you have a real auth context, use this instead:
// import { useAuth } from '@/app/context/AuthContext';

// Custom swipe hook to replace react-swipeable
const useTouchSwipe = (onSwipeLeft: () => void, onSwipeRight: () => void) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) onSwipeLeft();
    if (isRightSwipe) onSwipeRight();
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Determine if we're on a dashboard page
  const isDashboard = pathname.startsWith('/dashboard');

  // Public navigation for non-dashboard pages
  const publicNavigation: NavigationItem[] = [
    { name: 'Home', href: '/', icon: <Home size={20} /> },
    { name: 'Features', href: '#', icon: <Activity size={20} /> },
    { name: 'Pricing', href: '#', icon: <Heart size={20} /> },
    { name: 'Resources', href: '#', icon: <Clipboard size={20} /> },
    { name: 'About', href: '#', icon: <Shield size={20} /> },
    { name: 'Dashboard', href: '/dashboard', icon: <BarChart size={20} /> }
  ];

  // Role-based mobile bottom navigation
  const getMobileBottomNav = (): BottomNavItem[] => {
    const baseItems: BottomNavItem[] = [
      { name: 'Home', href: '/dashboard', icon: <Home size={24} />, exact: true },
      { name: 'Search', href: '#', icon: <Search size={24} />, action: () => setSearchOpen(true) }
    ];

    if (!user) return baseItems;

    if (user.role === 'admin') {
      return [
        ...baseItems,
        { name: 'Analytics', href: '/dashboard/admin/analytics', icon: <BarChart size={24} /> },
        { name: 'Users', href: '/dashboard/admin/users', icon: <Users size={24} /> },
        { name: 'Profile', href: '#', icon: <User size={24} /> }
      ];
    }

    if (user.role === 'healthcare') {
      return [
        ...baseItems,
        { name: 'Patients', href: '/dashboard/healthcare/children', icon: <Users size={24} /> },
        { name: 'Add', href: '/dashboard/healthcare/children/addChild', icon: <PlusCircle size={24} /> },
        { name: 'Profile', href: '#', icon: <User size={24} /> }
      ];
    }

    if (user.role === 'parent') {
      return [
        ...baseItems,
        { name: 'Children', href: '/dashboard/parent/child', icon: <Baby size={24} /> },
        { name: 'Appointments', href: '#', icon: <Calendar size={24} /> },
        { name: 'Profile', href: '#', icon: <User size={24} /> }
      ];
    }

    return baseItems;
  };

  // Handle scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Swipe handlers for slide-out navigation
  const swipeHandlers = useTouchSwipe(
    () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
        triggerHapticFeedback('light');
      }
    },
    () => {
      if (!mobileMenuOpen && isDashboard) {
        setMobileMenuOpen(true);
        triggerHapticFeedback('light');
      }
    }
  );

  // Haptic feedback simulation
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [50],
        medium: [100],
        heavy: [150]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const isActive = (path: string, exact: boolean = false): boolean => {
    if (path === '/') return pathname === '/';
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };

  // Get user display info
  const getUserDisplayInfo = (): UserInfo => {
    if (!user) return { name: 'Guest', initials: 'G', email: '' };
    
    const name = user.name || user.email?.split('@')[0] || 'User';
    const initials = name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return { 
      name, 
      initials, 
      email: user.email || '' 
    };
  };

  // Get role display info
  const getRoleDisplayInfo = (): RoleConfig => {
    const roleConfig: Record<UserRole, RoleConfig> = {
      admin: { 
        label: 'Administrator', 
        color: 'bg-purple-100 text-purple-800',
        icon: <Shield size={14} />
      },
      healthcare: { 
        label: 'Healthcare Provider', 
        color: 'bg-green-100 text-green-800',
        icon: <Activity size={14} />
      },
      parent: { 
        label: 'Parent', 
        color: 'bg-blue-100 text-blue-800',
        icon: <Heart size={14} />
      }
    };
    
    if (user?.role && roleConfig[user.role]) {
      return roleConfig[user.role];
    }
    
    return { 
      label: 'User', 
      color: 'bg-gray-100 text-gray-800',
      icon: <User size={14} />
    };
  };

  // Handle logout with haptic feedback
  const handleLogout = async () => {
    triggerHapticFeedback('medium');
    await logout();
    router.push('/');
    setUserMenuOpen(false);
  };

  // Mobile search component
  const MobileSearch = () => (
    <div className="fixed inset-0 z-50 bg-white lg:hidden">
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <button
          onClick={() => setSearchOpen(false)}
          className="p-2 -ml-2 mr-2 text-gray-600 hover:text-gray-900 active:scale-95 transition-transform touch-manipulation"
          aria-label="Close search"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search children, reports, or appointments..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            enterKeyHint="search"
          />
        </div>
      </div>
      
      {/* Search results */}
      <div className="p-4">
        <p className="text-sm text-gray-500 mb-4">Recent searches</p>
        {/* Search results would go here */}
      </div>
    </div>
  );

  // Render different header content based on authentication and location
  const renderRightSide = () => {
    if (user && isDashboard) {
      const userInfo = getUserDisplayInfo();
      const roleInfo = getRoleDisplayInfo();

      return (
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search button - mobile only */}
          <button
            onClick={() => setSearchOpen(true)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors active:scale-95 touch-manipulation"
            aria-label="Search"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <Search size={20} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors active:scale-95 touch-manipulation"
              aria-label="Notifications"
              onClick={() => {
                setNotificationMenuOpen(!notificationMenuOpen);
                triggerHapticFeedback('light');
              }}
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            {/* Notification dropdown */}
            {notificationMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-900">Notifications</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50">
                    <p className="text-sm text-gray-900">No new notifications</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                triggerHapticFeedback('light');
              }}
              className="flex items-center space-x-2 px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors active:scale-95 touch-manipulation"
              aria-label="User menu"
              style={{ minHeight: '44px' }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-medium text-gray-700 text-sm">
                  {userInfo.initials}
                </span>
              </div>
              <ChevronDown 
                size={16} 
                className={`hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {/* Dropdown menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-900 truncate">{userInfo.name}</p>
                  <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${roleInfo.color} flex items-center gap-1`}>
                      {roleInfo.icon}
                      {roleInfo.label}
                    </span>
                  </div>
                </div>
                
                {/* Navigation links */}
                <div className="max-h-64 overflow-y-auto">
                  <Link
                    href="/"
                    onClick={() => {
                      setUserMenuOpen(false);
                      triggerHapticFeedback('light');
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                    style={{ minHeight: '44px' }}
                  >
                    <Home size={18} />
                    <span>Home</span>
                  </Link>
                  
                  <Link
                    href="#"
                    onClick={() => {
                      setUserMenuOpen(false);
                      triggerHapticFeedback('light');
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                    style={{ minHeight: '44px' }}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                  
                  <Link
                    href="#"
                    onClick={() => {
                      setUserMenuOpen(false);
                      triggerHapticFeedback('light');
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                    style={{ minHeight: '44px' }}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                  
                  {/* Role-specific links */}
                  {user.role === 'admin' && (
                    <Link
                      href="/dashboard/admin/analytics"
                      onClick={() => {
                        setUserMenuOpen(false);
                        triggerHapticFeedback('light');
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-purple-700 hover:bg-purple-50 active:bg-purple-100"
                      style={{ minHeight: '44px' }}
                    >
                      <BarChart size={18} />
                      <span>Analytics</span>
                    </Link>
                  )}
                  
                  {user.role === 'healthcare' && (
                    <>
                      <Link
                        href="/dashboard/healthcare/children"
                        onClick={() => {
                          setUserMenuOpen(false);
                          triggerHapticFeedback('light');
                        }}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-blue-700 hover:bg-blue-50 active:bg-blue-100"
                        style={{ minHeight: '44px' }}
                      >
                        <Users size={18} />
                        <span>Patients</span>
                      </Link>
                      <Link
                        href="/dashboard/healthcare/children/addChild"
                        onClick={() => {
                          setUserMenuOpen(false);
                          triggerHapticFeedback('light');
                        }}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-green-700 hover:bg-green-50 active:bg-green-100"
                        style={{ minHeight: '44px' }}
                      >
                        <PlusCircle size={18} />
                        <span>Add Child</span>
                      </Link>
                    </>
                  )}
                  
                  {user.role === 'parent' && (
                    <Link
                      href="/dashboard/parent/child"
                      onClick={() => {
                        setUserMenuOpen(false);
                        triggerHapticFeedback('light');
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-green-700 hover:bg-green-50 active:bg-green-100"
                      style={{ minHeight: '44px' }}
                    >
                      <Baby size={18} />
                      <span>Children</span>
                    </Link>
                  )}
                </div>
                
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 active:bg-red-100"
                  style={{ minHeight: '44px' }}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (user && !isDashboard) {
      return (
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all active:scale-95 touch-manipulation"
            style={{ minHeight: '44px' }}
            onClick={() => triggerHapticFeedback('light')}
          >
            <Home size={18} className="mr-2" />
            <span className="hidden sm:inline">Go to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
        </div>
      );
    }

    // Default: Not logged in (public header)
    return (
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Link
          href="/login"
          className="hidden sm:inline-flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors active:scale-95 touch-manipulation"
          style={{ minHeight: '44px' }}
        >
          Sign In
        </Link>
        
        <Link
          href="#"
          className="inline-flex items-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all active:scale-95 touch-manipulation"
          style={{ minHeight: '44px' }}
          onClick={() => triggerHapticFeedback('light')}
        >
          <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">Get Started Free</span>
          <span className="sm:hidden">Get Started</span>
        </Link>
      </div>
    );
  };

  // Mobile bottom navigation (only for dashboard)
  const MobileBottomNav = () => {
    if (!isDashboard || !user) return null;

    const bottomNavItems = getMobileBottomNav();
    const currentPath = pathname;

    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl lg:hidden safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16">
          {bottomNavItems.map((item) => {
            const active = item.exact 
              ? currentPath === item.href 
              : currentPath.startsWith(item.href);
            
            if (item.action) {
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    item.action?.();
                    triggerHapticFeedback('light');
                  }}
                  className={`flex flex-col items-center justify-center flex-1 h-full ${
                    active ? 'text-blue-600' : 'text-gray-600'
                  } active:scale-95 touch-manipulation`}
                  style={{ minHeight: '44px' }}
                  aria-label={item.name}
                >
                  <div className={`p-2 rounded-full ${active ? 'bg-blue-50' : ''}`}>
                    {item.icon}
                  </div>
                  <span className="text-xs mt-1">{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  active ? 'text-blue-600' : 'text-gray-600'
                } active:scale-95 touch-manipulation`}
                onClick={() => triggerHapticFeedback('light')}
                style={{ minHeight: '44px' }}
                aria-label={item.name}
              >
                <div className={`p-2 rounded-full ${active ? 'bg-blue-50' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  };

  // Mobile slide-out navigation
  const MobileSlideOutNav = () => {
    if (!isDashboard || !user) return null;

    return (
      <>
        {/* Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Slide-out panel */}
        <div
          ref={mobileMenuRef}
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onTouchStart={swipeHandlers.onTouchStart}
          onTouchMove={swipeHandlers.onTouchMove}
          onTouchEnd={swipeHandlers.onTouchEnd}
        >
          <div className="flex flex-col h-full pt-6">
            {/* Header */}
            <div className="px-4 pb-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-gray-700">
                      {getUserDisplayInfo().initials}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {getUserDisplayInfo().name}
                    </p>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleDisplayInfo().color}`}>
                        {getRoleDisplayInfo().label}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg active:scale-95 touch-manipulation"
                  aria-label="Close menu"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Navigation items */}
            <div className="flex-1 overflow-y-auto px-2 py-4">
              <nav className="space-y-1">
                {getMobileBottomNav().map((item) => {
                  if (item.action || item.href === '#') return null;
                  
                  const active = item.exact 
                    ? pathname === item.href 
                    : pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        triggerHapticFeedback('light');
                      }}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors active:scale-95 touch-manipulation ${
                        active
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      style={{ minHeight: '44px' }}
                    >
                      <div className={`p-1.5 rounded-md ${active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {item.icon}
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <Link
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg active:scale-95 touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg active:scale-95 touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <header 
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isScrolled ? 'shadow-lg' : 'shadow-sm'
        } ${isDashboard ? 'bg-white' : 'bg-white/95 backdrop-blur-sm supports-backdrop-blur:bg-white/60'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo and Brand */}
            <div className="flex items-center">
              {isDashboard && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(!mobileMenuOpen);
                    triggerHapticFeedback('light');
                  }}
                  className="lg:hidden p-2 -ml-2 mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform touch-manipulation"
                  aria-label="Toggle mobile menu"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
              
              <Link 
                href="/" 
                className="flex items-center space-x-3 active:scale-95 touch-manipulation"
                onClick={() => triggerHapticFeedback('light')}
              >
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-2 rounded-lg shadow-lg">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Well~Child Clinic
                  </h1>
                  <p className="text-xs text-gray-600 hidden sm:block">Child Growth Tracker</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Only show for public pages */}
            {!isDashboard && (
              <nav className="hidden lg:flex items-center space-x-6">
                {publicNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors relative active:scale-95 touch-manipulation ${
                      isActive(item.href)
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                    onClick={() => triggerHapticFeedback('light')}
                    style={{ minHeight: '44px' }}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {isActive(item.href) && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></span>
                    )}
                  </Link>
                ))}
              </nav>
            )}

            {/* Right side actions */}
            {renderRightSide()}
          </div>
        </div>

        {/* Mobile Menu for public navigation */}
        {!isDashboard && mobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="lg:hidden border-t border-gray-200 bg-white shadow-lg animate-fade-in"
          >
            <div className="px-4 py-4 space-y-1">
              {publicNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    triggerHapticFeedback('light');
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium active:scale-95 touch-manipulation ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              
              <div className="border-t border-gray-200 pt-4">
                <Link
                  href="/login"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    triggerHapticFeedback('light');
                  }}
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg mb-2 active:scale-95 touch-manipulation"
                  style={{ minHeight: '44px' }}
                >
                  Sign In
                </Link>
                <Link
                  href="#"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    triggerHapticFeedback('light');
                  }}
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md active:scale-95 touch-manipulation"
                  style={{ minHeight: '44px' }}
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile search overlay */}
      {searchOpen && <MobileSearch />}

      {/* Mobile slide-out navigation (dashboard only) */}
      <MobileSlideOutNav />

      {/* Mobile bottom navigation (dashboard only) */}
      <MobileBottomNav />

      {/* Add padding to main content for fixed bottom nav */}
      {isDashboard && user && (
        <style jsx global>{`
          @supports (padding: max(0px)) {
            body {
              padding-bottom: max(4rem, env(safe-area-inset-bottom));
            }
          }
        `}</style>
      )}
    </>
  );
}