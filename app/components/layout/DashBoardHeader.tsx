// /app/components/layout/DashboardHeader.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  HelpCircle, 
  Menu,
  ArrowLeft,
  ChevronRight,
  Home,
  MoreVertical,
  X,
  Calendar,
  FileText,
  Users,
  Baby,
  BarChart3,
  Stethoscope,
  Shield,
  Heart
} from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  hasSidePanel?: boolean;
  onMenuClick?: () => void;
  showBackButton?: boolean;
  showSearch?: boolean;
  showBreadcrumb?: boolean;
  onBack?: () => void;
}

// Route mapping for breadcrumb labels
const routeMapping: Record<string, { label: string; icon?: React.ReactNode }> = {
  'dashboard': { label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  'admin': { label: 'Admin', icon: <Shield className="h-4 w-4" /> },
  'clinicians': { label: 'Clinicians', icon: <Stethoscope className="h-4 w-4" /> },
  'guardian': { label: 'Guardian', icon: <Heart className="h-4 w-4" /> },
  'users': { label: 'Users', icon: <Users className="h-4 w-4" /> },
  'patients': { label: 'Patients', icon: <Users className="h-4 w-4" /> },
  'children': { label: 'Children', icon: <Baby className="h-4 w-4" /> },
  'appointments': { label: 'Appointments', icon: <Calendar className="h-4 w-4" /> },
  'growth': { label: 'Growth Charts', icon: <BarChart3 className="h-4 w-4" /> },
  'vaccinations': { label: 'Vaccinations', icon: <Shield className="h-4 w-4" /> },
  'records': { label: 'Records', icon: <FileText className="h-4 w-4" /> },
  'settings': { label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  'reports': { label: 'Reports', icon: <BarChart3 className="h-4 w-4" /> },
  'analytics': { label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  'notifications': { label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  'activity': { label: 'Activity', icon: <BarChart3 className="h-4 w-4" /> },
  'clinic': { label: 'Clinic', icon: <Stethoscope className="h-4 w-4" /> },
  'system': { label: 'System', icon: <Settings className="h-4 w-4" /> },
  'audit': { label: 'Audit', icon: <FileText className="h-4 w-4" /> },
};

// Custom titles for specific routes
const customTitles: Record<string, string> = {
  '/dashboard/admin/users/create': 'Create User',
  '/dashboard/admin/users/edit': 'Edit User',
  '/dashboard/clinicians/children/[id]': 'Patient Details',
  '/dashboard/guardian/children/[id]': 'Child Details',
  '/dashboard/admin': 'Admin Dashboard',
  '/dashboard/clinicians': 'Clinician Dashboard',
  '/dashboard/guardian': 'Guardian Dashboard',
};

export default function DashboardHeader({ 
  title: propTitle, 
  subtitle: propSubtitle, 
  actions,
  hasSidePanel = true,
  onMenuClick,
  showBackButton = false,
  showSearch = true,
  showBreadcrumb = true,
  onBack
}: DashboardHeaderProps) {
  const { userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Role-based color schemes
  const getRoleColors = () => {
    switch (userProfile?.role) {
      case 'clinician':
        return {
          bg: 'bg-white',
          border: 'border-teal-200',
          text: 'text-teal-900',
          subtitle: 'text-teal-700',
          icon: 'text-teal-600',
          hover: 'hover:bg-teal-50',
          avatarBg: 'bg-teal-100',
          avatarText: 'text-teal-700',
          badge: 'bg-teal-500',
          searchBg: 'bg-teal-50',
          searchBorder: 'border-teal-200',
          backButton: 'text-teal-600 hover:bg-teal-100',
          breadcrumbActive: 'text-teal-900',
          breadcrumbInactive: 'text-teal-600 hover:text-teal-800',
          breadcrumbDivider: 'text-teal-400',
        };
      case 'admin':
        return {
          bg: 'bg-white',
          border: 'border-blue-200',
          text: 'text-blue-900',
          subtitle: 'text-blue-700',
          icon: 'text-blue-600',
          hover: 'hover:bg-blue-50',
          avatarBg: 'bg-blue-100',
          avatarText: 'text-blue-700',
          badge: 'bg-blue-500',
          searchBg: 'bg-blue-50',
          searchBorder: 'border-blue-200',
          backButton: 'text-blue-600 hover:bg-blue-100',
          breadcrumbActive: 'text-blue-900',
          breadcrumbInactive: 'text-blue-600 hover:text-blue-800',
          breadcrumbDivider: 'text-blue-400',
        };
      case 'guardian':
        return {
          bg: 'bg-white',
          border: 'border-sky-200',
          text: 'text-sky-900',
          subtitle: 'text-sky-700',
          icon: 'text-sky-600',
          hover: 'hover:bg-sky-50',
          avatarBg: 'bg-sky-100',
          avatarText: 'text-sky-700',
          badge: 'bg-sky-500',
          searchBg: 'bg-sky-50',
          searchBorder: 'border-sky-200',
          backButton: 'text-sky-600 hover:bg-sky-100',
          breadcrumbActive: 'text-sky-900',
          breadcrumbInactive: 'text-sky-600 hover:text-sky-800',
          breadcrumbDivider: 'text-sky-400',
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          text: 'text-gray-900',
          subtitle: 'text-gray-700',
          icon: 'text-gray-600',
          hover: 'hover:bg-gray-50',
          avatarBg: 'bg-gray-100',
          avatarText: 'text-gray-700',
          badge: 'bg-gray-500',
          searchBg: 'bg-gray-50',
          searchBorder: 'border-gray-200',
          backButton: 'text-gray-600 hover:bg-gray-100',
          breadcrumbActive: 'text-gray-900',
          breadcrumbInactive: 'text-gray-600 hover:text-gray-800',
          breadcrumbDivider: 'text-gray-400',
        };
    }
  };

  const colors = getRoleColors();

  // Generate breadcrumb items
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs = [];
    let currentPath = '';
    
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      const segment = segments[i];
      
      // Check for custom title
      const customTitle = Object.keys(customTitles).find(pattern => {
        if (pattern.includes('[id]')) {
          const regexPattern = pattern.replace('[id]', '[^/]+');
          return new RegExp(`^${regexPattern}$`).test(pathname);
        }
        return pattern === pathname;
      });

      if (customTitle && i === segments.length - 1) {
        breadcrumbs.push({
          label: customTitles[customTitle],
          href: currentPath,
          isLast: true
        });
        continue;
      }

      const routeInfo = routeMapping[segment] || { 
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      };
      
      breadcrumbs.push({
        label: routeInfo.label,
        href: currentPath,
        icon: routeInfo.icon,
        isLast: i === segments.length - 1
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const isMainDashboard = pathname === '/dashboard';

  // Auto-generate title if not provided
  const title = propTitle || (breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Dashboard');
  
  // Auto-generate subtitle based on role if not provided
  const subtitle = propSubtitle || (() => {
    if (isMainDashboard) {
      switch (userProfile?.role) {
        case 'admin': return 'System Administration & Management';
        case 'clinician': return 'Patient Care & Medical Management';
        case 'guardian': return 'Child Health & Family Care';
        default: return 'Healthcare Dashboard';
      }
    }
    return undefined;
  })();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <header 
      className={cn(
        colors.bg,
        colors.border,
        "sticky top-0 z-40 border-b shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-white/95",
        hasSidePanel ? "left-0 lg:left-64" : "left-0",
        "right-0 transition-all duration-300"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side: Navigation and Title */}
        <div className="flex items-center flex-1 min-w-0 space-x-2 sm:space-x-4">
          {/* Mobile Menu Button */}
          {hasSidePanel && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
            </button>
          )}

          {/* Back Button */}
          {(showBackButton || (!isMainDashboard && isMobile)) && (
            <button
              onClick={handleBack}
              className={cn(
                "p-2 rounded-lg transition-colors flex-shrink-0",
                colors.backButton
              )}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          {/* Title and Breadcrumb */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb (Desktop) */}
            {showBreadcrumb && breadcrumbs.length > 0 && !isMobile && (
              <div className="flex items-center space-x-1 text-sm mb-1">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className={cn("h-4 w-4 mx-1", colors.breadcrumbDivider)} />
                    )}
                    {crumb.isLast ? (
                      <span className={cn("font-semibold truncate", colors.breadcrumbActive)}>
                        {crumb.label}
                      </span>
                    ) : (
                      <button
                        onClick={() => navigateTo(crumb.href)}
                        className={cn(
                          "truncate hover:underline transition-colors",
                          colors.breadcrumbInactive
                        )}
                      >
                        {crumb.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Main Title */}
            <div className="flex items-center space-x-2">
              <h1 className={cn("text-lg sm:text-xl font-semibold truncate", colors.text)}>
                {title}
              </h1>
              {/* Role Badge for Main Dashboard */}
              {isMainDashboard && userProfile?.role && (
                <span className={cn(
                  "hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                  userProfile.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                  userProfile.role === 'clinician' ? 'bg-teal-100 text-teal-800' :
                  'bg-sky-100 text-sky-800'
                )}>
                  {userProfile.role.toUpperCase()}
                </span>
              )}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <p className={cn("text-xs sm:text-sm mt-0.5 truncate", colors.subtitle)}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Actions and User */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search */}
          {showSearch && (
            <>
              {/* Desktop Search */}
              <form 
                onSubmit={handleSearch}
                className={cn(
                  "hidden md:flex items-center rounded-lg px-3 py-1.5 border transition-all",
                  colors.searchBg,
                  colors.searchBorder,
                  isSearchOpen ? "w-64" : "w-48"
                )}
              >
                <Search className={cn("h-4 w-4 mr-2 flex-shrink-0", colors.icon)} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patients, records..."
                  className="bg-transparent outline-none text-sm flex-1 min-w-0 placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="ml-2 p-0.5 rounded hover:bg-white/50"
                  >
                    <X className="h-3 w-3 text-gray-500" />
                  </button>
                )}
                <kbd className="hidden lg:inline-flex ml-2 text-xs text-gray-500 border border-gray-300 rounded px-1.5">
                  ⌘K
                </kbd>
              </form>

              {/* Mobile Search Toggle */}
              <button
                onClick={toggleSearch}
                className={cn(
                  "md:hidden p-2 rounded-lg transition-colors",
                  colors.hover
                )}
                aria-label="Search"
              >
                {isSearchOpen ? (
                  <X className={cn("h-5 w-5", colors.icon)} />
                ) : (
                  <Search className={cn("h-5 w-5", colors.icon)} />
                )}
              </button>
            </>
          )}

          {/* Mobile Search Overlay */}
          {isSearchOpen && isMobile && (
            <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 shadow-lg">
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patients, records..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* Notification Bell */}
          <button className={cn(
            "relative p-2 rounded-lg transition-colors",
            colors.hover
          )} aria-label="Notifications">
            <Bell className={cn("h-5 w-5", colors.icon)} />
            <span className={cn(
              "absolute top-1.5 right-1.5 h-2 w-2 rounded-full",
              colors.badge
            )} />
          </button>

          {/* Quick Actions Menu (desktop) */}
          <div className="hidden lg:flex items-center space-x-1">
            <button 
              className={cn(
                "p-2 rounded-lg transition-colors",
                colors.hover,
                colors.icon
              )}
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button 
              className={cn(
                "p-2 rounded-lg transition-colors",
                colors.hover,
                colors.icon
              )}
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-2 border-l border-gray-200">
            {/* User Info (desktop) */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                {userProfile?.role === 'clinician' ? `Dr. ${userProfile?.name?.split(' ')[0]}` : userProfile?.name}
              </p>
              <p className={cn("text-xs truncate capitalize", colors.subtitle)}>
                {userProfile?.role === 'clinician' 
                  ? (userProfile?.specialization || 'Pediatrician') 
                  : userProfile?.role}
              </p>
            </div>

            {/* Avatar with Status */}
            <div className="relative group">
              <button className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105",
                colors.avatarBg
              )} aria-label="User profile">
                <span className={cn("font-medium text-sm", colors.avatarText)}>
                  {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </button>
              <div className={cn(
                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",
                colors.badge
              )} />
              
              {/* Profile Dropdown (simplified) */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-gray-100">
                  <p className="font-medium text-sm text-gray-900">{userProfile?.name}</p>
                  <p className="text-xs text-gray-500">{userProfile?.email}</p>
                </div>
                <div className="p-1">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    My Profile
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    Settings
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                    Help & Support
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Actions */}
            {actions && (
              <div className="ml-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}