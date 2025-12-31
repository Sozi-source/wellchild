"use client";

import React, { useState, useEffect } from 'react';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import * as AppServices from '@/app/services/app.services';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await AppServices.getAdminDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </RoleProtectedLayout>
    );
  }

  return (
    <RoleProtectedLayout allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span>{stats?.totalClinicians || 0} clinicians</span>
                <span>{stats?.totalGuardians || 0} guardians</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Children</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalPatients || 0}</div>
              <p className="text-sm text-gray-600 mt-2">
                Active children in the system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.pendingInvitations || 0}</div>
              <p className="text-sm text-gray-600 mt-2">
                Guardians awaiting acceptance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                stats?.systemHealth === 'good' ? 'bg-green-100 text-green-800' :
                stats?.systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {stats?.systemHealth?.toUpperCase() || 'GOOD'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your healthcare platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">👨‍⚕️</div>
                  <h3 className="font-semibold mb-2">Manage Clinicians</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    View and manage clinician accounts
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/dashboard/admin/clinicians">View Clinicians</a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="font-semibold mb-2">Manage Guardians</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    View and manage guardian accounts
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/dashboard/admin/guardians">View Guardians</a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="font-semibold mb-2">System Reports</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Generate system usage reports
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="dashboard/admin/reports">View Reports</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleProtectedLayout>
  );
}