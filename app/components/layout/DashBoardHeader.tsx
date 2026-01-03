"use client";

import { ReactNode, useState, useRef, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import {
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Home,
  UserCircle,
  Menu,
  Shield,
  Stethoscope,
  Heart,
  LogOut,
  Settings,
  X
} from 'lucide-react';

interface DashboardHeaderProps {
  showSearch?: boolean;
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  onBack?: () => void;
}

// Helper to generate breadcrumbs from pathname
const getBreadcrumbsFromPath = (pathname: string, title?: string) => {
  const segments = pathname.split('/').filter(segment => segment);
  const breadcrumbs = [];
  
  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Format label: capitalize and replace dashes
    let label = segment.replace(/-/g, ' ');
    label = label.charAt(0).toUpperCase() + label.slice(1);
    
    // Use provided title for the last segment if available
    if (i === segments.length - 1 && title) {
      label = title;
    }
    
    breadcrumbs.push({
      label,
      href: currentPath,
      isLast: i === segments.length - 1
    });
  }
  
  return breadcrumbs;
};

export default function DashboardHeader({
  showSearch = true,
  showBackButton = false,
  title,
  subtitle,
  headerActions,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  onBack
}: DashboardHeaderProps) {
  const { userProfile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  
  // Auto-generate breadcrumbs from pathname
  const breadcrumbs = getBreadcrumbsFromPath(pathname, title);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getRoleIcon = () => {
    if (!userProfile?.role) return <Shield className="h-4 w-4" />;
    switch (userProfile.role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'clinician': return <Stethoscope className="h-4 w-4" />;
      case 'guardian': return <Heart className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleColor = () => {
    if (!userProfile?.role) return 'text-gray-600 bg-gray-100';
    switch (userProfile.role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'clinician': return 'text-blue-600 bg-blue-100';
      case 'guardian': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleLabel = () => {
    if (!userProfile?.role) return 'User';
    switch (userProfile.role) {
      case 'admin': return 'Administrator';
      case 'clinician': return 'Healthcare Provider';
      case 'guardian': return 'Parent/Guardian';
      default: return 'User';
    }
  };

  const getUserInitials = () => {
    if (!userProfile?.name) return 'U';
    return userProfile.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const mobileNavItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      path: `/dashboard/${userProfile?.role || 'admin'}`,
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search className="h-5 w-5" />,
      path: '#',
      action: () => setSearchOpen(true)
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: <Bell className="h-5 w-5" />,
      path: `/dashboard/${userProfile?.role || 'admin'}/notifications`,
      badge: 3
    }
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Main Header - Single source of truth for title */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Top row: Navigation and user actions */}
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Left: Navigation */}
            <div className="flex items-center space-x-4">
              {showBackButton && onBack && (
                <button
                  onClick={onBack}
                  className="p-1.5 rounded-lg hover:bg-gray-100 flex items-center"
                  aria-label="Go back"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm font-medium ml-1 hidden sm:inline">Back</span>
                </button>
              )}
              
              {/* Desktop breadcrumbs */}
              <div className="hidden md:flex items-center text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-3 w-3 text-gray-400 mx-1" />}
                    {crumb.isLast ? (
                      <span className="font-semibold text-gray-900 truncate max-w-[160px]">
                        {crumb.label}
                      </span>
                    ) : crumb.href ? (
                      <button
                        onClick={() => router.push(crumb.href)}
                        className="text-gray-600 hover:text-gray-900 hover:underline truncate max-w-[120px]"
                      >
                        {crumb.label}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              
              {/* Mobile title */}
              <div className="md:hidden">
                <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                  {breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            {/* Center: Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              {showSearch && (
                <form onSubmit={onSearchSubmit} className="w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Right: User actions */}
            <div className="flex items-center space-x-2">
              {showSearch && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}

              <div className="relative" ref={notificationMenuRef}>
                <button
                  onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                  className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </div>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {getUserInitials()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                      {userProfile?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{userProfile?.email}</p>
                  </div>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900 truncate">{userProfile?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
                      <div className="flex items-center mt-1.5">
                        <span className={cn("text-xs px-2 py-1 rounded-full flex items-center gap-1", getRoleColor())}>
                          {getRoleIcon()}
                          {getRoleLabel()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => {
                          router.push(`/dashboard/${userProfile?.role}/profile`);
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <UserCircle className="h-4 w-4 mr-3" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          router.push(`/dashboard/${userProfile?.role}/settings`);
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {headerActions && (
                <div className="hidden lg:flex items-center space-x-2">
                  {headerActions}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Title Section - Only show when we have title/subtitle */}
          {(title || subtitle) && (
            <div className="hidden lg:block border-t border-gray-100 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                  {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
                </div>
                {headerActions && (
                  <div className="flex items-center space-x-2">
                    {headerActions}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="flex items-center h-14 px-4 border-b border-gray-200">
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 -ml-2 mr-2 text-gray-600 hover:text-gray-900"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.action ? item.action() : router.push(item.path)}
              className="flex flex-col items-center justify-center p-1 text-gray-600"
            >
              <div className="relative">
                <div className="p-2 rounded-full hover:bg-gray-100">
                  {item.icon}
                </div>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={() => setUserMenuOpen(true)}
            className="flex flex-col items-center justify-center p-1 text-gray-600"
          >
            <div className="p-2 rounded-full hover:bg-gray-100">
              <Menu className="h-5 w-5" />
            </div>
            <span className="text-xs mt-1 font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}