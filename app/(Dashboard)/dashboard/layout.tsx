// app/(dashboard)/dashboard/layout.tsx
"use client";

import { ReactNode } from 'react';
import RootDashboardLayout from '@/app/components/layout/RootDashboardLayout';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RootDashboardLayout>
      {children}
    </RootDashboardLayout>
  );
}