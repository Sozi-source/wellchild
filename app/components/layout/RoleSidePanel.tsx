// app/components/layout/RoleSidePanel.tsx
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
  Syringe
} from 'lucide-react';

export default function RoleSidePanel() {
  const { userProfile, logout} = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!userProfile) return null;

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <Home className="h-5 w-5" />,
        path: `/dashboard/${userProfile.role}`,
        roles: ['guardian', 'clinician', 'admin']
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: <Bell className="h-5 w-5" />,
        path: `/dashboard/${userProfile.role}/notifications`,
        badge: 3,
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
          path: '/dashbpard/guardian/records',
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
          path: '/dashboard/clinician/patients',
          roles: ['clinician']
        },
        {
          id: 'appointments',
          label: 'Appointments',
          icon: <Calendar className="h-5 w-5" />,
          path: '/dashboard/clinician/appointments',
          roles: ['clinician']
        },
        {
          id: 'medical-records',
          label: 'Medical Records',
          icon: <ClipboardList className="h-5 w-5" />,
          path: '/dashboard/clinician/medical-records',
          roles: ['clinician']
        },
        {
          id: 'prescriptions',
          label: 'Prescriptions',
          icon: <Pill className="h-5 w-5" />,
          path: '/dashboard/clinician/prescriptions',
          roles: ['clinician']
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: <Activity className="h-5 w-5" />,
          path: '/dashboard/clinician/analytics',
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
          label: 'User Management',
          icon: <Users className="h-5 w-5" />,
          path: '/dashboard/admin/users',
          roles: ['admin']
        },
        // {
        //   id: 'patients',
        //   label: 'All Patients',
        //   icon: <Baby className="h-5 w-5" />,
        //   path: '/dashboard/admin/patients',
        //   roles: ['admin']
        // },
        {
          id: 'clinicians',
          label: 'Clinicians',
          icon: <Stethoscope className="h-5 w-5" />,
          path: '/dashboard/admin/clinicians',
          roles: ['admin']
        },
        {
          id: 'guardians',
          label: 'Guardians',
          icon: <Heart className="h-5 w-5" />,
          path: '/dashboard/admin/guardians',
          roles: ['admin']
        },
        {
          id: 'system',
          label: 'System Settings',
          icon: <Settings className="h-5 w-5" />,
          path: '/dashboard/admin/system',
          roles: ['admin']
        },
        {
          id: 'audit',
          label: 'Audit Logs',
          icon: <Shield className="h-5 w-5" />,
          path: '/admin/audit',
          roles: ['admin']
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: <BarChart3 className="h-5 w-5" />,
          path: '/admin/reports',
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

  // Role-based panel styling
  const getRoleStyles = () => {
    switch (userProfile.role) {
      case 'admin':
        return {
          bgColor: 'bg-purple-900',
          textColor: 'text-purple-100',
          borderColor: 'border-purple-800',
          hoverBg: 'hover:bg-purple-800',
          activeBg: 'bg-purple-700'
        };
      case 'clinician':
        return {
          bgColor: 'bg-green-800',
          textColor: 'text-green-100',
          borderColor: 'border-green-700',
          hoverBg: 'hover:bg-green-700',
          activeBg: 'bg-green-600'
        };
      case 'guardian':
        return {
          bgColor: 'bg-blue-800',
          textColor: 'text-blue-100',
          borderColor: 'border-blue-700',
          hoverBg: 'hover:bg-blue-700',
          activeBg: 'bg-blue-600'
        };
      default:
        return {
          bgColor: 'bg-gray-800',
          textColor: 'text-gray-100',
          borderColor: 'border-gray-700',
          hoverBg: 'hover:bg-gray-700',
          activeBg: 'bg-gray-600'
        };
    }
  };

  const roleStyles = getRoleStyles();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Side Panel */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 transform",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          roleStyles.bgColor,
          roleStyles.textColor
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b",
          roleStyles.borderColor
        )}>
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                <span className={`font-bold ${
                  userProfile.role === 'admin' ? 'text-purple-800' :
                  userProfile.role === 'clinician' ? 'text-green-800' :
                  'text-blue-800'
                }`}>
                  {userProfile.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{userProfile.name}</p>
                <p className="text-xs opacity-75 capitalize">{userProfile.role}</p>
              </div>
            </div>
          )}
          
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className={cn(
              "p-1 rounded-md",
              roleStyles.hoverBg
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
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
                    "w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    collapsed ? "justify-center" : "justify-start space-x-3",
                    isActive ? roleStyles.activeBg : roleStyles.hoverBg
                  )}
                >
                  <div className="relative">
                    {item.icon}
                    {item.badge && !collapsed && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
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
        <div className={cn(
          "border-t p-4 space-y-2",
          roleStyles.borderColor
        )}>
          {/* Help & Support */}
          <button
            onClick={() => router.push('/help')}
            className={cn(
              "w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              collapsed ? "justify-center" : "justify-start space-x-3",
              roleStyles.hoverBg
            )}
          >
            <HelpCircle className="h-5 w-5" />
            {!collapsed && <span>Help & Support</span>}
          </button>

          {/* Settings */}
          <button
            onClick={() => router.push('/settings')}
            className={cn(
              "w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              collapsed ? "justify-center" : "justify-start space-x-3",
              roleStyles.hoverBg
            )}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span>Settings</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              collapsed ? "justify-center" : "justify-start space-x-3",
              "hover:bg-red-700 hover:text-white"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-white shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Main content offset for sidebar */}
      <div className={cn(
        "transition-all duration-300",
        collapsed ? "lg:pl-20" : "lg:pl-64"
      )} />
    </>
  );
}