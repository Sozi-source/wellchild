// /app/admin/guardians/[guardianId]/components/GuardianComponents.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import type { UserProfile, HealthcarePatient } from '@/app/types/app.types';

// ============================================================================
// GUARDIAN HEADER COMPONENT
// ============================================================================

interface GuardianHeaderProps {
  guardian: UserProfile;
  loading: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onEdit: () => void;
}

export function GuardianHeader({
  guardian,
  loading,
  onBack,
  onRefresh,
  onEdit
}: GuardianHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Button variant="outline" onClick={onBack} className="mr-4">
          ← Back to Guardians
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guardian Details</h1>
          <p className="text-gray-600">Manage guardian account and associated patients</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
        <Button onClick={onEdit}>
          Edit Guardian
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// GUARDIAN OVERVIEW TAB COMPONENT
// ============================================================================

interface GuardianOverviewTabProps {
  guardian: UserProfile;
  patients: HealthcarePatient[];
  onViewPatient: (patientId: string) => void;
  onAddPatient: () => void;
}

export function GuardianOverviewTab({
  guardian,
  patients,
  onViewPatient,
  onAddPatient
}: GuardianOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Guardian Profile</CardTitle>
            <CardDescription>Basic information and account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-shrink-0">
                {guardian.profilePicture ? (
                  <img
                    src={guardian.profilePicture}
                    alt={guardian.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-md">
                    <span className="text-4xl text-blue-600 font-bold">
                      {guardian.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <div className="flex flex-wrap items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{guardian.name}</h2>
                    <p className="text-gray-600">{guardian.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    guardian.isActive 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {guardian.isActive ? 'Active Account' : 'Inactive'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Created</p>
                    <p className="font-medium">
                      {guardian.createdAt ? new Date(guardian.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Login</p>
                    <p className="font-medium">
                      {guardian.lastLogin ? new Date(guardian.lastLogin).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-4xl font-bold text-blue-600">{patients.length}</p>
                <p className="text-gray-600">Total Patients</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-600">Active Patients:</span>
                  <span className="font-medium">{patients.filter(p => p.status === 'active').length}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-600">Health Alerts:</span>
                  <span className="font-medium">
                    {patients.filter(p => p.growthStatus === 'warning' || p.growthStatus === 'critical').length}
                  </span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={onAddPatient} className="w-full">Add New Patient</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Recent actions and updates by this guardian</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All Activity</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity to display</p>
                <Button onClick={onAddPatient} variant="outline" className="mt-4">Add First Patient</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {patients.slice(0, 5).map(patient => (
                  <div key={patient.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border">
                    <div className="flex items-center gap-3">
                      {patient.photoUrl ? (
                        <img src={patient.photoUrl} alt={patient.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{patient.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-600">
                          Last updated: {patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onViewPatient(patient.id)}>View</Button>
                      <Button variant="ghost" size="sm">Records</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// GUARDIAN PATIENTS TAB COMPONENT
// ============================================================================

interface GuardianPatientsTabProps {
  patients: HealthcarePatient[];
  onPatientClick: (patientId: string) => void;
  onAddPatient: () => void;
  onRefresh: () => void;
}

export function GuardianPatientsTab({
  patients,
  onPatientClick,
  onAddPatient,
  onRefresh
}: GuardianPatientsTabProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const calculateAgeString = (dob: string | Date): string => {
    const birth = typeof dob === 'string' ? new Date(dob) : dob;
    const today = new Date();
    
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months += today.getMonth() - birth.getMonth();
    
    if (today.getDate() < birth.getDate()) months--;
    
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths > 0) return `${years}y ${remainingMonths}m`;
      return `${years}y`;
    }
    
    return `${months}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success">Active</Badge>;
      case 'inactive': return <Badge variant="secondary">Inactive</Badge>;
      case 'pending': return <Badge variant="outline">Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getGrowthStatusBadge = (status: string) => {
    switch (status) {
      case 'normal': return <Badge variant="success">Normal</Badge>;
      case 'warning': return <Badge variant="warning">Warning</Badge>;
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const PatientGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patients.map(patient => (
        <Card key={patient.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center mb-4">
              {patient.photoUrl ? (
                <img src={patient.photoUrl} alt={patient.name} className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-white shadow-md" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-3 border-4 border-white shadow-md">
                  <span className="text-2xl text-blue-600 font-bold">{patient.name.charAt(0)}</span>
                </div>
              )}
              <h3 className="font-bold text-lg">{patient.name}</h3>
              <p className="text-sm text-gray-600">{patient.medicalRecordNumber || 'No record number'}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{calculateAgeString(patient.dob)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium">{patient.sex === 'male' ? 'Male' : 'Female'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span>{getStatusBadge(patient.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Growth:</span>
                <span>{getGrowthStatusBadge(patient.growthStatus)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 mt-4 border-t">
              <Button variant="default" size="sm" className="flex-1" onClick={() => onPatientClick(patient.id)}>
                View Details
              </Button>
              <Button variant="outline" size="sm">Records</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const PatientTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Patient</th>
            <th className="text-left py-3 px-4 font-medium">Age</th>
            <th className="text-left py-3 px-4 font-medium">Gender</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-left py-3 px-4 font-medium">Growth</th>
            <th className="text-left py-3 px-4 font-medium">Last Checkup</th>
            <th className="text-left py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {patient.photoUrl ? (
                    <img src={patient.photoUrl} alt={patient.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">{patient.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-gray-600">{patient.medicalRecordNumber || 'No record number'}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">{calculateAgeString(patient.dob)}</td>
              <td className="py-3 px-4">{patient.sex === 'male' ? 'Male' : 'Female'}</td>
              <td className="py-3 px-4">{getStatusBadge(patient.status)}</td>
              <td className="py-3 px-4">{getGrowthStatusBadge(patient.growthStatus)}</td>
              <td className="py-3 px-4">
                {patient.lastCheckup ? new Date(patient.lastCheckup).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never'}
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onPatientClick(patient.id)}>View</Button>
                  <Button variant="ghost" size="sm">Records</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <CardTitle>Associated Patients</CardTitle>
            <CardDescription>Patients under this guardian's care</CardDescription>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <div className="flex border rounded-md">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="rounded-r-none border-r" onClick={() => setViewMode('grid')}>
                Grid
              </Button>
              <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" className="rounded-l-none" onClick={() => setViewMode('table')}>
                Table
              </Button>
            </div>
            <Button variant="outline" onClick={onRefresh}>Refresh</Button>
            <Button onClick={onAddPatient}>Add Patient</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👶</div>
            <h3 className="text-xl font-medium mb-2">No Patients Found</h3>
            <p className="text-gray-600 mb-6">
              This guardian doesn't have any patients yet. Add the first patient to get started.
            </p>
            <Button onClick={onAddPatient}>Add First Patient</Button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? <PatientGridView /> : <PatientTableView />}
            
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
                  <p className="text-sm text-gray-600">Total Patients</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{patients.filter(p => p.status === 'active').length}</p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{patients.filter(p => p.growthStatus === 'warning').length}</p>
                  <p className="text-sm text-gray-600">Growth Warnings</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{patients.filter(p => p.growthStatus === 'critical').length}</p>
                  <p className="text-sm text-gray-600">Critical</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GUARDIAN CONTACT TAB COMPONENT
// ============================================================================

interface GuardianContactTabProps {
  guardian: UserProfile;
}

export function GuardianContactTab({ guardian }: GuardianContactTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Guardian contact details and primary information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Personal Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Full Name</span>
                    <span className="font-medium">{guardian.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Email Address</span>
                    <span className="font-medium">{guardian.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Phone Number</span>
                    <span className="font-medium">{guardian.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Address</h3>
                <div className="p-4 bg-gray-50 rounded">
                  {guardian.address ? (
                    <p className="font-medium">{guardian.address}</p>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No address provided</p>
                      <Button variant="outline" size="sm" className="mt-2">Request Address</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Account Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Timezone</span>
                    <Badge variant="secondary">{guardian.timezone || 'UTC'}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Language Preference</span>
                    <Badge variant="secondary">{guardian.language || 'English'}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Account Verification</span>
                    <Badge variant={guardian.isVerified ? "success" : "warning"}>
                      {guardian.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Account Status</span>
                    <Badge variant={guardian.isActive ? "success" : "destructive"}>
                      {guardian.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Communication Preferences</CardTitle>
              <CardDescription>How this guardian prefers to receive notifications</CardDescription>
            </div>
            <Button variant="outline" size="sm">Edit Preferences</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Notification Channels</h3>
              {guardian.notificationPreferences ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${guardian.notificationPreferences.email ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Email Notifications</span>
                    </div>
                    <span className="text-sm font-medium">
                      {guardian.notificationPreferences.email ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${guardian.notificationPreferences.push ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Push Notifications</span>
                    </div>
                    <span className="text-sm font-medium">
                      {guardian.notificationPreferences.push ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${guardian.notificationPreferences.sms ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>SMS Notifications</span>
                    </div>
                    <span className="text-sm font-medium">
                      {guardian.notificationPreferences.sms ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No notification preferences set</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Notification Types</h3>
              {guardian.notificationPreferences ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${guardian.notificationPreferences.appointmentReminders ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Appointment Reminders</span>
                    </div>
                    <span className="text-sm font-medium">
                      {guardian.notificationPreferences.appointmentReminders ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${guardian.notificationPreferences.healthAlerts ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Health Alerts</span>
                    </div>
                    <span className="text-sm font-medium">
                      {guardian.notificationPreferences.healthAlerts ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No notification types configured</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// GUARDIAN SETTINGS TAB COMPONENT
// ============================================================================

interface GuardianSettingsTabProps {
  guardian: UserProfile;
  onStatusChange: () => void;
  onPasswordReset: () => void;
}

export function GuardianSettingsTab({
  guardian,
  onStatusChange,
  onPasswordReset
}: GuardianSettingsTabProps) {
  const [showConfirmDeactivate, setShowConfirmDeactivate] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Manage guardian account activation and access</CardDescription>
            </div>
            <Badge variant={guardian.isActive ? "success" : "destructive"}>
              {guardian.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Account Activation</h4>
                  <p className="text-sm text-gray-600">
                    {guardian.isActive 
                      ? 'Account is currently active and accessible'
                      : 'Account is deactivated and cannot access the system'
                    }
                  </p>
                </div>
                <Button variant="outline" onClick={onStatusChange}>
                  {guardian.isActive ? 'Deactivate Account' : 'Activate Account'}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Login History</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Last Login:</span>
                  <span className="font-medium">
                    {guardian.lastLogin 
                      ? new Date(guardian.lastLogin).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                      : 'Never logged in'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Account Created:</span>
                  <span className="font-medium">
                    {guardian.createdAt 
                      ? new Date(guardian.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Unknown'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions & Access</CardTitle>
          <CardDescription>Control what this guardian can do in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">View Medical Records</h4>
                  <Badge variant="success">Allowed</Badge>
                </div>
                <p className="text-sm text-gray-600">Can view patient medical records and history</p>
              </div>

              <div className="p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Schedule Appointments</h4>
                  <Badge variant="success">Allowed</Badge>
                </div>
                <p className="text-sm text-gray-600">Can schedule and manage patient appointments</p>
              </div>

              <div className="p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Add New Patients</h4>
                  <Badge variant="warning">Request Required</Badge>
                </div>
                <p className="text-sm text-gray-600">Requires admin approval to add new patients</p>
              </div>

              <div className="p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Edit Patient Info</h4>
                  <Badge variant="warning">Limited</Badge>
                </div>
                <p className="text-sm text-gray-600">Can edit basic info, medical changes require approval</p>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full">Manage All Permissions</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
          <CardDescription className="text-red-600">
            These actions are irreversible. Please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-800">Reset Password</h4>
                  <p className="text-sm text-red-700">Send password reset link to guardian's email</p>
                </div>
                <Button variant="outline" onClick={onPasswordReset} className="border-red-300 text-red-700 hover:bg-red-100">
                  Reset Password
                </Button>
              </div>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-800">Deactivate Account</h4>
                  <p className="text-sm text-red-700">Temporarily disable account access</p>
                </div>
                {showConfirmDeactivate ? (
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => setShowConfirmDeactivate(false)}>Confirm Deactivate</Button>
                    <Button variant="outline" onClick={() => setShowConfirmDeactivate(false)}>Cancel</Button>
                  </div>
                ) : (
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" onClick={() => setShowConfirmDeactivate(true)}>
                    Deactivate Account
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-800">Delete Account</h4>
                  <p className="text-sm text-red-700">Permanently delete guardian account</p>
                </div>
                {showConfirmDelete ? (
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => setShowConfirmDelete(false)}>Confirm Delete</Button>
                    <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>Cancel</Button>
                  </div>
                ) : (
                  <Button variant="destructive" onClick={() => setShowConfirmDelete(true)}>Delete Account</Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// DEFAULT EXPORT (all components in one object)
// ============================================================================

export default {
  GuardianHeader,
  GuardianOverviewTab,
  GuardianPatientsTab,
  GuardianContactTab,
  GuardianSettingsTab,
};