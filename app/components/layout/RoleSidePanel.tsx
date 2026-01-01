// app/components/layout/RoleSidePanel.tsx - UPDATED WITH PLAIN PROFESSIONAL COLORS
"use client";

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import {
  Home,
  Users,
  UserPlus,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  Bell,
  HelpCircle,
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
  UserCircle,
  Database,
  AlertCircle,
  Zap,
  Compass,
  Layers,
  Target,
  Clock,
  Award,
  User
} from 'lucide-react';

export default function RoleSidePanel() {
  const { userProfile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!userProfile) return null;

  // Professional, plain color schemes for each role
  const getRoleStyles = () => {
    switch (userProfile.role) {
      case 'admin':
        return {
          // Cool slate blue - Professional & Commanding
          bgColor: 'bg-slate-50',
          sidebarBg: 'bg-slate-800',
          textColor: 'text-slate-800',
          sidebarText: 'text-slate-100',
          borderColor: 'border-slate-300',
          sidebarBorder: 'border-slate-700',
          hoverBg: 'hover:bg-slate-100',
          sidebarHoverBg: 'hover:bg-slate-700',
          activeBg: 'bg-slate-200',
          sidebarActiveBg: 'bg-slate-600',
          accentColor: 'text-blue-600',
          sidebarAccentColor: 'text-blue-300',
          iconBg: 'bg-blue-100',
          sidebarIconBg: 'bg-blue-800',
          badgeColor: 'bg-blue-500',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          logoColor: 'text-blue-600'
        };
      case 'clinician':
        return {
          // Clean teal - Medical & Trustworthy
          bgColor: 'bg-teal-50',
          sidebarBg: 'bg-teal-800',
          textColor: 'text-teal-900',
          sidebarText: 'text-teal-50',
          borderColor: 'border-teal-300',
          sidebarBorder: 'border-teal-700',
          hoverBg: 'hover:bg-teal-100',
          sidebarHoverBg: 'hover:bg-teal-700',
          activeBg: 'bg-teal-200',
          sidebarActiveBg: 'bg-teal-600',
          accentColor: 'text-teal-600',
          sidebarAccentColor: 'text-teal-300',
          iconBg: 'bg-teal-100',
          sidebarIconBg: 'bg-teal-800',
          badgeColor: 'bg-teal-500',
          buttonColor: 'bg-teal-600 hover:bg-teal-700',
          logoColor: 'text-teal-600'
        };
      case 'guardian':
        return {
          // Crystal clear sky blue - Caring & Protective
          bgColor: 'bg-sky-50',
          sidebarBg: 'bg-sky-800',
          textColor: 'text-sky-900',
          sidebarText: 'text-sky-50',
          borderColor: 'border-sky-300',
          sidebarBorder: 'border-sky-700',
          hoverBg: 'hover:bg-sky-100',
          sidebarHoverBg: 'hover:bg-sky-700',
          activeBg: 'bg-sky-200',
          sidebarActiveBg: 'bg-sky-600',
          accentColor: 'text-sky-600',
          sidebarAccentColor: 'text-sky-300',
          iconBg: 'bg-sky-100',
          sidebarIconBg: 'bg-sky-800',
          badgeColor: 'bg-sky-500',
          buttonColor: 'bg-sky-600 hover:bg-sky-700',
          logoColor: 'text-sky-600'
        };
      default:
        return {
          // Neutral professional scheme
          bgColor: 'bg-gray-50',
          sidebarBg: 'bg-gray-800',
          textColor: 'text-gray-900',
          sidebarText: 'text-gray-100',
          borderColor: 'border-gray-300',
          sidebarBorder: 'border-gray-700',
          hoverBg: 'hover:bg-gray-100',
          sidebarHoverBg: 'hover:bg-gray-700',
          activeBg: 'bg-gray-200',
          sidebarActiveBg: 'bg-gray-600',
          accentColor: 'text-gray-600',
          sidebarAccentColor: 'text-gray-300',
          iconBg: 'bg-gray-100',
          sidebarIconBg: 'bg-gray-800',
          badgeColor: 'bg-gray-500',
          buttonColor: 'bg-gray-600 hover:bg-gray-700',
          logoColor: 'text-gray-600'
        };
    }
  };

  const roleStyles = getRoleStyles();

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <Compass className="h-5 w-5" />,
        path: '/dashboard',
        roles: ['guardian', 'clinician', 'admin']
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: <Bell className="h-5 w-5" />,
        path: '/dashboard/notifications',
        badge: 3,
        roles: ['guardian', 'clinician', 'admin']
      },
      {
        id: 'activity',
        label: 'Activity',
        icon: <Activity className="h-5 w-5" />,
        path: '/dashboard/activity',
        roles: ['guardian', 'clinician', 'admin']
      }
    ];

    // Guardian-specific items
    if (userProfile.role === 'guardian') {
      return [
        ...baseItems,
        {
          id: 'children',
          label: 'My Children',
          icon: <Baby className="h-5 w-5" />,
          path: '/dashboard/guardian/children',
          roles: ['guardian']
        },
        {
          id: 'appointments',
          label: 'Appointments',
          icon: <Calendar className="h-5 w-5" />,
          path: '/dashboard/guardian/appointments',
          roles: ['guardian']
        },
        {
          id: 'growth',
          label: 'Growth Charts',
          icon: <TrendingUp className="h-5 w-5" />,
          path: '/dashboard/guardian/growth',
          roles: ['guardian']
        },
        {
          id: 'vaccinations',
          label: 'Vaccinations',
          icon: <Syringe className="h-5 w-5" />,
          path: '/dashboard/guardian/vaccinations',
          roles: ['guardian']
        },
        {
          id: 'health-records',
          label: 'Health Records',
          icon: <FileText className="h-5 w-5" />,
          path: '/dashboard/guardian/records',
          roles: ['guardian']
        }
      ];
    }

    // Clinician-specific items
    if (userProfile.role === 'clinician') {
      return [
        ...baseItems,
        {
          id: 'patients',
          label: 'My Patients',
          icon: <Users className="h-5 w-5" />,
          path: '/dashboard/clinicians/children',
          roles: ['clinician']
        },
        {
          id: 'appointments',
          label: 'Appointments',
          icon: <Calendar className="h-5 w-5" />,
          path: '/dashboard/clinicians/appointments',
          roles: ['clinician']
        },
        {
          id: 'medical-records',
          label: 'Medical Records',
          icon: <ClipboardList className="h-5 w-5" />,
          path: '/dashboard/clinicians/medical-records',
          roles: ['clinician']
        },
        {
          id: 'prescriptions',
          label: 'Prescriptions',
          icon: <Pill className="h-5 w-5" />,
          path: '/dashboard/clinicians/prescriptions',
          roles: ['clinician']
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: <BarChart3 className="h-5 w-5" />,
          path: '/dashboard/clinicians/analytics',
          roles: ['clinician']
        }
      ];
    }

    // Admin-specific items
    if (userProfile.role === 'admin') {
      return [
        ...baseItems,
        {
          id: 'users',
          label: 'Users',
          icon: <User className="h-5 w-5" />,
          path: '/dashboard/admin/users',
          roles: ['admin']
        },
        {
          id: 'system',
          label: 'System Settings',
          icon: <Settings className="h-5 w-5" />,
          path: '/dashboard/admin/users/system',
          roles: ['admin']
        },
        {
          id: 'audit',
          label: 'Audit Logs',
          icon: <Shield className="h-5 w-5" />,
          path: '/dashboard/admin/users/audit',
          roles: ['admin']
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: <Database className="h-5 w-5" />,
          path: '/dashboard/admin/users/reports',
          roles: ['admin']
        }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();
  const activeItem = navigationItems.find(item => pathname.startsWith(item.path))?.id;

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/';
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Side Panel */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 transform",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          roleStyles.sidebarBg,
          roleStyles.sidebarText,
          "shadow-lg"
        )}
      >
        {/* Header with Logo */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b",
          roleStyles.sidebarBorder
        )}>
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center",
                roleStyles.sidebarIconBg
              )}>
                {userProfile.role === 'admin' && (
                  <Shield className="h-5 w-5 text-white" />
                )}
                {userProfile.role === 'clinician' && (
                  <Stethoscope className="h-5 w-5 text-white" />
                )}
                {userProfile.role === 'guardian' && (
                  <Heart className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold truncate text-sm">{userProfile.name}</p>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded font-medium",
                    "bg-white/20"
                  )}>
                    {userProfile.role.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs opacity-90 truncate">{userProfile.email}</p>
              </div>
            </div>
          )}
          
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className={cn(
              "p-2 rounded-lg transition-colors",
              roleStyles.sidebarHoverBg
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.path);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center rounded-lg px-3 py-2.5 font-medium transition-colors duration-200",
                    collapsed ? "justify-center" : "justify-start space-x-3",
                    isActive ? roleStyles.sidebarActiveBg : roleStyles.sidebarHoverBg
                  )}
                >
                  <div className="relative">
                    <div className={cn(
                      "p-1.5 rounded-md",
                      isActive ? "bg-white/20" : ""
                    )}>
                      {item.icon}
                    </div>
                    {item.badge && !collapsed && (
                      <span className={cn(
                        "absolute -top-1 -right-1 h-2 w-2 rounded-full",
                        roleStyles.badgeColor
                      )} />
                    )}
                  </div>
                  
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded font-semibold",
                          roleStyles.badgeColor
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 space-y-3">
          {/* Quick Actions */}
          {!collapsed && (
            <div className="mb-3">
              <p className="text-xs font-medium uppercase tracking-wider opacity-60 mb-2">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => router.push('/dashboard/settings')}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium"
                >
                  <Settings className="h-3 w-3 mx-auto mb-1" />
                  Settings
                </button>
                <button
                  onClick={() => router.push('/dashboard/help')}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium"
                >
                  <HelpCircle className="h-3 w-3 mx-auto mb-1" />
                  Help
                </button>
              </div>
            </div>
          )}

          {/* User Status */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
            <div className="relative">
              <div className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center text-white font-bold",
                roleStyles.sidebarIconBg
              )}>
                {userProfile.name?.charAt(0) || 'U'}
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2",
                roleStyles.sidebarBg,
                userProfile.isActive ? "bg-green-500" : "bg-gray-500"
              )} />
            </div>
            
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{userProfile.name}</p>
                <div className="flex items-center space-x-1">
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    userProfile.isActive ? "bg-green-500" : "bg-gray-500"
                  )} />
                  <p className="text-xs opacity-75">
                    {userProfile.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={cn(
                "p-2 rounded-lg transition-colors",
                collapsed ? "ml-auto" : "",
                "bg-red-600 hover:bg-red-700"
              )}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Copyright */}
          {!collapsed && (
            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-center opacity-50">
                © {new Date().getFullYear()} HealthCare Pro
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-3 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 group"
      >
        <Menu className="h-6 w-6 text-gray-700 group-hover:text-gray-900" />
      </button>

      {/* Main content offset for sidebar */}
      <div className={cn(
        "transition-all duration-300",
        collapsed ? "lg:pl-20" : "lg:pl-64"
      )} />
    </>
  );
}