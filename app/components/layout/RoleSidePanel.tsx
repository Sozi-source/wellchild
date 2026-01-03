// app/components/layout/RoleSidePanel.tsx - FIXED VERSION
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
  Menu,
  Syringe,
  Database,
  AlertCircle,
  Building,
  Settings as SettingsIcon,
  User,
  Search,
  MessageSquare,
  X,
  ChevronDown
} from 'lucide-react';

export default function RoleSidePanel() {
  const { userProfile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Move function declarations BEFORE useEffect that uses them
  // Get navigation items function
  const getNavigationItems = () => {
    if (!userProfile) return [];
    
    const roleBasePath = `/dashboard/${userProfile.role}`;
    
    const commonItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <Home className="h-5 w-5" />,
        path: roleBasePath,
      },
      {
        id: 'activity',
        label: 'Activity',
        icon: <Activity className="h-5 w-5" />,
        path: `${roleBasePath}/activity`,
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: <Bell className="h-5 w-5" />,
        path: `${roleBasePath}/notifications`,
        badge: 3
      }
    ];

    switch (userProfile.role) {
      case 'guardian':
        return [
          ...commonItems,
          {
            id: 'children',
            label: 'My Children',
            icon: <Baby className="h-5 w-5" />,
            path: '/dashboard/guardian/children',
          },
          {
            id: 'appointments',
            label: 'Appointments',
            icon: <Calendar className="h-5 w-5" />,
            path: '/dashboard/guardian/appointments',
          },
          {
            id: 'growth',
            label: 'Growth Charts',
            icon: <TrendingUp className="h-5 w-5" />,
            path: '/dashboard/guardian/growth',
          },
          {
            id: 'vaccinations',
            label: 'Vaccinations',
            icon: <Syringe className="h-5 w-5" />,
            path: '/dashboard/guardian/vaccinations',
          },
          {
            id: 'records',
            label: 'Health Records',
            icon: <FileText className="h-5 w-5" />,
            path: '/dashboard/guardian/records',
          },
          {
            id: 'messages',
            label: 'Messages',
            icon: <MessageSquare className="h-5 w-5" />,
            path: '/dashboard/guardian/messages',
          }
        ];
      case 'clinician':
        return [
          ...commonItems,
          {
            id: 'patients',
            label: 'My Patients',
            icon: <Users className="h-5 w-5" />,
            path: '/dashboard/clinician/patients',
          },
          {
            id: 'appointments',
            label: 'Appointments',
            icon: <Calendar className="h-5 w-5" />,
            path: '/dashboard/clinician/appointments',
          },
          {
            id: 'records',
            label: 'Medical Records',
            icon: <ClipboardList className="h-5 w-5" />,
            path: '/dashboard/clinician/records',
          },
          {
            id: 'prescriptions',
            label: 'Prescriptions',
            icon: <Pill className="h-5 w-5" />,
            path: '/dashboard/clinician/prescriptions',
          },
          {
            id: 'analytics',
            label: 'Analytics',
            icon: <BarChart3 className="h-5 w-5" />,
            path: '/dashboard/clinician/analytics',
          },
          {
            id: 'messages',
            label: 'Messages',
            icon: <MessageSquare className="h-5 w-5" />,
            path: '/dashboard/clinician/messages',
          }
        ];
      case 'admin':
        return [
          ...commonItems,
          {
            id: 'users',
            label: 'User Management',
            icon: <Users className="h-5 w-5" />,
            path: '/dashboard/admin/users',
          },
          {
            id: 'clinics',
            label: 'Clinic Management',
            icon: <Building className="h-5 w-5" />,
            path: '/dashboard/admin/clinics',
          },
          {
            id: 'reports',
            label: 'Reports & Analytics',
            icon: <Database className="h-5 w-5" />,
            path: '/dashboard/admin/reports',
          },
          {
            id: 'audit',
            label: 'Audit Logs',
            icon: <AlertCircle className="h-5 w-5" />,
            path: '/dashboard/admin/audit',
          },
          {
            id: 'settings',
            label: 'System Settings',
            icon: <SettingsIcon className="h-5 w-5" />,
            path: '/dashboard/admin/settings',
          }
        ];
      default:
        return commonItems;
    }
  };

  // Mobile bottom navigation items
  const getMobileNavItems = () => {
    if (!userProfile) return [];
    
    const items = [
      {
        id: 'dashboard',
        label: 'Home',
        icon: <Home className="h-5 w-5" />,
        path: `/dashboard/${userProfile.role}`,
      },
      {
        id: 'search',
        label: 'Search',
        icon: <Search className="h-5 w-5" />,
        path: `/dashboard/${userProfile.role}/search`,
      },
    ];

    switch (userProfile.role) {
      case 'guardian':
        return [
          ...items,
          {
            id: 'children',
            label: 'Children',
            icon: <Baby className="h-5 w-5" />,
            path: '/dashboard/guardian/children',
          },
          {
            id: 'appointments',
            label: 'Appointments',
            icon: <Calendar className="h-5 w-5" />,
            path: '/dashboard/guardian/appointments',
          },
          {
            id: 'messages',
            label: 'Messages',
            icon: <MessageSquare className="h-5 w-5" />,
            path: '/dashboard/guardian/messages',
          },
        ];
      case 'clinician':
        return [
          ...items,
          {
            id: 'patients',
            label: 'Patients',
            icon: <Users className="h-5 w-5" />,
            path: '/dashboard/clinician/patients',
          },
          {
            id: 'appointments',
            label: 'Appointments',
            icon: <Calendar className="h-5 w-5" />,
            path: '/dashboard/clinician/appointments',
          },
          {
            id: 'messages',
            label: 'Messages',
            icon: <MessageSquare className="h-5 w-5" />,
            path: '/dashboard/clinician/messages',
          },
        ];
      case 'admin':
        return [
          ...items,
          {
            id: 'users',
            label: 'Users',
            icon: <Users className="h-5 w-5" />,
            path: '/dashboard/admin/users',
          },
          {
            id: 'settings',
            label: 'Settings',
            icon: <SettingsIcon className="h-5 w-5" />,
            path: '/dashboard/admin/settings',
          },
        ];
      default:
        return items;
    }
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
        accentBorder: 'border-gray-500'
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
          accentBorder: 'border-blue-500'
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
          accentBorder: 'border-teal-500'
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
          accentBorder: 'border-sky-500'
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
          accentBorder: 'border-gray-500'
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
  const mobileDropdownItems = getNavigationItems(); // Same as navigationItems
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
    if (!mounted) return;
    
    const currentItem = navigationItems.find(item => 
      pathname === item.path || pathname.startsWith(item.path + '/')
    );
    if (currentItem) {
      setActiveTab(currentItem.id);
    }
  }, [pathname, navigationItems, mounted]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/';
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigation = (path: string, tabId: string) => {
    setActiveTab(tabId);
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Don't render anything during SSR or if no user profile
  if (!mounted || !userProfile) return null;

  return (
    <>
      {/* Desktop Side Panel */}
      <aside 
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 z-50 flex-col transition-all duration-300",
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
            {navigationItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path, item.id)}
                  className={cn(
                    "w-full flex items-center rounded-lg px-3 py-3 font-medium transition-colors duration-200 relative",
                    collapsed ? "justify-center" : "justify-start space-x-3",
                    isActive ? roleStyles.sidebarActiveBg : roleStyles.sidebarHoverBg,
                    "group",
                    isActive ? roleStyles.accentBorder + " border-l-4" : ""
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
                </button>
              );
            })}
          </div>
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
            {mobileNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path, item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                    isActive ? "text-blue-600" : "text-gray-600"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-full transition-colors",
                    isActive ? "bg-blue-50" : "hover:bg-gray-100"
                  )}>
                    {item.icon}
                  </div>
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </button>
              );
            })}
            
            {/* Mobile Menu Button */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                  mobileOpen ? "text-blue-600" : "text-gray-600"
                )}
                aria-label="More menu options"
              >
                <div className={cn(
                  "p-2 rounded-full transition-colors",
                  mobileOpen ? "bg-blue-50" : "hover:bg-gray-100"
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
                    {mobileDropdownItems.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigation(item.path, item.id)}
                          className={cn(
                            "w-full flex items-center px-4 py-3 text-left transition-colors",
                            isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <div className="mr-3">
                            {item.icon}
                          </div>
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
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
    </>
  );
}