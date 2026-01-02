// /app/components/layout/DashboardHeader.tsx
"use client";

import { useAuth } from '@/app/context/AuthContext';
import { Bell, Search, User, Settings, HelpCircle, Menu } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  hasSidePanel?: boolean;
  onMenuClick?: () => void;
}

export default function DashboardHeader({ 
  title, 
  subtitle, 
  actions,
  hasSidePanel = true,
  onMenuClick 
}: DashboardHeaderProps) {
  const { userProfile } = useAuth();

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
          badge: 'bg-amber-500',
          searchBg: 'bg-teal-50',
          searchBorder: 'border-teal-200'
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
          badge: 'bg-cyan-500',
          searchBg: 'bg-blue-50',
          searchBorder: 'border-blue-200'
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
          badge: 'bg-emerald-500',
          searchBg: 'bg-sky-50',
          searchBorder: 'border-sky-200'
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
          searchBorder: 'border-gray-200'
        };
    }
  };

  const colors = getRoleColors();

  return (
    <header 
      className={cn(
        "bg-white shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-white/95",
        colors.border,
        "fixed top-0 z-40 border-b",
        hasSidePanel ? "left-0 lg:left-64" : "left-0",
        "right-0 transition-all duration-300"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side: Title and Menu (for mobile) */}
        <div className="flex items-center flex-1 min-w-0">
          {/* Mobile Menu Button */}
          {hasSidePanel && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden mr-3 p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h1 className={cn("text-lg sm:text-xl font-semibold truncate", colors.text)}>
              {title}
            </h1>
            {subtitle && (
              <p className={cn("text-xs sm:text-sm mt-0.5 truncate", colors.subtitle)}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side: Actions and User */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search (desktop) */}
          <div className={cn(
            "hidden md:flex items-center rounded-lg px-3 py-1.5 border",
            colors.searchBg,
            colors.searchBorder
          )}>
            <Search className={cn("h-4 w-4 mr-2 flex-shrink-0", colors.icon)} />
            <input
              type="text"
              placeholder="Search patients, records..."
              className="bg-transparent outline-none text-sm w-32 lg:w-48 placeholder-gray-500"
            />
            <kbd className="hidden lg:inline-flex ml-2 text-xs text-gray-500 border border-gray-300 rounded px-1.5">
              ⌘K
            </kbd>
          </div>

          {/* Notification Bell */}
          <button className={cn(
            "relative p-2 rounded-lg transition-colors",
            colors.hover
          )}>
            <Bell className={cn("h-5 w-5", colors.icon)} />
            <span className={cn(
              "absolute top-1.5 right-1.5 h-2 w-2 rounded-full animate-pulse",
              colors.badge
            )} />
          </button>

          {/* Quick Actions Menu (desktop) */}
          <div className="hidden lg:flex items-center space-x-1">
            <button className={cn(
              "p-2 rounded-lg transition-colors",
              colors.hover,
              colors.icon
            )}>
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className={cn(
              "p-2 rounded-lg transition-colors",
              colors.hover,
              colors.icon
            )}>
              <Settings className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-2 border-l border-gray-200">
            {/* User Info (desktop) */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                {userProfile?.role === 'clinician' ? `Dr. ${userProfile?.name?.split(' ')[0]}` : userProfile?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userProfile?.role === 'clinician' ? 'Pediatrician' : userProfile?.role}
              </p>
            </div>

            {/* Avatar with Status */}
            <div className="relative">
              <div className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center",
                colors.avatarBg
              )}>
                <span className={cn("font-medium text-sm", colors.avatarText)}>
                  {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className={cn(
                "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",
                colors.badge
              )} />
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