// app/guardian/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { StatsCard } from '@/app/components/common/StatsCard';
import { QuickActionCard } from '@/app/components/common/QuickActionCard';
import { useAuth } from '@/app/context/AuthContext';
import * as AppServices from '@/app/services/app.services';
import type { HealthcarePatient } from '@/app/types/app.types';

export default function GuardianDashboardPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<HealthcarePatient[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      loadDashboardData();
    }
  }, [userProfile]);

  const loadDashboardData = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      const [guardianStats, childrenResponse] = await Promise.all([
        AppServices.getGuardianStats(userProfile.uid),
        AppServices.getGuardianPatients(userProfile.uid)
      ]);
      
      setStats(guardianStats);
      setChildren(childrenResponse.items);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChild = (childId: string) => {
    router.push(`/guardian/children/${childId}`);
  };

  if (loading) {
    return (
      <RoleProtectedLayout allowedRoles={['guardian']}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </RoleProtectedLayout>
    );
  }

  return (
    <RoleProtectedLayout allowedRoles={['guardian']}>
      <div className="container mx-auto px-4 py-8 mt-5">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {userProfile?.name}
        </h1>
        <p className="text-gray-600 mb-8">Your Children's Health Dashboard</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="My Children"
            value={children.length}
            description="Under your care"
            icon="👶"
          />
          <StatsCard
            title="Upcoming Appointments"
            value={stats?.upcomingAppointments || 0}
            description="Scheduled visits"
            icon="📅"
          />
          <StatsCard
            title="Health Alerts"
            value={stats?.healthAlerts || 0}
            description="Require attention"
            icon="⚠️"
          />
          <StatsCard
            title="Vaccinations Due"
            value={stats?.vaccinationDue || 0}
            description="Immunizations pending"
            icon="💉"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            title="View All Children"
            description="Check all your children's health records"
            icon="📋"
            onClick={() => router.push('/dashboard/guardian/children')}
          />
          <QuickActionCard
            title="Upcoming Appointments"
            description="View and manage upcoming visits"
            icon="📅"
            onClick={() => router.push('/guardian/appointments')}
          />
          <QuickActionCard
            title="Health Alerts"
            description="Review important health notifications"
            icon="🔔"
            onClick={() => router.push('/guardian/alerts')}
          />
        </div>

        {/* Children List */}
        <Card>
          <CardHeader>
            <CardTitle>My Children ({children.length})</CardTitle>
            <CardDescription>Children under your guardianship</CardDescription>
          </CardHeader>
          <CardContent>
            {children.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👶</div>
                <h3 className="text-xl font-medium mb-2">No Children Assigned</h3>
                <p className="text-gray-600 mb-6">
                  Children will appear here once a clinician enrolls them and invites you.
                </p>
                <Button onClick={() => router.push('/guardian/invitations')}>
                  Check Invitations
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.map(child => (
                  <Card key={child.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {child.photoUrl ? (
                            <img
                              src={child.photoUrl}
                              alt={child.name}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-lg text-blue-600 font-medium">
                                {child.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold">{child.name}</h3>
                            <p className="text-sm text-gray-600">
                              {AppServices.calculateAgeString(child.dob)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          child.growthStatus === 'normal' ? 'success' :
                          child.growthStatus === 'warning' ? 'warning' : 'destructive'
                        }>
                          {child.growthStatus}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">MR#:</span>
                          <span>{child.medicalRecordNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Checkup:</span>
                          <span>{child.lastCheckup ? AppServices.formatDate(child.lastCheckup) : 'Never'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Clinicians:</span>
                          <span>{child.clinicianIds.length}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewChild(child.id)}
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/dashboard/guardian/children/${child.id}/growth`)}
                        >
                          Growth
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates about your children</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {children.length > 0 ? (
                children.flatMap(child => [
                  {
                    child: child.name,
                    activity: 'Growth measurements updated',
                    time: '2 days ago',
                    type: 'growth'
                  },
                  {
                    child: child.name,
                    activity: 'Appointment scheduled',
                    time: '1 week ago',
                    type: 'appointment'
                  }
                ]).slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'growth' ? 'bg-green-100 text-green-600' :
                        activity.type === 'appointment' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {activity.type === 'growth' ? '📈' :
                         activity.type === 'appointment' ? '📅' : '⚠️'}
                      </div>
                      <div>
                        <span className="font-medium">{activity.child}</span>
                        <span className="text-gray-600 ml-2">{activity.activity}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">
                  No recent activity. Updates will appear here when available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleProtectedLayout>
  );
}