// app/components/layout/RootDashboardLayout.tsx
"use client";

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import RoleSidePanel from './RoleSidePanel';
import DashboardHeader from '@/app/components/layout/DashBoardHeader';
import {
  Home,
  Shield,
  Stethoscope,
  Heart,
  Users,
  Baby,
  Calendar,
  FileText,
  ClipboardList,
  Pill,
  Syringe,
  TrendingUp,
  Database,
  BarChart3,
  AlertCircle,
  Activity,
  Bell,
  File,
  HelpCircle,
  Building
} from 'lucide-react';

interface RootDashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  showBreadcrumb?: boolean;
  headerActions?: ReactNode;
  className?: string;
  contentClassName?: string;
  fullWidth?: boolean;
  hideSidebar?: boolean;
  backButtonFallback?: string;
}

const routeMapping: Record<string, { label: string; icon?: React.ReactNode }> = {
  'dashboard': { label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  'admin': { label: 'Admin', icon: <Shield className="h-4 w-4" /> },
  'clinicians': { label: 'Clinicians', icon: <Stethoscope className="h-4 w-4" /> },
  'clinician': { label: 'Clinician', icon: <Stethoscope className="h-4 w-4" /> },
  'guardian': { label: 'Guardian', icon: <Heart className="h-4 w-4" /> },
  'users': { label: 'Users', icon: <Users className="h-4 w-4" /> },
  'user': { label: 'User', icon: <Users className="h-4 w-4" /> },
  'patients': { label: 'Patients', icon: <Users className="h-4 w-4" /> },
  'patient': { label: 'Patient', icon: <Users className="h-4 w-4" /> },
  'children': { label: 'Children', icon: <Baby className="h-4 w-4" /> },
  'child': { label: 'Child', icon: <Baby className="h-4 w-4" /> },
  'appointments': { label: 'Appointments', icon: <Calendar className="h-4 w-4" /> },
  'appointment': { label: 'Appointment', icon: <Calendar className="h-4 w-4" /> },
  'records': { label: 'Records', icon: <FileText className="h-4 w-4" /> },
  'medical-records': { label: 'Medical Records', icon: <ClipboardList className="h-4 w-4" /> },
  'health-records': { label: 'Health Records', icon: <FileText className="h-4 w-4" /> },
  'prescriptions': { label: 'Prescriptions', icon: <Pill className="h-4 w-4" /> },
  'vaccinations': { label: 'Vaccinations', icon: <Syringe className="h-4 w-4" /> },
  'vaccination': { label: 'Vaccination', icon: <Syringe className="h-4 w-4" /> },
  'growth': { label: 'Growth Charts', icon: <TrendingUp className="h-4 w-4" /> },
  'analytics': { label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  'reports': { label: 'Reports', icon: <Database className="h-4 w-4" /> },
  'report': { label: 'Report', icon: <Database className="h-4 w-4" /> },
  'settings': { label: 'Settings', icon: <Shield className="h-4 w-4" /> },
  'system': { label: 'System', icon: <Shield className="h-4 w-4" /> },
  'clinics': { label: 'Clinics', icon: <Building className="h-4 w-4" /> },
  'clinic': { label: 'Clinic', icon: <Building className="h-4 w-4" /> },
  'audit': { label: 'Audit Logs', icon: <FileText className="h-4 w-4" /> },
  'activity': { label: 'Activity', icon: <Activity className="h-4 w-4" /> },
  'notifications': { label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  'alerts': { label: 'Alerts', icon: <AlertCircle className="h-4 w-4" /> },
  'alert': { label: 'Alert', icon: <AlertCircle className="h-4 w-4" /> },
  'profile': { label: 'Profile', icon: <Users className="h-4 w-4" /> },
  'details': { label: 'Details', icon: <File className="h-4 w-4" /> },
  'manage': { label: 'Manage', icon: <Shield className="h-4 w-4" /> },
  'overview': { label: 'Overview', icon: <Activity className="h-4 w-4" /> },
  'statistics': { label: 'Statistics', icon: <BarChart3 className="h-4 w-4" /> },
  'logs': { label: 'Logs', icon: <FileText className="h-4 w-4" /> },
  'help': { label: 'Help', icon: <HelpCircle className="h-4 w-4" /> },
  'support': { label: 'Support', icon: <HelpCircle className="h-4 w-4" /> },
  'create': { label: 'Create', icon: <File className="h-4 w-4" /> },
  'edit': { label: 'Edit', icon: <File className="h-4 w-4" /> },
  'new': { label: 'New', icon: <File className="h-4 w-4" /> },
};

const generateBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(segment => segment !== '');
  const breadcrumbs = [];
  let currentPath = '';
  
  breadcrumbs.push({
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="h-4 w-4" />,
    isLast: segments.length === 0
  });
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    if (i === 0 && segment === 'dashboard') continue;
    
    const isDynamicParam = segment.startsWith('[') && segment.endsWith(']') || 
                          /^\d+$/.test(segment) || 
                          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
    
    let label = segment;
    let icon = undefined;
    
    if (isDynamicParam) {
      label = 'Details';
      icon = <File className="h-4 w-4" />;
    } else {
      const routeInfo = routeMapping[segment];
      if (routeInfo) {
        label = routeInfo.label;
        icon = routeInfo.icon;
      } else {
        label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    breadcrumbs.push({
      label,
      href: i === segments.length - 1 ? undefined : currentPath,
      icon,
      isLast: i === segments.length - 1
    });
  }
  
  return breadcrumbs;
};

const shouldShowBackButtonAuto = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length <= 2) return false;
  
  const lastSegment = segments[segments.length - 1];
  const isDetailPage = 
    /^\d+$/.test(lastSegment) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment) ||
    ['create', 'edit', 'view', 'details', 'new'].includes(lastSegment) ||
    segments.includes('create') ||
    segments.includes('edit') ||
    segments.includes('view') ||
    segments.includes('new');
  
  if (isDetailPage) return true;
  
  return segments.length > 2;
};

const getFallbackPath = (pathname: string, userRole?: string) => {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length >= 3) {
    return '/' + segments.slice(0, -1).join('/');
  }
  
  return `/dashboard/${userRole || 'admin'}`;
};

export default function RootDashboardLayout({
  children,
  title,
  subtitle,
  showBackButton,
  showSearch = true,
  showBreadcrumb = true,
  headerActions,
  className = '',
  contentClassName = '',
  fullWidth = false,
  hideSidebar = false,
  backButtonFallback
}: RootDashboardLayoutProps) {
  const { userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [hasHistory, setHasHistory] = useState(false);
  const breadcrumbs = generateBreadcrumbs(pathname);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasHistory(window.history.length > 1);
    }
  }, [pathname]);
  
  const autoShowBackButton = shouldShowBackButtonAuto(pathname);
  const shouldShowBack = showBackButton !== undefined ? showBackButton : autoShowBackButton;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };
  
  const handleBack = () => {
    const fallback = backButtonFallback || getFallbackPath(pathname, userProfile?.role);
    
    if (hasHistory) {
      router.back();
    } else {
      router.push(fallback);
    }
  };
  
  const getPageTitle = () => {
    if (title) return title;
    
    if (breadcrumbs.length > 0) {
      const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
      if (lastCrumb && lastCrumb.label !== 'Dashboard') {
        return lastCrumb.label;
      }
    }
    
    return 'Dashboard';
  };
  
  const getPageSubtitle = () => {
    if (subtitle) return subtitle;
    
    if (pathname === '/dashboard') {
      switch (userProfile?.role) {
        case 'admin': return 'System Administration Dashboard';
        case 'clinician': return 'Patient Care Dashboard';
        case 'guardian': return 'Family Health Dashboard';
        default: return 'Healthcare Dashboard';
      }
    }
    
    return undefined;
  };

  const showBackIndicator = shouldShowBack;

  return (
    <div className={cn("min-h-screen bg-gray-50 flex", className)}>
      {!hideSidebar && <RoleSidePanel />}
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader
          showSearch={showSearch}
          showBackButton={showBackIndicator}
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          headerActions={headerActions}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
          onBack={handleBack}
        />
        
        <main className={cn(
          "flex-1",
          fullWidth ? "" : "max-w-7xl mx-auto w-full",
          "p-4 sm:p-6 lg:p-8",
          contentClassName
        )}>
          {children}
        </main>
        
        {!fullWidth && (
          <footer className="border-t border-gray-200 bg-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <p className="text-sm text-gray-600">
                  © {new Date().getFullYear()} HealthCare Pro. All rights reserved.
                </p>
                <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                  <button 
                    onClick={() => router.push('/privacy')}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Privacy
                  </button>
                  <button 
                    onClick={() => router.push('/terms')}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Terms
                  </button>
                  <button 
                    onClick={() => router.push('/help')}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Help
                  </button>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}