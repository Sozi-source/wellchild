// app/guardian/children/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import Tabs from '@/app/components/ui/Tabs';
import { StatsCard } from '@/app/components/common/StatsCard';
import { useAuth } from '@/app/context/AuthContext';
import * as AppServices from '@/app/services/app.services'; // Updated path
import type { PatientWithDetails, Allergy } from '@/app/types/app.types';


export default function GuardianChildDetailPage() {
  const { userProfile } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [child, setChild] = useState<PatientWithDetails | null>(null); // Changed type
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');AbortController

  const childId = params.id as string;

  useEffect(() => {
    if (userProfile && childId) {
      loadChildData();
    }
  }, [childId, userProfile]);

  const loadChildData = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      
      // Check if guardian has access to this child - FIXED
      const hasAccess = await AppServices.canAccessPatient(userProfile.uid, childId);
      if (!hasAccess) {
        router.push('/guardian/children');
        return;
      }

      // Get patient with details - FIXED
      const childData = await AppServices.getPatientWithDetails(childId);
      
      if (!childData) {
        router.push('/guardian/children');
        return;
      }
      
      setChild(childData);
    } catch (error) {
      console.error('Error loading child data:', error);
      router.push('/guardian/children');
    } finally {
      setLoading(false);
    }
  };

  const getGrowthStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'medical', label: 'Medical Records' },
    { id: 'growth', label: 'Growth Charts' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'vaccinations', label: 'Vaccinations' },
  ];

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'Never';
    return AppServices.formatDate(date);
  };

  const formatDateTime = (date: Date | string | undefined): string => {
    if (!date) return 'Never';
    return AppServices.formatDateTime(date);
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

  if (!child) {
    return (
      <RoleProtectedLayout allowedRoles={['guardian']}>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Child Not Found</h1>
          <Button onClick={() => router.push('/guardian/children')}>
            ← Back to Children
          </Button>
        </div>
      </RoleProtectedLayout>
    );
  }

  // Calculate age string
  const ageString = AppServices.calculateAgeString(child.dob);

  return (
    <RoleProtectedLayout allowedRoles={['guardian']}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-6">
            {child.photoUrl ? (
              <img
                src={child.photoUrl}
                alt={child.name}
                className="w-20 h-20 rounded-full border-4 border-white shadow object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 border-4 border-white shadow flex items-center justify-center">
                <span className="text-3xl text-blue-600 font-medium">
                  {child.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{child.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="text-gray-600">
                  {ageString} • {child.sex.charAt(0).toUpperCase() + child.sex.slice(1)}
                </span>
                <Badge variant={getGrowthStatusColor(child.growthStatus)}>
                  {child.growthStatus.charAt(0).toUpperCase() + child.growthStatus.slice(1)}
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">
                Under care of {(child.clinicians?.length || 0) + (child.guardians?.length || 0)} caregiver(s)
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/guardian/children')}
            className="w-full md:w-auto"
          >
            ← Back to Children
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Next Appointment"
            value={child.upcomingAppointments?.[0] ? formatDate(child.upcomingAppointments[0].dateTime) : 'None'}
            description="Scheduled visit"
            icon="📅"
          />
          <StatsCard
            title="Allergies"
            value={child.allergies?.length || 0}
            description="Known allergies"
            icon="⚠️"
          />
          <StatsCard
            title="Conditions"
            value={child.conditions?.length || 0}
            description="Medical conditions"
            icon="🏥"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Child Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Child Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="mt-1">{formatDate(child.dob)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Birth Weight</label>
                      <p className="mt-1">{child.birthWeight || 'N/A'} {child.birthWeight ? 'kg' : ''}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Birth Length</label>
                      <p className="mt-1">{child.birthLength || 'N/A'} {child.birthLength ? 'cm' : ''}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Gestational Age</label>
                      <p className="mt-1">{child.gestationalAge || 'N/A'} {child.gestationalAge ? 'weeks' : ''}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Medical Record #</label>
                      <p className="mt-1">{child.medicalRecordNumber || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created By</label>
                      <p className="mt-1">{child.createdByName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="mt-1 capitalize">{child.status || 'Active'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {activeTab === 'medical' && (
          <Card>
            <CardHeader>
              <CardTitle>Medical Records</CardTitle>
              <p className="text-sm text-gray-600">
                Latest medical records from clinicians
              </p>
            </CardHeader>
            <CardContent>
              {child.recentRecords && child.recentRecords.length > 0 ? (
                <div className="space-y-4">
                  {child.recentRecords.slice(0, 5).map(record => (
                    <Card key={record.id} className="border border-gray-200">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                          <div>
                            <h4 className="font-medium text-lg">
                              {record.type.charAt(0).toUpperCase() + record.type.slice(1)} Visit
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(record.date)} • {record.clinicianName || 'Unknown Clinician'}
                            </p>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {record.type}
                          </Badge>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-gray-700 mb-4 p-2 bg-gray-50 rounded">{record.notes}</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {record.height && (
                            <div className="p-2 bg-blue-50 rounded">
                              <span className="text-gray-600 font-medium">Height:</span> {record.height} cm
                            </div>
                          )}
                          {record.weight && (
                            <div className="p-2 bg-green-50 rounded">
                              <span className="text-gray-600 font-medium">Weight:</span> {record.weight} kg
                            </div>
                          )}
                          {record.temperature && (
                            <div className="p-2 bg-yellow-50 rounded">
                              <span className="text-gray-600 font-medium">Temp:</span> {record.temperature}°C
                            </div>
                          )}
                          {record.heartRate && (
                            <div className="p-2 bg-red-50 rounded">
                              <span className="text-gray-600 font-medium">Heart Rate:</span> {record.heartRate} bpm
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-xl font-medium mb-2">No Medical Records Yet</h3>
                  <p className="text-gray-600">
                    Medical records will appear here after your child's first clinical visit.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'appointments' && (
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <p className="text-sm text-gray-600">
                Upcoming and past appointments
              </p>
            </CardHeader>
            <CardContent>
              {child.upcomingAppointments && child.upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {child.upcomingAppointments.map(appointment => (
                    <Card key={appointment.id} className="border border-gray-200">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                          <div>
                            <h4 className="font-medium text-lg capitalize">{appointment.type || 'Appointment'}</h4>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(appointment.dateTime)} • {appointment.clinicianName || 'Unknown Clinician'}
                            </p>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="text-sm space-y-3">
                          {appointment.location && (
                            <div className="flex items-center">
                              <span className="text-gray-600 font-medium mr-2">📍</span>
                              <span>{appointment.location}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <span className="text-gray-600 font-medium mr-2">⏱️</span>
                            <span>{appointment.duration || 30} minutes</span>
                          </div>
                          {appointment.reason && (
                            <div className="p-3 bg-gray-50 rounded">
                              <span className="font-medium text-gray-700">Reason:</span>
                              <p className="text-gray-600 mt-1">{appointment.reason}</p>
                            </div>
                          )}
                          {appointment.preparationInstructions && (
                            <div className="p-3 bg-blue-50 rounded">
                              <span className="font-medium text-blue-700">📝 Preparation:</span>
                              <p className="text-blue-600 text-sm mt-1">{appointment.preparationInstructions}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📅</div>
                  <h3 className="text-xl font-medium mb-2">No Upcoming Appointments</h3>
                  <p className="text-gray-600">
                    Your child doesn't have any scheduled appointments at the moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'growth' && (
          <Card>
            <CardHeader>
              <CardTitle>Growth Charts</CardTitle>
              <p className="text-sm text-gray-600">
                Height, weight, and growth trends
              </p>
            </CardHeader>
            <CardContent>
              {child.growthData && child.growthData.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <h4 className="font-medium mb-2">Latest Height</h4>
                        <p className="text-2xl font-bold">
                          {child.growthData[child.growthData.length - 1]?.height || 'N/A'} cm
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <h4 className="font-medium mb-2">Latest Weight</h4>
                        <p className="text-2xl font-bold">
                          {child.growthData[child.growthData.length - 1]?.weight || 'N/A'} kg
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <h4 className="font-medium mb-2">Latest Head Circumference</h4>
                        <p className="text-2xl font-bold">
                          {child.growthData[child.growthData.length - 1]?.headCircumference || 'N/A'} cm
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-4xl mb-4">📊</div>
                    <h4 className="font-medium text-lg mb-2">Growth Chart Coming Soon</h4>
                    <p className="text-gray-600">
                      Interactive growth charts will be available in the next update.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📏</div>
                  <h3 className="text-xl font-medium mb-2">No Growth Data Yet</h3>
                  <p className="text-gray-600">
                    Growth measurements will appear here after your child's first checkup.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'vaccinations' && (
          <Card>
            <CardHeader>
              <CardTitle>Vaccinations</CardTitle>
              <p className="text-sm text-gray-600">
                Immunization records and schedule
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-5xl mb-4">💉</div>
                <h3 className="text-xl font-medium mb-2">Vaccination Records</h3>
                <p className="text-gray-600 mb-6">
                  Vaccination tracking will be available in the next update.
                </p>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleProtectedLayout>
  );
}