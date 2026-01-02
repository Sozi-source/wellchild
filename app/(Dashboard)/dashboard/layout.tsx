// /app/components/layout/DashboardLayout.tsx
"use client";

import { ReactNode, useState } from 'react';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import RoleSidePanel from '@/app/components/layout/RoleSidePanel';
import DashboardHeader from '@/app/components/layout/DashBoardHeader';
import { cn } from '@/app/lib/utils';

type UserRole = 'guardian' | 'clinician' | 'admin';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showSidePanel?: boolean;
  headerActions?: ReactNode;
  mb?: number | string; // Margin-bottom support
  className?: string;
  contentClassName?: string;
  fullWidth?: boolean;
}

export default function DashboardLayout({ 
  children,
  title = 'Dashboard',
  subtitle,
  showHeader = true,
  showSidePanel = true,
  headerActions,
  mb = 0, // Default no margin
  className = '',
  contentClassName = '',
  fullWidth = false
}: DashboardLayoutProps) {
  const allowedRoles: UserRole[] = ['guardian', 'clinician', 'admin'];
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const getMarginBottom = () => {
    if (typeof mb === 'number') {
      return `${mb * 0.25}rem`; // Convert number to rem (1 = 0.25rem)
    }
    if (typeof mb === 'string' && mb.startsWith('mb-')) {
      return ''; // Tailwind class will be applied via className
    }
    return mb; // CSS string value
  };

  const marginBottomStyle = getMarginBottom();
  const isTailwindMb = typeof mb === 'string' && mb.startsWith('mb-');

  return (
    <RoleProtectedLayout allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-gray-50">
        {/* Side Panel */}
        {showSidePanel && (
          <>
            <div className={cn(
              "hidden lg:block fixed inset-y-0 left-0 z-30 w-64",
              "bg-white border-r border-gray-200 overflow-y-auto"
            )}>
              <RoleSidePanel />
            </div>
            
            {/* Mobile Side Panel Overlay */}
            {isSidePanelOpen && (
              <div className="lg:hidden">
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setIsSidePanelOpen(false)}
                />
                <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white">
                  <RoleSidePanel onClose={() => setIsSidePanelOpen(false)} />
                </div>
              </div>
            )}
          </>
        )}

        <div className={cn(
          showSidePanel ? 'lg:pl-64' : '',
          "transition-all duration-300"
        )}>
          {/* Header */}
          {showHeader && (
            <div className={cn(
              !isTailwindMb && "mb-0", // Default no margin if not using Tailwind class
              className
            )}>
              <DashboardHeader 
                title={title}
                subtitle={subtitle}
                actions={headerActions}
                hasSidePanel={showSidePanel}
                onMenuClick={() => setIsSidePanelOpen(true)}
              />
            </div>
          )}

          {/* Main Content */}
          <main 
            className={cn(
              "pt-16", // Padding for fixed header (h-16 = 4rem)
              fullWidth ? 'px-0' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
              contentClassName
            )}
            style={!isTailwindMb ? { marginTop: showHeader ? marginBottomStyle : '0' } : undefined}
          >
            <div className={cn(
              !fullWidth && 'py-6',
              isTailwindMb ? mb : '' // Apply Tailwind mb class if provided
            )}>
              {children}
            </div>
          </main>

          {/* Footer */}
          {!fullWidth && (
            <footer className="mt-8 border-t bg-white">
              <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-600">
                <p>© {new Date().getFullYear()} WellChild Monitor. All rights reserved.</p>
              </div>
            </footer>
          )}
        </div>
      </div>
    </RoleProtectedLayout>
  );
}