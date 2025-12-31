// app/components/layout/RoleProtectedLayout.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';

interface RoleProtectedLayoutProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'clinician' | 'guardian')[];
  fallbackPath?: string;
}

export default function RoleProtectedLayout({
  children,
  allowedRoles,
  fallbackPath = '/dashboard'
}: RoleProtectedLayoutProps) {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!userProfile || !allowedRoles.includes(userProfile.role))) {
      router.push(fallbackPath);
    }
  }, [userProfile, loading, allowedRoles, fallbackPath, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!userProfile || !allowedRoles.includes(userProfile.role)) {
    return null;
  }

  return <>{children}</>;
}