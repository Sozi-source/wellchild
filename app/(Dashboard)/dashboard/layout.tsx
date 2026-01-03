// app/(dashboard)/dashboard/layout.tsx
"use client";

import { ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import RoleSidePanel from '@/app/components/layout/RoleSidePanel';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasHistory, setHasHistory] = useState(false);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasHistory(window.history.length > 1);
    }
  }, [pathname]);

  // Auto-detect if we should show back button
  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean);
    
    // Hide back on main dashboard pages
    if (segments.length <= 2) {
      setShowBack(false);
      return;
    }

    // Check if we're on a detail/edit page
    const lastSegment = segments[segments.length - 1];
    const isDetailPage = 
      /^\d+$/.test(lastSegment) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment) ||
      ['create', 'edit', 'view', 'details', 'new'].includes(lastSegment);

    setShowBack(isDetailPage || segments.length > 2);
  }, [pathname]);

  const handleBack = () => {
    if (hasHistory) {
      router.back();
    } else {
      // Go to parent route
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 1) {
        router.push('/' + segments.slice(0, -1).join('/'));
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <RoleSidePanel />
      <div className="flex-1 flex flex-col">
        {/* Simple header with back button */}
        {showBack && (
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          </div>
        )}
        
        {/* Main content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}