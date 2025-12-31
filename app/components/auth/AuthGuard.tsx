"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ 
  children, 
  allowedRoles = [] 
}: AuthGuardProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Redirect to login if not authenticated
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Redirect to appropriate dashboard if wrong role
      if (allowedRoles.length > 0 && userProfile && !allowedRoles.includes(userProfile.role)) {
        switch (userProfile.role) {
          case 'parent':
            router.push('/dashboard/parent');
            break;
          case 'healthcare':
            router.push('/dashboard/healthcare');
            break;
          case 'admin':
            router.push('/dashboard/admin');
            break;
          default:
            router.push('/login');
        }
      }
    }
  }, [user, userProfile, loading, allowedRoles, router]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />;
  }

  if (!user || (allowedRoles.length > 0 && userProfile && !allowedRoles.includes(userProfile.role))) {
    return <LoadingSpinner fullScreen message="Redirecting..." />;
  }

  return <>{children}</>;
}