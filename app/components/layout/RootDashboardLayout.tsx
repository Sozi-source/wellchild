// // app/components/layout/RootDashboardLayout.tsx - FINAL FIXED VERSION
// "use client";

// import { ReactNode, useState } from 'react';
// import { useAuth } from '@/app/context/AuthContext';
// import { usePathname, useRouter } from 'next/navigation';
// import { cn } from '@/app/lib/utils';
// import RoleSidePanel from './RoleSidePanel';
// import {
//   Bell,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   Home,
//   File,
//   HelpCircle,
//   Users,
//   Calendar,
//   FileText,
//   Shield,
//   Stethoscope,
//   Heart,
//   Baby,
//   TrendingUp,
//   Syringe,
//   Building,
//   Database,
//   ClipboardList,
//   Pill,
//   BarChart3,
//   AlertCircle,
//   Activity
// } from 'lucide-react';

// interface RootDashboardLayoutProps {
//   children: ReactNode;
//   title?: string;
//   subtitle?: string;
//   showBackButton?: boolean;
//   showSearch?: boolean;
//   showBreadcrumb?: boolean;
//   headerActions?: ReactNode;
//   className?: string;
//   contentClassName?: string;
//   fullWidth?: boolean;
//   hideSidebar?: boolean;
// }

// // Comprehensive route mapping for breadcrumb labels
// const routeMapping: Record<string, { label: string; icon?: React.ReactNode }> = {
//   // Main sections
//   'dashboard': { label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
//   'admin': { label: 'Admin', icon: <Shield className="h-4 w-4" /> },
//   'clinicians': { label: 'Clinicians', icon: <Stethoscope className="h-4 w-4" /> },
//   'clinician': { label: 'Clinician', icon: <Stethoscope className="h-4 w-4" /> },
//   'guardian': { label: 'Guardian', icon: <Heart className="h-4 w-4" /> },
  
//   // User management
//   'users': { label: 'Users', icon: <Users className="h-4 w-4" /> },
//   'user': { label: 'User', icon: <Users className="h-4 w-4" /> },
  
//   // Patient/Children management
//   'patients': { label: 'Patients', icon: <Users className="h-4 w-4" /> },
//   'patient': { label: 'Patient', icon: <Users className="h-4 w-4" /> },
//   'children': { label: 'Children', icon: <Baby className="h-4 w-4" /> },
//   'child': { label: 'Child', icon: <Baby className="h-4 w-4" /> },
  
//   // Appointments
//   'appointments': { label: 'Appointments', icon: <Calendar className="h-4 w-4" /> },
//   'appointment': { label: 'Appointment', icon: <Calendar className="h-4 w-4" /> },
  
//   // Medical
//   'records': { label: 'Records', icon: <FileText className="h-4 w-4" /> },
//   'medical-records': { label: 'Medical Records', icon: <ClipboardList className="h-4 w-4" /> },
//   'health-records': { label: 'Health Records', icon: <FileText className="h-4 w-4" /> },
//   'prescriptions': { label: 'Prescriptions', icon: <Pill className="h-4 w-4" /> },
//   'vaccinations': { label: 'Vaccinations', icon: <Syringe className="h-4 w-4" /> },
//   'vaccination': { label: 'Vaccination', icon: <Syringe className="h-4 w-4" /> },
  
//   // Analytics & Reports
//   'growth': { label: 'Growth Charts', icon: <TrendingUp className="h-4 w-4" /> },
//   'analytics': { label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
//   'reports': { label: 'Reports', icon: <Database className="h-4 w-4" /> },
//   'report': { label: 'Report', icon: <Database className="h-4 w-4" /> },
  
//   // System
//   'settings': { label: 'Settings', icon: <Shield className="h-4 w-4" /> },
//   'system': { label: 'System', icon: <Shield className="h-4 w-4" /> },
//   'clinics': { label: 'Clinics', icon: <Building className="h-4 w-4" /> },
//   'clinic': { label: 'Clinic', icon: <Building className="h-4 w-4" /> },
//   'audit': { label: 'Audit Logs', icon: <FileText className="h-4 w-4" /> },
  
//   // Activity & Notifications
//   'activity': { label: 'Activity', icon: <Activity className="h-4 w-4" /> },
//   'notifications': { label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
//   'alerts': { label: 'Alerts', icon: <AlertCircle className="h-4 w-4" /> },
//   'alert': { label: 'Alert', icon: <AlertCircle className="h-4 w-4" /> },
  
//   // Profile
//   'profile': { label: 'Profile', icon: <Users className="h-4 w-4" /> },
  
//   // Additional common routes
//   'details': { label: 'Details', icon: <File className="h-4 w-4" /> },
//   'manage': { label: 'Manage', icon: <Shield className="h-4 w-4" /> },
//   'overview': { label: 'Overview', icon: <Activity className="h-4 w-4" /> },
//   'statistics': { label: 'Statistics', icon: <BarChart3 className="h-4 w-4" /> },
//   'logs': { label: 'Logs', icon: <FileText className="h-4 w-4" /> },
//   'help': { label: 'Help', icon: <HelpCircle className="h-4 w-4" /> },
//   'support': { label: 'Support', icon: <HelpCircle className="h-4 w-4" /> },
// };

// // Generate breadcrumb items from pathname
// const generateBreadcrumbs = (pathname: string) => {
//   const segments = pathname.split('/').filter(segment => segment !== '');
//   const breadcrumbs = [];
  
//   let currentPath = '';
  
//   // Always start with Dashboard home
//   breadcrumbs.push({
//     label: 'Dashboard',
//     href: '/dashboard',
//     icon: <Home className="h-4 w-4" />,
//     isLast: segments.length === 0
//   });
  
//   for (let i = 0; i < segments.length; i++) {
//     const segment = segments[i];
//     currentPath += `/${segment}`;
    
//     // Skip if it's just 'dashboard' as we already added it
//     if (i === 0 && segment === 'dashboard') continue;
    
//     // Check if segment is a dynamic parameter
//     const isDynamicParam = segment.startsWith('[') && segment.endsWith(']') || 
//                           /^\d+$/.test(segment) || 
//                           /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
    
//     let label = segment;
//     let icon = undefined;
    
//     if (isDynamicParam) {
//       label = 'Details';
//       icon = <File className="h-4 w-4" />;
//     } else {
//       const routeInfo = routeMapping[segment];
//       if (routeInfo) {
//         label = routeInfo.label;
//         icon = routeInfo.icon;
//       } else {
//         label = segment
//           .split('-')
//           .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//           .join(' ');
//       }
//     }
    
//     breadcrumbs.push({
//       label,
//       href: i === segments.length - 1 ? undefined : currentPath,
//       icon,
//       isLast: i === segments.length - 1
//     });
//   }
  
//   return breadcrumbs;
// };

// export default function RootDashboardLayout({
//   children,
//   title,
//   subtitle,
//   showBackButton = false,
//   showSearch = true,
//   showBreadcrumb = true,
//   headerActions,
//   className = '',
//   contentClassName = '',
//   fullWidth = false,
//   hideSidebar = false
// }: RootDashboardLayoutProps) {
//   const { userProfile } = useAuth();
//   const router = useRouter();
//   const pathname = usePathname();
  
//   const [searchQuery, setSearchQuery] = useState('');
//   const breadcrumbs = generateBreadcrumbs(pathname);
  
//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       console.log('Searching for:', searchQuery);
//     }
//   };
  
//   const handleBack = () => {
//     router.back();
//   };
  
//   const getPageTitle = () => {
//     if (title) return title;
    
//     if (breadcrumbs.length > 0) {
//       const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
//       if (lastCrumb && lastCrumb.label !== 'Dashboard') {
//         return lastCrumb.label;
//       }
//     }
    
//     return 'Dashboard';
//   };
  
//   const getPageSubtitle = () => {
//     if (subtitle) return subtitle;
    
//     if (pathname === '/dashboard') {
//       switch (userProfile?.role) {
//         case 'admin': return 'System Administration Dashboard';
//         case 'clinician': return 'Patient Care Dashboard';
//         case 'guardian': return 'Family Health Dashboard';
//         default: return 'Healthcare Dashboard';
//       }
//     }
    
//     return undefined;
//   };
  
//   return (
//     <div className={cn("min-h-screen bg-gray-50 flex", className)}>
//       {/* Use RoleSidePanel */}
//       {!hideSidebar && <RoleSidePanel />}
      
//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col">
//         {/* Fixed Header */}
//         <header className="sticky top-0 z-30 border-b shadow-sm bg-white border-gray-200">
//           <div className="px-4 sm:px-6 lg:px-8 py-4">
//             {/* Top Row: Breadcrumb and Actions */}
//             <div className="flex items-center justify-between mb-3">
//               <div className="flex items-center space-x-4">
//                 {/* Back Button */}
//                 {showBackButton && (
//                   <button
//                     onClick={handleBack}
//                     className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//                     aria-label="Go back"
//                   >
//                     <ChevronLeft className="h-5 w-5 text-gray-600" />
//                   </button>
//                 )}
                
//                 {/* Breadcrumb */}
//                 {showBreadcrumb && breadcrumbs.length > 0 && (
//                   <div className="flex items-center space-x-1 text-sm">
//                     {breadcrumbs.map((crumb, index) => (
//                       <div key={index} className="flex items-center">
//                         {index > 0 && (
//                           <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
//                         )}
//                         {crumb.isLast ? (
//                           <span className="font-semibold text-gray-900 flex items-center">
//                             {crumb.icon && (
//                               <span className="mr-1">{crumb.icon}</span>
//                             )}
//                             {crumb.label}
//                           </span>
//                         ) : crumb.href ? (
//                           <button
//                             onClick={() => router.push(crumb.href!)}
//                             className="text-gray-600 hover:text-gray-900 hover:underline transition-colors flex items-center"
//                           >
//                             {crumb.icon && (
//                               <span className="mr-1">{crumb.icon}</span>
//                             )}
//                             {crumb.label}
//                           </button>
//                         ) : (
//                           <span className="text-gray-900 flex items-center">
//                             {crumb.icon && (
//                               <span className="mr-1">{crumb.icon}</span>
//                             )}
//                             {crumb.label}
//                           </span>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
              
//               {/* Header Actions */}
//               <div className="flex items-center space-x-3">
//                 {/* Notification Bell */}
//                 <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
//                   <Bell className="h-5 w-5 text-gray-600" />
//                   <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
//                 </button>
                
//                 {/* Custom Header Actions */}
//                 {headerActions}
//               </div>
//             </div>
            
//             {/* Title and Search Row */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               {/* Title Section */}
//               <div className="flex-1">
//                 <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
//                 {getPageSubtitle() && (
//                   <p className="text-gray-600 text-sm mt-1">{getPageSubtitle()}</p>
//                 )}
//               </div>
              
//               {/* Search Bar */}
//               {showSearch && (
//                 <form onSubmit={handleSearch} className="w-full sm:w-auto">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                       type="text"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       placeholder="Search patients, appointments..."
//                       className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                     />
//                   </div>
//                 </form>
//               )}
//             </div>
//           </div>
//         </header>
        
//         {/* Main Content */}
//         <main className={cn(
//           "flex-1",
//           fullWidth ? "" : "max-w-7xl mx-auto w-full",
//           "p-4 sm:p-6 lg:p-8",
//           contentClassName
//         )}>
//           {children}
//         </main>
        
//         {/* Footer */}
//         {!fullWidth && (
//           <footer className="border-t border-gray-200 bg-white mt-auto">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//               <div className="flex flex-col sm:flex-row justify-between items-center">
//                 <p className="text-sm text-gray-600">
//                   © {new Date().getFullYear()} HealthCare Pro. All rights reserved.
//                 </p>
//                 <div className="flex items-center space-x-4 mt-2 sm:mt-0">
//                   <button 
//                     onClick={() => router.push('/privacy')}
//                     className="text-sm text-gray-600 hover:text-gray-900"
//                   >
//                     Privacy Policy
//                   </button>
//                   <button 
//                     onClick={() => router.push('/terms')}
//                     className="text-sm text-gray-600 hover:text-gray-900"
//                   >
//                     Terms of Service
//                   </button>
//                   <button 
//                     onClick={() => router.push('/help')}
//                     className="text-sm text-gray-600 hover:text-gray-900"
//                   >
//                     Help Center
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </footer>
//         )}
//       </div>
//     </div>
//   );
// }

// app/components/layout/RootDashboardLayout.tsx - COMPLETE WITH AUTO BACK BUTTON
"use client";

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import RoleSidePanel from './RoleSidePanel';
import {
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Home,
  File,
  HelpCircle,
  Users,
  Calendar,
  FileText,
  Shield,
  Stethoscope,
  Heart,
  Baby,
  TrendingUp,
  Syringe,
  Building,
  Database,
  ClipboardList,
  Pill,
  BarChart3,
  AlertCircle,
  Activity
} from 'lucide-react';

interface RootDashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean; // Optional override
  showSearch?: boolean;
  showBreadcrumb?: boolean;
  headerActions?: ReactNode;
  className?: string;
  contentClassName?: string;
  fullWidth?: boolean;
  hideSidebar?: boolean;
  backButtonFallback?: string; // Custom fallback path
}

// Comprehensive route mapping for breadcrumb labels
const routeMapping: Record<string, { label: string; icon?: React.ReactNode }> = {
  // Main sections
  'dashboard': { label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  'admin': { label: 'Admin', icon: <Shield className="h-4 w-4" /> },
  'clinicians': { label: 'Clinicians', icon: <Stethoscope className="h-4 w-4" /> },
  'clinician': { label: 'Clinician', icon: <Stethoscope className="h-4 w-4" /> },
  'guardian': { label: 'Guardian', icon: <Heart className="h-4 w-4" /> },
  
  // User management
  'users': { label: 'Users', icon: <Users className="h-4 w-4" /> },
  'user': { label: 'User', icon: <Users className="h-4 w-4" /> },
  
  // Patient/Children management
  'patients': { label: 'Patients', icon: <Users className="h-4 w-4" /> },
  'patient': { label: 'Patient', icon: <Users className="h-4 w-4" /> },
  'children': { label: 'Children', icon: <Baby className="h-4 w-4" /> },
  'child': { label: 'Child', icon: <Baby className="h-4 w-4" /> },
  
  // Appointments
  'appointments': { label: 'Appointments', icon: <Calendar className="h-4 w-4" /> },
  'appointment': { label: 'Appointment', icon: <Calendar className="h-4 w-4" /> },
  
  // Medical
  'records': { label: 'Records', icon: <FileText className="h-4 w-4" /> },
  'medical-records': { label: 'Medical Records', icon: <ClipboardList className="h-4 w-4" /> },
  'health-records': { label: 'Health Records', icon: <FileText className="h-4 w-4" /> },
  'prescriptions': { label: 'Prescriptions', icon: <Pill className="h-4 w-4" /> },
  'vaccinations': { label: 'Vaccinations', icon: <Syringe className="h-4 w-4" /> },
  'vaccination': { label: 'Vaccination', icon: <Syringe className="h-4 w-4" /> },
  
  // Analytics & Reports
  'growth': { label: 'Growth Charts', icon: <TrendingUp className="h-4 w-4" /> },
  'analytics': { label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  'reports': { label: 'Reports', icon: <Database className="h-4 w-4" /> },
  'report': { label: 'Report', icon: <Database className="h-4 w-4" /> },
  
  // System
  'settings': { label: 'Settings', icon: <Shield className="h-4 w-4" /> },
  'system': { label: 'System', icon: <Shield className="h-4 w-4" /> },
  'clinics': { label: 'Clinics', icon: <Building className="h-4 w-4" /> },
  'clinic': { label: 'Clinic', icon: <Building className="h-4 w-4" /> },
  'audit': { label: 'Audit Logs', icon: <FileText className="h-4 w-4" /> },
  
  // Activity & Notifications
  'activity': { label: 'Activity', icon: <Activity className="h-4 w-4" /> },
  'notifications': { label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  'alerts': { label: 'Alerts', icon: <AlertCircle className="h-4 w-4" /> },
  'alert': { label: 'Alert', icon: <AlertCircle className="h-4 w-4" /> },
  
  // Profile
  'profile': { label: 'Profile', icon: <Users className="h-4 w-4" /> },
  
  // Additional common routes
  'details': { label: 'Details', icon: <File className="h-4 w-4" /> },
  'manage': { label: 'Manage', icon: <Shield className="h-4 w-4" /> },
  'overview': { label: 'Overview', icon: <Activity className="h-4 w-4" /> },
  'statistics': { label: 'Statistics', icon: <BarChart3 className="h-4 w-4" /> },
  'logs': { label: 'Logs', icon: <FileText className="h-4 w-4" /> },
  'help': { label: 'Help', icon: <HelpCircle className="h-4 w-4" /> },
  'support': { label: 'Support', icon: <HelpCircle className="h-4 w-4" /> },
  
  // Create/Edit actions
  'create': { label: 'Create', icon: <File className="h-4 w-4" /> },
  'edit': { label: 'Edit', icon: <File className="h-4 w-4" /> },
  'new': { label: 'New', icon: <File className="h-4 w-4" /> },
};

// Generate breadcrumb items from pathname
const generateBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(segment => segment !== '');
  const breadcrumbs = [];
  
  let currentPath = '';
  
  // Always start with Dashboard home
  breadcrumbs.push({
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="h-4 w-4" />,
    isLast: segments.length === 0
  });
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Skip if it's just 'dashboard' as we already added it
    if (i === 0 && segment === 'dashboard') continue;
    
    // Check if segment is a dynamic parameter
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

// AUTO-DETECT if back button should be shown
const shouldShowBackButtonAuto = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  
  // If on main dashboard or role dashboard, no back button
  if (segments.length <= 2) {
    return false;
  }
  
  // Check if we're on a detail/edit page (has ID or action)
  const lastSegment = segments[segments.length - 1];
  const isDetailPage = 
    /^\d+$/.test(lastSegment) || // numeric ID
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment) || // UUID
    ['create', 'edit', 'view', 'details', 'new'].includes(lastSegment) || // action pages
    segments.includes('create') ||
    segments.includes('edit') ||
    segments.includes('view') ||
    segments.includes('new');
  
  // Always show back on detail/edit pages
  if (isDetailPage) {
    return true;
  }
  
  // For list pages, show back if we're deeper than 2 levels
  return segments.length > 2;
};

// Get fallback path based on current route
const getFallbackPath = (pathname: string, userRole?: string) => {
  const segments = pathname.split('/').filter(Boolean);
  
  // If we're on a detail/edit page, go to parent list
  if (segments.length >= 3) {
    // Remove last segment (ID or action)
    return '/' + segments.slice(0, -1).join('/');
  }
  
  // Default fallback to role dashboard
  return `/dashboard/${userRole || 'admin'}`;
};

export default function RootDashboardLayout({
  children,
  title,
  subtitle,
  showBackButton, // Optional override
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
  
  // Check if browser has history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasHistory(window.history.length > 1);
    }
  }, [pathname]);
  
  // Auto-determine if back button should be shown
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
  
  // Get back button tooltip text
  const getBackButtonTooltip = () => {
    const segments = pathname.split('/').filter(Boolean);
    
    if (segments.length >= 3) {
      const parentPath = '/' + segments.slice(0, -1).join('/');
      const parentBreadcrumbs = generateBreadcrumbs(parentPath);
      const parentLabel = parentBreadcrumbs.length > 0 
        ? parentBreadcrumbs[parentBreadcrumbs.length - 1]?.label 
        : 'Previous';
      return `Back to ${parentLabel}`;
    }
    
    return hasHistory ? 'Go back' : 'Return to dashboard';
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
  
  // Determine if we should show the back button indicator
  const showBackIndicator = shouldShowBack;
  
  return (
    <div className={cn("min-h-screen bg-gray-50 flex", className)}>
      {/* Use RoleSidePanel */}
      {!hideSidebar && <RoleSidePanel />}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Fixed Header */}
        <header className="sticky top-0 z-30 border-b shadow-sm bg-white border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            {/* Top Row: Breadcrumb and Actions */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                {/* Smart Back Button - Now handles all pages automatically */}
                {showBackIndicator && (
                  <button
                    onClick={handleBack}
                    className={cn(
                      "p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-1 group",
                      "relative"
                    )}
                    aria-label="Go back"
                    title={getBackButtonTooltip()}
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 hidden sm:inline transition-colors">
                      Back
                    </span>
                    
                    {/* Tooltip for mobile */}
                    <div className="lg:hidden absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {getBackButtonTooltip()}
                    </div>
                  </button>
                )}
                
                {/* Breadcrumb */}
                {showBreadcrumb && breadcrumbs.length > 0 && (
                  <div className="flex items-center space-x-1 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                      <div key={index} className="flex items-center">
                        {index > 0 && (
                          <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                        )}
                        {crumb.isLast ? (
                          <span className="font-semibold text-gray-900 flex items-center">
                            {crumb.icon && (
                              <span className="mr-1">{crumb.icon}</span>
                            )}
                            {crumb.label}
                          </span>
                        ) : crumb.href ? (
                          <button
                            onClick={() => router.push(crumb.href!)}
                            className="text-gray-600 hover:text-gray-900 hover:underline transition-colors flex items-center"
                          >
                            {crumb.icon && (
                              <span className="mr-1">{crumb.icon}</span>
                            )}
                            {crumb.label}
                          </button>
                        ) : (
                          <span className="text-gray-900 flex items-center">
                            {crumb.icon && (
                              <span className="mr-1">{crumb.icon}</span>
                            )}
                            {crumb.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                </button>
                
                {/* Custom Header Actions */}
                {headerActions}
              </div>
            </div>
            
            {/* Title and Search Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Title Section */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
                {getPageSubtitle() && (
                  <p className="text-gray-600 text-sm mt-1">{getPageSubtitle()}</p>
                )}
              </div>
              
              {/* Search Bar */}
              {showSearch && (
                <form onSubmit={handleSearch} className="w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search patients, appointments..."
                      className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </form>
              )}
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className={cn(
          "flex-1",
          fullWidth ? "" : "max-w-7xl mx-auto w-full",
          "p-4 sm:p-6 lg:p-8",
          contentClassName
        )}>
          {children}
        </main>
        
        {/* Footer */}
        {!fullWidth && (
          <footer className="border-t border-gray-200 bg-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <p className="text-sm text-gray-600">
                  © {new Date().getFullYear()} HealthCare Pro. All rights reserved.
                </p>
                <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                  <button 
                    onClick={() => router.push('/privacy')}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Privacy Policy
                  </button>
                  <button 
                    onClick={() => router.push('/terms')}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Terms of Service
                  </button>
                  <button 
                    onClick={() => router.push('/help')}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Help Center
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