"use client";

import React from 'react';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { EmptyState } from '@/app/components/common/EmptyState';

export default function ClinicianAppointmentsPage() {
  return (
    <RoleProtectedLayout allowedRoles={['clinician']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Appointments</h1>
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No Appointments"
              description="You don't have any scheduled appointments yet."
              icon="📅"
              actionLabel="Schedule First Appointment"
              onAction={() => {/* Implement */}}
            />
          </CardContent>
        </Card>
      </div>
    </RoleProtectedLayout>
  );
}