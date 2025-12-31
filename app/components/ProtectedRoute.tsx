"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Shield, AlertTriangle, Lock, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'guardian' | 'clinician' | 'admin'; // UPDATED
  requiredRoles?: ('guardian' | 'clinician' | 'admin')[]; // UPDATED
  fallbackPath?: string;
  showUnauthorizedUI?: boolean;
  redirectDelay?: number;
  logging?: boolean;
  customUnauthorizedMessage?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredRoles,
  fallbackPath = '/login',
  showUnauthorizedUI = true,
  redirectDelay = 1500,
  logging = false,
  customUnauthorizedMessage,
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [accessDenied, setAccessDenied] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(Math.floor(redirectDelay / 1000));

  // Countdown timer
  useEffect(() => {
    if (!accessDenied) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [accessDenied]);

  // Logging for debugging
  useEffect(() => {
    if (logging && !loading) {
      console.log('ProtectedRoute Debug:', {
        path: pathname,
        user: user?.email,
        userProfile: userProfile,
        userRole: userProfile?.role,
        requiredRole,
        requiredRoles,
        hasAccess: checkAccess()
      });
    }
  }, [loading, user, userProfile, pathname, requiredRole, requiredRoles, logging]);

  const checkAccess = (): boolean => {
    // No user profile means not logged in
    if (!userProfile) return false;

    // Check single role requirement
    if (requiredRole && userProfile.role !== requiredRole) {
      return false;
    }

    // Check multiple roles requirement
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(userProfile.role)) {
      return false;
    }

    // Special case for admin email (temporary)
    if (user?.email === 'osoziw@gmail.com' && userProfile.role !== 'admin') {
      console.log('⚠️ Admin email detected but role mismatch, granting temporary access');
      return true;
    }

    return true;
  };

  useEffect(() => {
    if (loading) return;

    // No user at all - redirect to login
    if (!user) {
      const timer = setTimeout(() => {
        setRedirecting(true);
        router.push(fallbackPath);
      }, redirectDelay);
      return () => clearTimeout(timer);
    }

    // User exists but no profile yet - still loading
    if (user && !userProfile) {
      console.log('Waiting for user profile to load...');
      return;
    }

    const hasAccess = checkAccess();
    if (!hasAccess) {
      setAccessDenied(true);
      const timer = setTimeout(() => {
        setRedirecting(true);
        router.push('/unauthorized');
      }, redirectDelay);
      return () => clearTimeout(timer);
    }
  }, [user, userProfile, loading, requiredRole, redirectDelay, fallbackPath, router, requiredRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-6" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking Access</h2>
          <p className="text-gray-600 max-w-sm">
            Verifying your permissions for this page...
          </p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="h-1 w-1 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="h-1 w-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-1 w-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (accessDenied && showUnauthorizedUI) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
          <div className="relative mb-6">
            <div className="h-24 w-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full mx-auto flex items-center justify-center">
              <Lock className="h-12 w-12 text-red-600" />
            </div>
            <div className="absolute -top-2 -right-2">
              <AlertTriangle className="h-10 w-10 text-yellow-500 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h1>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current User:</span>
                <span className="text-sm font-medium text-gray-900">{user?.email || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">User Role:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  userProfile?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  userProfile?.role === 'clinician' ? 'bg-green-100 text-green-800' : // UPDATED
                  userProfile?.role === 'guardian' ? 'bg-blue-100 text-blue-800' : // UPDATED
                  'bg-gray-100 text-gray-800'
                }`}>
                  {userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 'Unknown'}
                </span>
              </div>
              {requiredRole && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Required Role:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)}
                  </span>
                </div>
              )}
              {requiredRoles && requiredRoles.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Required Roles:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {requiredRoles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {customUnauthorizedMessage ? (
            <p className="text-gray-600 mb-6">{customUnauthorizedMessage}</p>
          ) : (
            <div className="text-gray-600 mb-6">
              <p>You don't have permission to access this page.</p>
              <p className="mt-2 text-sm text-gray-500">
                {user?.email === 'osoziw@gmail.com' && userProfile?.role !== 'admin' && 
                  "Note: Your email is recognized as admin but role isn't set correctly."}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {redirecting ? (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Redirecting...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-gray-500">
                  You will be redirected in {timeLeft} seconds...
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/profile')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View Profile
                  </button>
                  {user?.email === 'osoziw@gmail.com' && (
                    <button
                      onClick={() => {
                        // Force refresh or update role
                        window.location.reload();
                      }}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Force Admin Check
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Need access? Contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (accessDenied && !showUnauthorizedUI) {
    return null;
  }

  if (!user || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check access before rendering
  const hasAccess = checkAccess();
  if (!hasAccess) {
    return null; // Will be handled by useEffect
  }

  // Access granted - render children
  return (
    <>
      {/* Optional: Add access granted indicator in development */}
      {process.env.NODE_ENV === 'development' && logging && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-100 border border-green-300 rounded-lg px-3 py-1 text-xs font-medium text-green-800 flex items-center gap-2 shadow-sm">
            <Shield className="h-3 w-3" />
            Access Granted
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              userProfile?.role === 'admin' ? 'bg-purple-200 text-purple-800' :
              userProfile?.role === 'clinician' ? 'bg-green-200 text-green-800' : // UPDATED
              'bg-blue-200 text-blue-800'
            }`}>
              {userProfile?.role || 'unknown'}
            </span>
          </div>
        </div>
      )}
      {children}
    </>
  );
}

// Helper component for role-based rendering
interface RoleGateProps {
  children: ReactNode;
  role: 'guardian' | 'clinician' | 'admin'; // UPDATED
  fallback?: ReactNode;
}

export function RoleGate({ children, role, fallback }: RoleGateProps) {
  const { userProfile } = useAuth();

  if (!userProfile || userProfile.role !== role) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Helper component for type-guard based rendering
interface AdminGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminGate({ children, fallback }: AdminGateProps) {
  const { userProfile } = useAuth();

  if (!userProfile || userProfile.role !== 'admin') { // UPDATED
    return fallback || null;
  }

  return <>{children}</>;
}

interface GuardianGateProps { // UPDATED from ParentGate
  children: ReactNode;
  fallback?: ReactNode;
}

export function GuardianGate({ children, fallback }: GuardianGateProps) { // UPDATED
  const { userProfile } = useAuth();

  if (!userProfile || userProfile.role !== 'guardian') { // UPDATED
    return fallback || null;
  }

  return <>{children}</>;
}

interface ClinicianGateProps { // UPDATED from HealthcareGate
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClinicianGate({ children, fallback }: ClinicianGateProps) { // UPDATED
  const { userProfile } = useAuth();

  if (!userProfile || userProfile.role !== 'clinician') { // UPDATED
    return fallback || null;
  }

  return <>{children}</>;
}

