"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { useAuth } from '@/app/context/AuthContext';
import * as AppServices from '@/app/services/app.services';
import type { HealthcarePatient } from '@/app/types/app.types';

export default function ClinicianDashboardPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentPatients, setRecentPatients] = useState<HealthcarePatient[]>([]);
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
      const [clinicianStats, patientsResponse] = await Promise.all([
        AppServices.getClinicianStats(userProfile.uid),
        AppServices.getClinicianPatients(userProfile.uid, { limit: 5 })
      ]);
      
      setStats(clinicianStats);
      setRecentPatients(patientsResponse.items);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChild = () => {
    router.push('/dashboard/clinicians/children/new');
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`/dashboard/clinicians/children/${patientId}`);
  };

  if (loading) {
    return (
      <RoleProtectedLayout allowedRoles={['clinician']}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </RoleProtectedLayout>
    );
  }

  return (
    <RoleProtectedLayout allowedRoles={['clinician']}>
      <div className="container mx-auto px-4 py-8 mt-5">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, Dr. {userProfile?.name}
        </h1>
        <p className="text-gray-600 mb-8">Pediatric Care Dashboard</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Children</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.activePatients || 0}</div>
              <p className="text-sm text-gray-600 mt-2">
                Under your care
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Growth Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats?.growthAlerts || 0}</div>
              <p className="text-sm text-gray-600 mt-2">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.upcomingAppointments || 0}</div>
              <p className="text-sm text-gray-600 mt-2">
                Scheduled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.recentRecords || 0}</div>
              <p className="text-sm text-gray-600 mt-2">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleRegisterChild}>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">👶</div>
              <h3 className="font-semibold mb-2">Register New Child</h3>
              <p className="text-sm text-gray-600">
                Enroll a new child and invite guardians
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/clinicians/children')}>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="font-semibold mb-2">All Children</h3>
              <p className="text-sm text-gray-600">
                View all children under your care
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/clinicians/appointments')}>
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="font-semibold mb-2">Appointments</h3>
              <p className="text-sm text-gray-600">
                Schedule and manage appointments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Children</CardTitle>
            <CardDescription>Recently enrolled or updated children</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No children enrolled yet.</p>
                <Button onClick={handleRegisterChild} className="mt-4">
                  Enroll First Child
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Child</th>
                      <th className="text-left py-3 px-4">Age</th>
                      <th className="text-left py-3 px-4">Growth Status</th>
                      <th className="text-left py-3 px-4">Guardians</th>
                      <th className="text-left py-3 px-4">Last Checkup</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPatients.map(patient => (
                      <tr key={patient.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-gray-600">
                            MR#: {patient.medicalRecordNumber}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {AppServices.calculateAgeString(patient.dob)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            patient.growthStatus === 'normal' ? 'bg-green-100 text-green-800' :
                            patient.growthStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {patient.growthStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            {patient.guardianIds.length} assigned
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">
                            {patient.lastCheckup 
                              ? AppServices.formatDate(patient.lastCheckup)
                              : 'Never'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPatient(patient.id)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleProtectedLayout>
  );
}