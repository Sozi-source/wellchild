"use client";

import { useAuth } from '@/app/context/AuthContext';
import { Bell, Search, User, Settings, HelpCircle } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  hasSidePanel?: boolean;
}

export default function DashboardHeader({ 
  title, 
  subtitle, 
  actions,
  hasSidePanel = true 
}: DashboardHeaderProps) {
  const { userProfile } = useAuth();

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 fixed top-0 z-40 ${
      hasSidePanel ? 'left-0 lg:left-64' : 'left-0'
    } right-0`}>
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side: Title and Breadcrumbs */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>

        {/* Right side: Actions and User */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search (optional) - hidden on mobile */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
            <Search className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-32 lg:w-48 placeholder-gray-500"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                {userProfile?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize truncate">
                {userProfile?.role || 'Role'}
              </p>
            </div>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-medium text-sm">
                {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
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
    </header>
  );
}