"use client";

import { ReactNode } from 'react';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import RoleSidePanel from '@/app/components/layout/RoleSidePanel';
import DashboardHeader from '@/app/components/layout/DashBoardHeader'

type UserRole = 'guardian' | 'clinician' | 'admin';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showSidePanel?: boolean;
  headerActions?: ReactNode;
}

export default function DashboardLayout({ 
  children,
  title = 'Dashboard',
  subtitle,
  showHeader = true,
  showSidePanel = true,
  headerActions
}: DashboardLayoutProps) {
  const allowedRoles: UserRole[] = ['guardian', 'clinician', 'admin'];
  
  return (
    <RoleProtectedLayout allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-gray-50">
        {showSidePanel && <RoleSidePanel />}
        
        <div className={showSidePanel ? 'lg:pl-64' : ''}>
          {showHeader && (
            <DashboardHeader 
              title={title}
              subtitle={subtitle}
              actions={headerActions}
            />
          )}
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          
          {/* Optional Footer */}
          <footer className="mt-8 border-t bg-white">
            <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-600">
              <p>© {new Date().getFullYear()} WellChild Monitor. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    </RoleProtectedLayout>
  );
}