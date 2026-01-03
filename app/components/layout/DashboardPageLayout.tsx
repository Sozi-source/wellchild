// app/components/layout/DashboardPageLayout.tsx - Fixed
"use client";

import { ReactNode } from 'react';
import RoleSidePanel from './RoleSidePanel';
import DashboardHeader from '@/app/components/layout/DashBoardHeader';
import { cn } from '@/app/lib/utils';

interface DashboardPageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  showHeader?: boolean;
  showSidePanel?: boolean;
  onBack?: () => void;
  headerActions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function DashboardPageLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  showSearch = false,
  showHeader = true,
  showSidePanel = true,
  onBack,
  headerActions,
  className = '',
  contentClassName = ''
}: DashboardPageLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50 flex", className)}>
      {/* Fixed Side Panel */}
      {showSidePanel && (
        <div className="fixed inset-y-0 left-0 z-40">
          <RoleSidePanel />
        </div>
      )}
      
      {/* Main Content Wrapper */}
      <div className={cn(
        "flex-1 flex flex-col",
        showSidePanel ? "lg:ml-64" : ""
      )}>
        {/* Fixed Header */}
        {showHeader && (
          <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
              <DashboardHeader
                title={title}
                subtitle={subtitle}
                showBackButton={showBackButton}
                showSearch={showSearch}
                onBack={onBack}
              />
              
              {headerActions && (
                <div className="flex items-center space-x-3 ml-4">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Scrollable Content */}
        <div className={cn(
          "flex-1 overflow-y-auto",
          contentClassName
        )}>
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}