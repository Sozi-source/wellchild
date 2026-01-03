// app/dashboard/layout.tsx
"use client";

import { ReactNode } from 'react';
import RoleSidePanel from '@/app/components/layout/RoleSidePanel';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <RoleSidePanel />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}