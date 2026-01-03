"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import {
  Home,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Shield,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  Stethoscope,
  Baby,
  Pill,
  Heart,
  ClipboardList,
  TrendingUp,
  Syringe,
  Database,
  AlertCircle,
  Building,
  Settings as SettingsIcon,
  User,
  Search,
  MessageSquare,
  X,
  ChevronDown,
  Clock,
  Lock
} from 'lucide-react';

// Feature flag configuration for all routes
const FEATURE_FLAGS = {
  guardian: {
    dashboard: true,
    activity: false,
    notifications: false,
    children: true,
    appointments: false,
    growth: false,
    vaccinations: false,
    records: false,
    messages: false,
  },
  clinician: {
    dashboard: true,
    activity: false,
    notifications: false,
    patients: true,
    appointments: false,
    records: false,
    prescriptions: false,
    analytics: false,
    messages: false,
  },
  admin: {
    dashboard: true,
    activity: false,
    notifications: false,
    users: true,
    clinics: false,
    reports: false,
    audit: false,
    settings: false,
  }
} as const;

// Coming soon page component
function ComingSoonToast({ label, onClose }: { label: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-3 animate-pulse" />
          <div className="flex-1">
            <h4 className="font-semibold">{label}</h4>
            <p className="text-sm opacity-90">This feature is coming soon!</p>
            <div className="mt-2 h-1.5 w-full bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white/70 rounded-full animate-progress" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-white/80 hover:text-white"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RoleSidePanel() {
  const { userProfile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ label: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showComingSoonToast = (label: string) => {
    setToast({ label });
    // Also log for debugging
    console.log(`Feature "${label}" is coming soon`);
  };

  // Get navigation items with proper availability
  const getNavigationItems = () => {
    if (!userProfile) return [];
    
    const role = userProfile.role as keyof typeof FEATURE_FLAGS;
    const roleBasePath = `/dashboard/${role}`;
    
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <Home className="h-5 w-5" />,
        path: roleBasePath,
        available: FEATURE_FLAGS[role]?.dashboard ?? true
      },
      {
        id: 'activity',
        label: 'Activity',
        icon: <Activity className="h-5 w-5" />,
        path: `${roleBasePath}/activity`,
        available: FEATURE_FLAGS[role]?.activity ?? false
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: <Bell className="h-5 w-5" />,
        path: `${roleBasePath}/notifications`,
        badge: 3,
        available: FEATURE_FLAGS[role]?.notifications ?? false,
      }
    ];

    switch (role) {
      case 'guardian':
        return [
          ...baseItems,
          {
            id: 'children',
            label: 'My Children',
            icon: <Baby className="h-5 w-5" />,
            path: '/dashboard/guardian/children',
            available: FEATURE_FLAGS.guardian.children,
          },
          {
            id: 'appointments',
            label: 'Appointments',
            icon: <Calendar className="h-5 w-5" />,
            path: '/dashboard/guardian/appointments',
            available: FEATURE_FLAGS.guardian.appointments,
          },
          {
            id: 'growth',
            label: 'Growth Charts',
            icon: <TrendingUp className="h-5 w-5" />,
            path: '/dashboard/guardian/growth',
            available: FEATURE_FLAGS.guardian.growth,
          },
          {
            id: 'vaccinations',
            label: 'Vaccinations',
            icon: <Syringe className="h-5 w-5" />,
            path: '/dashboard/guardian/vaccinations',
            available: FEATURE_FLAGS.guardian.vaccinations,
          },
          {
            id: 'records',
            label: 'Health Records',
            icon: <FileText className="h-5 w-5" />,
            path: '/dashboard/guardian/records',
            available: FEATURE_FLAGS.guardian.records,
          },
          {
            id: 'messages',
            label: 'Messages',
            icon: <MessageSquare className="h-5 w-5" />,
            path: '/dashboard/guardian/messages',
            available: FEATURE_FLAGS.guardian.messages,
          }
        ];
      case 'clinician':
        return [
          ...baseItems,
          {
            id: 'patients',
            label: 'My Patients',
            icon: <Users className="h-5 w-5" />,
            path: '/dashboard/clinician/children',
            available: FEATURE_FLAGS.clinician.patients,
          },
          {
            id: 'appointments',
            label: 'Appointments',
            icon: <Calendar className="h-5 w-5" />,
            path: '/dashboard/clinician/appointments',
            available: FEATURE_FLAGS.clinician.appointments,
          },
          {
            id: 'records',
            label: 'Medical Records',
            icon: <ClipboardList className="h-5 w-5" />,
            path: '/dashboard/clinician/records',
            available: FEATURE_FLAGS.clinician.records,
          },
          {
            id: 'prescriptions',
            label: 'Prescriptions',
            icon: <Pill className="h-5 w-5" />,
            path: '/dashboard/clinician/prescriptions',
            available: FEATURE_FLAGS.clinician.prescriptions,
          },
          {
            id: 'analytics',
            label: 'Analytics',
            icon: <BarChart3 className="h-5 w-5" />,
            path: '/dashboard/clinician/analytics',
            available: FEATURE_FLAGS.clinician.analytics,
          },
          {
            id: 'messages',
            label: 'Messages',
            icon: <MessageSquare className="h-5 w-5" />,
            path: '/dashboard/clinician/messages',
            available: FEATURE_FLAGS.clinician.messages,
          }
        ];
      case 'admin':
        return [
          ...baseItems,
          {
            id: 'users',
            label: 'User Management',
            icon: <Users className="h-5 w-5" />,
            path: '/dashboard/admin/users',
            available: FEATURE_FLAGS.admin.users,
          },
          {
            id: 'clinics',
            label: 'Clinic Management',
            icon: <Building className="h-5 w-5" />,
            path: '/dashboard/admin/clinics',
            available: FEATURE_FLAGS.admin.clinics,
          },
          {
            id: 'reports',
            label: 'Reports & Analytics',
            icon: <Database className="h-5 w-5" />,
            path: '/dashboard/admin/reports',
            available: FEATURE_FLAGS.admin.reports,
          },
          {
            id: 'audit',
            label: 'Audit Logs',
            icon: <AlertCircle className="h-5 w-5" />,
            path: '/dashboard/admin/audit',
            available: FEATURE_FLAGS.admin.audit,
          },
          {
            id: 'settings',
            label: 'System Settings',
            icon: <SettingsIcon className="h-5 w-5" />,
            path: '/dashboard/admin/settings',
            available: FEATURE_FLAGS.admin.settings,
          }
        ];
      default:
        return baseItems;
    }
  };

  // Mobile bottom navigation items (only available features)
  const getMobileNavItems = () => {
    if (!userProfile) return [];
    
    const role = userProfile.role as keyof typeof FEATURE_FLAGS;
    
    // Only show available items on mobile bottom nav
    const allItems = getNavigationItems();
    const availableItems = allItems.filter(item => item.available);
    
    // Limit to max 4 items for mobile bottom nav
    return availableItems.slice(0, 4);
  };

  // Role styles
  const getRoleStyles = () => {
    if (!userProfile) {
      return {
        sidebarBg: 'bg-gray-900',
        sidebarText: 'text-gray-100',
        sidebarBorder: 'border-gray-800',
        sidebarHoverBg: 'hover:bg-gray-800',
        sidebarActiveBg: 'bg-gray-700',
        sidebarIconBg: 'bg-gray-800',
        badgeColor: 'bg-gray-500',
        iconColor: 'text-white',
        accentBorder: 'border-gray-500',
        pendingBg: 'bg-gray-800/50',
        pendingText: 'text-gray-400',
        pendingBorder: 'border-gray-700'
      };
    }

    switch (userProfile.role) {
      case 'admin':
        return {
          sidebarBg: 'bg-slate-900',
          sidebarText: 'text-slate-100',
          sidebarBorder: 'border-slate-800',
          sidebarHoverBg: 'hover:bg-slate-800',
          sidebarActiveBg: 'bg-slate-700',
          sidebarIconBg: 'bg-blue-800',
          badgeColor: 'bg-blue-500',
          iconColor: 'text-white',
          accentBorder: 'border-blue-500',
          pendingBg: 'bg-slate-800/50',
          pendingText: 'text-slate-400',
          pendingBorder: 'border-slate-700'
        };
      case 'clinician':
        return {
          sidebarBg: 'bg-teal-900',
          sidebarText: 'text-teal-50',
          sidebarBorder: 'border-teal-800',
          sidebarHoverBg: 'hover:bg-teal-800',
          sidebarActiveBg: 'bg-teal-700',
          sidebarIconBg: 'bg-teal-800',
          badgeColor: 'bg-teal-500',
          iconColor: 'text-white',
          accentBorder: 'border-teal-500',
          pendingBg: 'bg-teal-800/50',
          pendingText: 'text-teal-400',
          pendingBorder: 'border-teal-700'
        };
      case 'guardian':
        return {
          sidebarBg: 'bg-sky-900',
          sidebarText: 'text-sky-50',
          sidebarBorder: 'border-sky-800',
          sidebarHoverBg: 'hover:bg-sky-800',
          sidebarActiveBg: 'bg-sky-700',
          sidebarIconBg: 'bg-sky-800',
          badgeColor: 'bg-sky-500',
          iconColor: 'text-white',
          accentBorder: 'border-sky-500',
          pendingBg: 'bg-sky-800/50',
          pendingText: 'text-sky-400',
          pendingBorder: 'border-sky-700'
        };
      default:
        return {
          sidebarBg: 'bg-gray-900',
          sidebarText: 'text-gray-100',
          sidebarBorder: 'border-gray-800',
          sidebarHoverBg: 'hover:bg-gray-800',
          sidebarActiveBg: 'bg-gray-700',
          sidebarIconBg: 'bg-gray-800',
          badgeColor: 'bg-gray-500',
          iconColor: 'text-white',
          accentBorder: 'border-gray-500',
          pendingBg: 'bg-gray-800/50',
          pendingText: 'text-gray-400',
          pendingBorder: 'border-gray-700'
        };
    }
  };

  // Get role icon
  const getRoleIcon = () => {
    if (!userProfile) return <User className="h-6 w-6" />;
    
    switch (userProfile.role) {
      case 'admin': return <Shield className="h-6 w-6" />;
      case 'clinician': return <Stethoscope className="h-6 w-6" />;
      case 'guardian': return <Heart className="h-6 w-6" />;
      default: return <User className="h-6 w-6" />;
    }
  };

  const navigationItems = getNavigationItems();
  const mobileNavItems = getMobileNavItems();
  const roleStyles = getRoleStyles();

  // Set mounted state after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect mobile - only on client side
  useEffect(() => {
    if (!mounted) return;
    
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mounted]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!mounted) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mounted]);

  // Update active tab based on pathname
  useEffect(() => {
    if (!mounted || !userProfile) return;
    
    const currentItem = navigationItems.find(item => 
      pathname === item.path || pathname.startsWith(item.path + '/')
    );
    if (currentItem) {
      setActiveTab(currentItem.id);
    }
  }, [pathname, navigationItems, mounted, userProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/');
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigation = (path: string, tabId: string, available: boolean = true, label: string = '') => {
    if (!available) {
      showComingSoonToast(label);
      return;
    }
    
    setActiveTab(tabId);
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Don't render anything during SSR or if no user profile
  if (!mounted || !userProfile) return null;

  // Navigation item component
  const renderNavItem = (item: any, isMobileBottomNav: boolean = false) => {
    const isActive = activeTab === item.id;
    const isPending = !item.available;
    
    // For mobile bottom nav (only available items should appear here)
    if (isMobileBottomNav) {
      return (
        <button
          key={item.id}
          onClick={() => handleNavigation(item.path, item.id, item.available, item.label)}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-lg transition-colors flex-1",
            isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
          )}
        >
          <div className={cn(
            "p-2 rounded-full transition-colors",
            isActive ? "bg-blue-50" : "bg-gray-50 hover:bg-gray-100"
          )}>
            {item.icon}
          </div>
          <span className="text-xs mt-1 font-medium truncate max-w-[80px]">
            {item.label}
          </span>
        </button>
      );
    }
    
    // For desktop sidebar (show all items, disabled for unavailable)
    if (isPending) {
      return (
        <div
          key={item.id}
          className={cn(
            "w-full flex items-center rounded-lg px-3 py-3 font-medium transition-colors duration-200 relative group",
            collapsed ? "justify-center" : "justify-start space-x-3",
            roleStyles.pendingBg,
            roleStyles.pendingText,
            "cursor-not-allowed"
          )}
          title={collapsed ? `${item.label} (Coming Soon)` : undefined}
          onClick={() => showComingSoonToast(item.label)}
        >
          {/* Coming soon indicator */}
          <div className="relative opacity-60">
            <div className="p-1.5 rounded-md">
              {item.icon}
            </div>
            {item.badge && (
              <span className={cn(
                "absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center font-bold",
                roleStyles.badgeColor
              )}>
                {item.badge}
              </span>
            )}
          </div>
          
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-sm font-medium opacity-75">
                {item.label}
              </span>
              <span className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded font-medium">
                Soon
              </span>
            </>
          )}
          
          {/* Tooltip for collapsed sidebar */}
          {collapsed && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
              {item.label}
              <div className="mt-1 text-xs text-amber-300">Coming Soon</div>
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-r-4 border-l-0 border-transparent border-r-gray-800"></div>
            </div>
          )}
        </div>
      );
    }
    
    // Active/available page
    return (
      <button
        key={item.id}
        onClick={() => handleNavigation(item.path, item.id, true, item.label)}
        className={cn(
          "w-full flex items-center rounded-lg px-3 py-3 font-medium transition-colors duration-200 relative",
          collapsed ? "justify-center" : "justify-start space-x-3",
          isActive ? roleStyles.sidebarActiveBg : roleStyles.sidebarHoverBg,
          "group"
        )}
        title={collapsed ? item.label : undefined}
      >
        {isActive && !collapsed && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r"></div>
        )}
        
        <div className="relative">
          <div className={cn(
            "p-1.5 rounded-md transition-colors",
            isActive ? "bg-white/20" : "group-hover:bg-white/10"
          )}>
            {item.icon}
          </div>
          
          {item.badge && (
            <span className={cn(
              "absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center font-bold",
              roleStyles.badgeColor
            )}>
              {item.badge}
            </span>
          )}
        </div>
        
        {!collapsed && (
          <span className="flex-1 text-left text-sm font-medium">
            {item.label}
          </span>
        )}
        
        {/* Tooltip for collapsed sidebar */}
        {collapsed && !isActive && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
            {item.label}
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-r-4 border-l-0 border-transparent border-r-gray-800"></div>
          </div>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && <ComingSoonToast label={toast.label} onClose={() => setToast(null)} />}

      {/* Desktop Side Panel */}
      <aside 
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          roleStyles.sidebarBg,
          roleStyles.sidebarText,
          "shadow-xl"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b",
          roleStyles.sidebarBorder
        )}>
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                roleStyles.sidebarIconBg,
                roleStyles.iconColor
              )}>
                {getRoleIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-sm">{userProfile.name || 'User'}</p>
                <p className="text-xs opacity-90 truncate capitalize">{userProfile.role || 'user'}</p>
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center mx-auto",
              roleStyles.sidebarIconBg,
              roleStyles.iconColor
            )}>
              {getRoleIcon()}
            </div>
          )}
          
          {/* Toggle Button */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className={cn(
                "p-2 rounded-lg transition-colors",
                roleStyles.sidebarHoverBg,
                collapsed ? "mx-auto" : ""
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navigationItems.map((item) => renderNavItem(item))}
          </div>
          
          {/* Development Status */}
          {!collapsed && (
            <div className="mt-6 px-3">
              <div className="text-xs font-medium uppercase tracking-wider opacity-60 mb-2">
                Development Status
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg p-2">
                  <span className="opacity-75">Available Features</span>
                  <span className="font-bold text-green-400">
                    {navigationItems.filter(item => item.available).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs bg-white/5 rounded-lg p-2">
                  <span className="opacity-75">Coming Soon</span>
                  <span className="font-bold text-amber-400">
                    {navigationItems.filter(item => !item.available).length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 space-y-3">
          {/* User Info */}
          <div className={cn(
            "flex items-center p-2 rounded-lg",
            collapsed ? "justify-center" : "justify-start space-x-3",
            "bg-white/5"
          )}>
            <div className="relative">
              <div className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center text-white font-bold",
                roleStyles.sidebarIconBg
              )}>
                {userProfile.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-500"></div>
            </div>
            
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{userProfile.name || 'User'}</p>
                <p className="text-xs opacity-75 truncate">{userProfile.email}</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center rounded-lg px-3 py-2.5 font-medium transition-colors",
              collapsed ? "justify-center" : "justify-start space-x-3",
              "bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="flex-1 text-left text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex items-center justify-around px-2 py-2">
            {mobileNavItems.map((item) => renderNavItem(item, true))}
            
            {/* Mobile Menu Button */}
            <div ref={dropdownRef} className="relative flex-1">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-full",
                  mobileOpen ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                )}
                aria-label="More menu options"
              >
                <div className={cn(
                  "p-2 rounded-full transition-colors",
                  mobileOpen ? "bg-blue-50" : "bg-gray-50 hover:bg-gray-100"
                )}>
                  {mobileOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">More</span>
              </button>

              {/* Dropdown Menu */}
              {mobileOpen && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 mb-2 w-64 rounded-lg bg-white shadow-xl border border-gray-200 py-2 max-h-[calc(100vh-120px)] overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userProfile.name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{userProfile.role || 'user'}</p>
                  </div>
                  
                  <div className="py-2">
                    {navigationItems.map((item) => {
                      const isActive = activeTab === item.id;
                      const isPending = !item.available;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => isPending ? showComingSoonToast(item.label) : handleNavigation(item.path, item.id, item.available, item.label)}
                          className={cn(
                            "w-full flex items-center px-4 py-3 text-left transition-colors",
                            isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50",
                            isPending ? "opacity-50 cursor-not-allowed" : ""
                          )}
                        >
                          <div className="mr-3 relative">
                            {item.icon}
                            {isPending && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center">
                                <Lock className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          {isPending && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                              Soon
                            </span>
                          )}
                          {item.badge && (
                            <span className="ml-2 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center text-white font-bold">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Spacer */}
      <div className={cn(
        "hidden lg:block",
        collapsed ? "w-16" : "w-64",
        "transition-all duration-300"
      )} />

      {/* Add custom CSS for progress animation */}
      <style jsx global>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 4s linear forwards;
        }
      `}</style>
    </>
  );
}