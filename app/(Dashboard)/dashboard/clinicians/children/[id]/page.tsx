// app/clinician/children/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { MinimalTabs } from '@/app/components/ui/Tabs';
import { StatsCard } from '@/app/components/common/StatsCard';
import { useAuth } from '@/app/context/AuthContext';
import * as AppServices from '@/app/services/app.services'; // FIXED PATH
import type { PatientWithDetails, UserProfile, Allergy } from '@/app/types/app.types';

export default function ChildDetailPage() {
  const { userProfile } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [child, setChild] = useState<PatientWithDetails | null>(null); // Changed type
  const [guardians, setGuardians] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
      
      // Check if clinician has access to this child
      const hasAccess = await AppServices.canAccessPatient(userProfile.uid, childId);
      if (!hasAccess) {
        router.push('/dashboard/clinician/children');
        return;
      }

      const childData = await AppServices.getPatientWithDetails(childId);
      
      if (!childData) {
        router.push('/dashboard/clinician/children');
        return;
      }
      
      setChild(childData);
      setGuardians(childData.guardians || []);
    } catch (error) {
      console.error('Error loading child data:', error);
      router.push('/clinician/children');
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
    { id: 'guardians', label: `Guardians (${guardians.length})` },
  ];

  // Helper function to safely format dates
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'Never';
    try {
      return AppServices.formatDate(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatDateTime = (date: Date | string | undefined): string => {
    if (!date) return 'Never';
    try {
      return AppServices.formatDateTime(date);
    } catch (error) {
      console.error('Error formatting date time:', error);
      return 'Invalid date';
    }
  };



  // Helper function to get blood type display
  const getBloodTypeDisplay = (bloodType: string | undefined): string => {
    if (!bloodType || bloodType === 'unknown') return 'Unknown';
    return bloodType.toUpperCase();
  };

  const handleAddMedicalRecord = () => {
    router.push(`/dashboard/clinician/children/${childId}/medical/new`);
  };

  const handleScheduleAppointment = () => {
    router.push(`/dashboard/clinician/children/${childId}/appointments/new`);
  };

  const handleAddGuardian = () => {
    router.push(`/dashboard/clinician/children/${childId}/add-guardian`);
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

  if (!child) {
    return (
      <RoleProtectedLayout allowedRoles={['clinician']}>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Child Not Found</h1>
          <p className="text-gray-600 mb-6">The child you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => router.push('/dashboard/clinician/children')}>
            ← Back to Children
          </Button>
        </div>
      </RoleProtectedLayout>
    );
  }

  // Calculate age string safely
  const ageString = AppServices.calculateAgeString(child.dob);

  return (
    <RoleProtectedLayout allowedRoles={['clinician']}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-6">
            {child.photoUrl ? (
              <img
                src={child.photoUrl}
                alt={child.name}
                className="w-20 h-20 rounded-full border-4 border-white shadow object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-20 h-20 rounded-full bg-blue-100 border-4 border-white shadow flex items-center justify-center">
                        <span class="text-3xl text-blue-600 font-medium">
                          ${child.name.charAt(0)}
                        </span>
                      </div>
                    `;
                  }
                }}
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
                <Badge variant={child.status === 'active' ? 'success' : 'secondary'}>
                  {child.status.charAt(0).toUpperCase() + child.status.slice(1)}
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">
                MR#: {child.medicalRecordNumber || 'Not assigned'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/dashboard/clinician/children/${childId}/edit`)}
              className="w-full md:w-auto"
            >
              Edit Profile
            </Button>
            <Button 
              onClick={handleAddMedicalRecord}
              className="w-full md:w-auto"
            >
              Add Medical Record
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Allergies"
            value={(child.allergies?.length || 0).toString()}
            description="Known allergies"
            icon="⚠️"
          />
          <StatsCard
            title="Conditions"
            value={(child.conditions?.length || 0).toString()}
            description="Medical conditions"
            icon="🏥"
          />
          <StatsCard
            title="Medications"
            value={(child.medications?.length || 0).toString()}
            description="Active medications"
            icon="💊"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <MinimalTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
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
                      <p className="mt-1">
                        {child.birthWeight ? `${child.birthWeight} kg` : 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Birth Length</label>
                      <p className="mt-1">
                        {child.birthLength ? `${child.birthLength} cm` : 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Gestational Age</label>
                      <p className="mt-1">
                        {child.gestationalAge ? `${child.gestationalAge} weeks` : 'Not recorded'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                  
                    <div>
                      <label className="text-sm font-medium text-gray-500">Enrolled By</label>
                      <p className="mt-1">
                        {child.createdByName || 'Unknown'} ({child.createdByRole || 'Unknown'})
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleAddMedicalRecord}
                >
                  📝 Add Medical Record
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleScheduleAppointment}
                >
                  📅 Schedule Appointment
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleAddGuardian}
                >
                  👥 Add Guardian
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/clinician/children/${childId}/growth`)}
                >
                  📈 View Growth Chart
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'guardians' && (
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <CardTitle>Guardians</CardTitle>
              <Button
                variant="outline"
                onClick={handleAddGuardian}
                className="w-full md:w-auto"
              >
                Add Guardian
              </Button>
            </CardHeader>
            <CardContent>
              {guardians.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">👥</div>
                  <h3 className="text-xl font-medium mb-2">No Guardians Assigned</h3>
                  <p className="text-gray-600 mb-6">
                    Add a guardian to allow them to view this child's health information.
                  </p>
                  <Button onClick={handleAddGuardian}>
                    Add Guardian
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {guardians.map(guardian => (
                    <Card key={guardian.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-4">
                          {guardian.profilePicture ? (
                            <img
                              src={guardian.profilePicture}
                              alt={guardian.name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const span = document.createElement('span');
                                  span.className = 'text-lg text-green-600 font-medium';
                                  span.textContent = guardian.name.charAt(0);
                                  parent.innerHTML = '';
                                  parent.appendChild(document.createElement('div')).className = 'w-12 h-12 rounded-full bg-green-100 flex items-center justify-center';
                                  parent.firstChild?.appendChild(span);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-lg text-green-600 font-medium">
                                {guardian.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium">{guardian.name}</h4>
                            <p className="text-sm text-gray-600">{guardian.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span>{guardian.phone || 'Not provided'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Children:</span>
                            <span>{guardian.patients?.length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <Badge variant={guardian.isActive ? 'success' : 'secondary'}>
                              {guardian.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'medical' && (
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <CardTitle>Medical Records</CardTitle>
              <Button onClick={handleAddMedicalRecord} className="w-full md:w-auto">
                Add Record
              </Button>
            </CardHeader>
            <CardContent>
              {child.recentRecords && child.recentRecords.length > 0 ? (
                <div className="space-y-4">
                  {child.recentRecords.map(record => (
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-4"
                          onClick={() => router.push(`/clinician/children/${childId}/medical/${record.id}`)}
                        >
                          View Details →
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/clinician/children/${childId}/medical`)}
                  >
                    View All Medical Records
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-xl font-medium mb-2">No Medical Records</h3>
                  <p className="text-gray-600 mb-6">
                    Start by adding the child's first medical record.
                  </p>
                  <Button onClick={handleAddMedicalRecord}>
                    Add First Record
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'appointments' && (
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <CardTitle>Appointments</CardTitle>
              <Button onClick={handleScheduleAppointment} className="w-full md:w-auto">
                Schedule Appointment
              </Button>
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
                        {appointment.notes && (
                          <p className="text-sm text-gray-700 mb-3 p-2 bg-gray-50 rounded">{appointment.notes}</p>
                        )}
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
                            <div>
                              <span className="text-gray-600 font-medium">Reason:</span>
                              <p className="text-gray-600 mt-1">{appointment.reason}</p>
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
                  <p className="text-gray-600 mb-6">
                    Schedule the child's first appointment.
                  </p>
                  <Button onClick={handleScheduleAppointment}>
                    Schedule Appointment
                  </Button>
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
                    Growth measurements will appear here after the child's first checkup.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </RoleProtectedLayout>
  );
}