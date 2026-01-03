// app/components/layout/Breadcrumb.tsx
"use client";

import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

// Route mapping configuration
const routeMapping: Record<string, { label: string; icon?: React.ReactNode }> = {
  'dashboard': { label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  'admin': { label: 'Admin' },
  'clinicians': { label: 'Clinician' },
  'guardian': { label: 'Guardian' },
  'users': { label: 'Users' },
  'patients': { label: 'Patients' },
  'children': { label: 'Children' },
  'appointments': { label: 'Appointments' },
  'growth': { label: 'Growth Charts' },
  'vaccinations': { label: 'Vaccinations' },
  'records': { label: 'Health Records' },
  'settings': { label: 'Settings' },
  'reports': { label: 'Reports' },
  'analytics': { label: 'Analytics' },
  'medical-records': { label: 'Medical Records' },
  'prescriptions': { label: 'Prescriptions' },
  'notifications': { label: 'Notifications' },
  'activity': { label: 'Activity' },
  'clinic': { label: 'Clinic Management' },
  'system': { label: 'System' },
  'audit': { label: 'Audit Logs' },
};

// Custom breadcrumb titles for specific pages
const customTitles: Record<string, string> = {
  '/dashboard/admin/users/create': 'Create User',
  '/dashboard/admin/users/edit': 'Edit User',
  '/dashboard/clinicians/children/[id]': 'Patient Details',
  '/dashboard/guardian/children/[id]': 'Child Details',
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const router = useRouter();

  // Skip breadcrumb for main dashboard
  if (pathname === '/dashboard') {
    return null;
  }

  // Generate breadcrumb items from path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(segment => segment !== '');
    
    // Start with dashboard
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <Home className="h-4 w-4" />
      }
    ];

    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Check for custom title first
      const customTitle = Object.keys(customTitles).find(pattern => {
        if (pattern.includes('[id]')) {
          const regexPattern = pattern.replace('[id]', '[^/]+');
          return new RegExp(`^${regexPattern}$`).test(pathname);
        }
        return pattern === pathname;
      });
      
      if (customTitle) {
        breadcrumbs.push({
          label: customTitles[customTitle],
          href: index === segments.length - 1 ? undefined : currentPath
        });
        return;
      }

      // Use route mapping or capitalize segment
      const routeInfo = routeMapping[segment] || { 
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      };
      
      breadcrumbs.push({
        label: routeInfo.label,
        href: index === segments.length - 1 ? undefined : currentPath,
        icon: routeInfo.icon
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
    <nav className="flex items-center space-x-2 text-sm mb-4 sm:mb-6">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.label} className="flex items-center space-x-2">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}
          
          {crumb.href ? (
            <button
              onClick={() => handleNavigate(crumb.href!)}
              className={cn(
                "flex items-center space-x-1 text-gray-600 hover:text-gray-900",
                "transition-colors duration-200 font-medium",
                "px-2 py-1 rounded-md hover:bg-gray-100"
              )}
            >
              {crumb.icon && <span className="flex-shrink-0">{crumb.icon}</span>}
              <span className="truncate max-w-[120px] sm:max-w-[200px]">
                {crumb.label}
              </span>
            </button>
          ) : (
            <div className="flex items-center space-x-1 text-gray-900 px-2 py-1">
              {crumb.icon && <span className="flex-shrink-0">{crumb.icon}</span>}
              <span className="truncate max-w-[120px] sm:max-w-[200px] font-semibold">
                {crumb.label}
              </span>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}