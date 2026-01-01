// /app/admin/clinicians/[clinicianId]/components/ClinicianComponents.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import type { UserProfile, HealthcarePatient } from '@/app/types/app.types';

// ============================================================================
// CLINICIAN HEADER COMPONENT
// ============================================================================

interface ClinicianHeaderProps {
  clinician: UserProfile;
  loading: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onEdit: () => void;
}

export function ClinicianHeader({
  clinician,
  loading,
  onBack,
  onRefresh,
  onEdit
}: ClinicianHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Button variant="outline" onClick={onBack} className="mr-4">
          ← Back to Clinicians
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinician Details</h1>
          <p className="text-gray-600">Manage clinician account and permissions</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
        <Button onClick={onEdit}>
          Edit Clinician
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// CLINICIAN OVERVIEW TAB COMPONENT
// ============================================================================

interface ClinicianOverviewTabProps {
  clinician: UserProfile;
  patients: HealthcarePatient[];
  onViewPatient: (patientId: string) => void;
  onAddPatient?: () => void;
  stats?: {
    totalPatients: number;
    activePatients: number;
    appointmentsToday: number;
    pendingTasks: number;
  };
}

export function ClinicianOverviewTab({
  clinician,
  patients,
  onViewPatient,
  onAddPatient,
  stats = {
    totalPatients: 0,
    activePatients: 0,
    appointmentsToday: 0,
    pendingTasks: 0
  }
}: ClinicianOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clinician Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Clinician Profile</CardTitle>
            <CardDescription>Professional information and account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {clinician.profilePicture ? (
                  <img
                    src={clinician.profilePicture}
                    alt={clinician.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-md">
                    <span className="text-4xl text-blue-600 font-bold">
                      {clinician.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Profile Details */}
              <div className="flex-grow">
                <div className="flex flex-wrap items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{clinician.name}</h2>
                    <p className="text-gray-600">{clinician.email}</p>
                    <p className="text-sm text-gray-500">
                      {clinician.clinicName || 'No clinic specified'}
                      {clinician.specialization && ` • ${clinician.specialization}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    clinician.isActive 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {clinician.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">License Number</p>
                    <p className="font-medium">{clinician.licenseNumber || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">NPI Number</p>
                    <p className="font-medium">{clinician.npiNumber || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Created</p>
                    <p className="font-medium">
                      {clinician.createdAt ? new Date(clinician.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Login</p>
                    <p className="font-medium">
                      {clinician.lastLogin ? new Date(clinician.lastLogin).toLocaleDateString('en-US', {
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

        {/* Quick Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Practice Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-4xl font-bold text-blue-600">{stats.totalPatients}</p>
                <p className="text-gray-600">Total Patients</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-600">Active Patients:</span>
                  <span className="font-medium">{stats.activePatients}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-600">Today's Appointments:</span>
                  <span className="font-medium">{stats.appointmentsToday}</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-600">Pending Tasks:</span>
                  <span className="font-medium">{stats.pendingTasks}</span>
                </div>
              </div>
              
              {onAddPatient && (
                <div className="pt-4">
                  <Button onClick={onAddPatient} className="w-full" variant="outline">
                    Assign New Patient
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>Credentials and practice details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Clinic Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clinic Name:</span>
                    <span className="font-medium">{clinician.clinicName || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Specialization:</span>
                    <span className="font-medium">{clinician.specialization || 'Not specified'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Credentials</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">License #:</span>
                    <span className="font-medium">{clinician.licenseNumber || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">NPI #:</span>
                    <span className="font-medium">{clinician.npiNumber || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Certifications</h3>
                {clinician.credentials && clinician.credentials.length > 0 ? (
                  <div className="space-y-2">
                    {clinician.credentials.map((credential, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>{credential}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No additional certifications listed</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Verification Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Verified:</span>
                    <Badge variant={clinician.isVerified ? "success" : "warning"}>
                      {clinician.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">License Verified:</span>
                    <Badge variant={clinician.licenseNumber ? "success" : "secondary"}>
                      {clinician.licenseNumber ? 'On File' : 'Not Provided'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// CLINICIAN PATIENTS TAB COMPONENT
// ============================================================================

interface ClinicianPatientsTabProps {
  patients: HealthcarePatient[];
  onPatientClick: (patientId: string) => void;
  onAssignPatient?: () => void;
  onRefresh: () => void;
}

export function ClinicianPatientsTab({
  patients,
  onPatientClick,
  onAssignPatient,
  onRefresh
}: ClinicianPatientsTabProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  // Filter patients based on search and status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchTerm === '' || 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.medicalRecordNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const PatientGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPatients.map(patient => (
        <Card key={patient.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center mb-4">
              {patient.photoUrl ? (
                <img
                  src={patient.photoUrl}
                  alt={patient.name}
                  className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-white shadow-md"
                />
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
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => onPatientClick(patient.id)}
              >
                View Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Handle medical records
                }}
              >
                Records
              </Button>
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
            <th className="text-left py-3 px-4 font-medium">Last Visit</th>
            <th className="text-left py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.map(patient => (
            <tr key={patient.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {patient.photoUrl ? (
                    <img
                      src={patient.photoUrl}
                      alt={patient.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">{patient.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-gray-600">
                      {patient.medicalRecordNumber || 'No record number'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">{calculateAgeString(patient.dob)}</td>
              <td className="py-3 px-4">{patient.sex === 'male' ? 'Male' : 'Female'}</td>
              <td className="py-3 px-4">{getStatusBadge(patient.status)}</td>
              <td className="py-3 px-4">{getGrowthStatusBadge(patient.growthStatus)}</td>
              <td className="py-3 px-4">
                {patient.lastCheckup 
                  ? new Date(patient.lastCheckup).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Never'
                }
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPatientClick(patient.id)}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    Charts
                  </Button>
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
            <CardTitle>Assigned Patients</CardTitle>
            <CardDescription>Patients under this clinician's care</CardDescription>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none border-r"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
            <Button variant="outline" onClick={onRefresh}>
              Refresh
            </Button>
            {onAssignPatient && (
              <Button onClick={onAssignPatient}>
                Assign Patient
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients by name or record number..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
              Clear Filters
            </Button>
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-medium mb-2">
              {patients.length === 0 ? 'No Patients Assigned' : 'No Matching Patients'}
            </h3>
            <p className="text-gray-600 mb-6">
              {patients.length === 0 
                ? 'This clinician doesn\'t have any patients assigned yet.'
                : 'Try adjusting your search or filters.'
              }
            </p>
            {onAssignPatient && patients.length === 0 && (
              <Button onClick={onAssignPatient}>
                Assign First Patient
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredPatients.length} of {patients.length} patients
            </div>
            
            {viewMode === 'grid' ? <PatientGridView /> : <PatientTableView />}
            
            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
                  <p className="text-sm text-gray-600">Total Patients</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {patients.filter(p => p.status === 'active').length}
                  </p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {patients.filter(p => p.growthStatus === 'warning').length}
                  </p>
                  <p className="text-sm text-gray-600">Growth Warnings</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {patients.filter(p => p.growthStatus === 'critical').length}
                  </p>
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
// CLINICIAN CONTACT TAB COMPONENT
// ============================================================================

interface ClinicianContactTabProps {
  clinician: UserProfile;
}

export function ClinicianContactTab({ clinician }: ClinicianContactTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Clinician contact details and professional information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Personal Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Full Name</span>
                    <span className="font-medium">{clinician.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Email Address</span>
                    <span className="font-medium">{clinician.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Phone Number</span>
                    <span className="font-medium">{clinician.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Practice Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Clinic/Hospital</span>
                    <span className="font-medium">{clinician.clinicName || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Specialization</span>
                    <span className="font-medium">{clinician.specialization || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Professional Credentials</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">License Number</span>
                    <span className="font-medium">{clinician.licenseNumber || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">NPI Number</span>
                    <span className="font-medium">{clinician.npiNumber || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Account Status</span>
                    <Badge variant={clinician.isActive ? "success" : "destructive"}>
                      {clinician.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Verification Status</span>
                    <Badge variant={clinician.isVerified ? "success" : "warning"}>
                      {clinician.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">System Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Timezone</span>
                    <span className="font-medium">{clinician.timezone || 'UTC'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Language</span>
                    <span className="font-medium">{clinician.language || 'English'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Certifications & Credentials</CardTitle>
          <CardDescription>Professional qualifications and certifications</CardDescription>
        </CardHeader>
        <CardContent>
          {clinician.credentials && clinician.credentials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clinician.credentials.map((credential, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>{credential}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No additional certifications listed</p>
              <Button variant="outline" className="mt-4">
                Add Certification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// CLINICIAN SETTINGS TAB COMPONENT
// ============================================================================

interface ClinicianSettingsTabProps {
  clinician: UserProfile;
  onStatusChange: () => void;
  onPasswordReset: () => void;
}

export function ClinicianSettingsTab({
  clinician,
  onStatusChange,
  onPasswordReset
}: ClinicianSettingsTabProps) {
  const [showConfirmDeactivate, setShowConfirmDeactivate] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  return (
    <div className="space-y-6">
      {/* Account Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Manage clinician account activation and access</CardDescription>
            </div>
            <Badge variant={clinician.isActive ? "success" : "destructive"}>
              {clinician.isActive ? 'Active' : 'Inactive'}
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
                    {clinician.isActive 
                      ? 'Account is currently active and can access the system'
                      : 'Account is deactivated and cannot access the system'
                    }
                  </p>
                </div>
                <Button variant="outline" onClick={onStatusChange}>
                  {clinician.isActive ? 'Deactivate Account' : 'Activate Account'}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Login History</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Last Login:</span>
                  <span className="font-medium">
                    {clinician.lastLogin 
                      ? new Date(clinician.lastLogin).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })
                      : 'Never logged in'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Account Created:</span>
                  <span className="font-medium">
                    {clinician.createdAt 
                      ? new Date(clinician.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Unknown'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Permissions</CardTitle>
          <CardDescription>Control what this clinician can do in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Create Medical Records</h4>
                  <Badge variant="success">Allowed</Badge>
                </div>
                <p className="text-sm text-gray-600">Can create and update patient medical records</p>
              </div>

              <div className="p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Prescribe Medications</h4>
                  <Badge variant="success">Allowed</Badge>
                </div>
                <p className="text-sm text-gray-600">Can prescribe medications and treatments</p>
              </div>

              <div className="p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Schedule Appointments</h4>
                  <Badge variant="success">Allowed</Badge>
                </div>
                <p className="text-sm text-gray-600">Can schedule and manage appointments</p>
              </div>

              <div className="p-4 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Access All Patients</h4>
                  <Badge variant="warning">Limited</Badge>
                </div>
                <p className="text-sm text-gray-600">Can only access assigned patients</p>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full">
                Manage All Permissions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Manage account security and authentication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-yellow-800">Reset Password</h4>
                  <p className="text-sm text-yellow-700">
                    Send password reset link to clinician's email
                  </p>
                </div>
                <Button variant="outline" onClick={onPasswordReset}>
                  Reset Password
                </Button>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-800">Two-Factor Authentication</h4>
                  <p className="text-sm text-blue-700">
                    Add extra security layer to account login (Recommended for clinicians)
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
          <CardDescription className="text-red-600">
            These actions are irreversible. Please proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Transfer Patients */}
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-800">Transfer All Patients</h4>
                  <p className="text-sm text-red-700">
                    Transfer all assigned patients to another clinician
                  </p>
                </div>
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  Transfer Patients
                </Button>
              </div>
            </div>

            {/* Deactivate Account */}
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-800">Deactivate Account</h4>
                  <p className="text-sm text-red-700">
                    Temporarily disable clinician account access
                  </p>
                </div>
                {showConfirmDeactivate ? (
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        // Handle deactivation
                        setShowConfirmDeactivate(false);
                      }}
                    >
                      Confirm Deactivate
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowConfirmDeactivate(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="border-red-300 text-red-700 hover:bg-red-100"
                    onClick={() => setShowConfirmDeactivate(true)}
                  >
                    Deactivate Account
                  </Button>
                )}
              </div>
            </div>

            {/* Delete Account */}
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-800">Delete Account</h4>
                  <p className="text-sm text-red-700">
                    Permanently delete clinician account (patients must be transferred first)
                  </p>
                </div>
                {showConfirmDelete ? (
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        // Handle deletion
                        setShowConfirmDelete(false);
                      }}
                    >
                      Confirm Delete
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowConfirmDelete(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="destructive"
                    onClick={() => setShowConfirmDelete(true)}
                    disabled={clinician.patients && clinician.patients.length > 0}
                  >
                    Delete Account
                  </Button>
                )}
              </div>
              {clinician.patients && clinician.patients.length > 0 && (
                <p className="text-xs text-red-600 mt-2">
                  Cannot delete account with assigned patients. Transfer patients first.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  ClinicianHeader,
  ClinicianOverviewTab,
  ClinicianPatientsTab,
  ClinicianContactTab,
  ClinicianSettingsTab,
};