// /app/admin/clinicians/[clinicianId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/Tabs';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import * as AppServices from '@/app/services/app.services';
import type { UserProfile, HealthcarePatient } from '@/app/types/app.types';
import {
  ClinicianHeader,
  ClinicianOverviewTab,
  ClinicianPatientsTab,
  ClinicianContactTab,
  ClinicianSettingsTab
} from '@/app/components/ui/ClinicianComponents';

export default function ClinicianDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clinicianId = params.clinicianId as string;
  
  const [clinician, setClinician] = useState<UserProfile | null>(null);
  const [patients, setPatients] = useState<HealthcarePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    appointmentsToday: 0,
    pendingTasks: 0
  });

  const loadClinicianData = useCallback(async () => {
    const isRefresh = !loading;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      // Load clinician profile
      const clinicianData = await AppServices.getUserProfile(clinicianId);
      if (!clinicianData) {
        throw new Error('Clinician not found');
      }
      
      // Verify this is a clinician
      if (clinicianData.role !== 'clinician') {
        throw new Error('User is not a clinician');
      }
      
      setClinician(clinicianData);
      
      // Load clinician's patients using the patients array from user profile
      if (clinicianData.patients && clinicianData.patients.length > 0) {
        // Use the paginated function for better performance
        const patientsResponse = await AppServices.getClinicianPatients(clinicianId, { 
          limit: 50 
        });
        setPatients(patientsResponse.items);
        
        // Calculate stats
        const activePatients = patientsResponse.items.filter(p => p.status === 'active').length;
        const growthWarnings = patientsResponse.items.filter(p => p.growthStatus === 'warning').length;
        const growthCritical = patientsResponse.items.filter(p => p.growthStatus === 'critical').length;
        
        setStats({
          totalPatients: patientsResponse.total,
          activePatients,
          appointmentsToday: 0, // You can implement appointment counting
          pendingTasks: growthWarnings + growthCritical
        });
      } else {
        // No patients assigned
        setPatients([]);
        setStats({
          totalPatients: 0,
          activePatients: 0,
          appointmentsToday: 0,
          pendingTasks: 0
        });
      }
      
    } catch (error) {
      console.error('Error loading clinician data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load clinician information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clinicianId, loading]);

  useEffect(() => {
    if (clinicianId) {
      loadClinicianData();
    }
  }, [clinicianId, loadClinicianData]);

  const handleEditClinician = () => {
    router.push(`/dashboard/admin/users/${clinicianId}/edit`);
  };

  const handleAssignPatient = () => {
    router.push(`/dashboard/admin/patients/assign?clinicianId=${clinicianId}`);
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`/dashboard/admin/patients/${patientId}`);
  };

  const handleBackToList = () => {
    router.push('/dashboard/admin/users/clinicians');
  };

  const handleStatusChange = async () => {
    if (!clinician) return;
    
    try {
      await AppServices.updateUserProfile(clinicianId, {
        isActive: !clinician.isActive
      });
      loadClinicianData(); // Refresh data
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const handlePasswordReset = async () => {
    // Implement password reset logic
    alert('Password reset link would be sent to clinician email');
  };

  if (loading && !refreshing) {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </RoleProtectedLayout>
    );
  }

  if (error || !clinician) {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="min-h-screen bg-gray-50">
          {/* Mobile Header */}
          <div className="md:hidden sticky top-0 z-50 bg-white border-b shadow-sm">
            <div className="px-4 py-3">
              <div className="flex items-center">
                <button
                  onClick={handleBackToList}
                  className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 md:p-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Clinician Not Found</h3>
                <p className="text-gray-600 mb-6">
                  {error || 'The requested clinician could not be found.'}
                </p>
                <button
                  onClick={handleBackToList}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  Return to Clinicians List
                </button>
              </div>
            </div>
          </div>
        </div>
      </RoleProtectedLayout>
    );
  }

  return (
    <RoleProtectedLayout allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToList}
                  className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="font-bold text-lg">Clinician</h1>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleEditClinician}
                  className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Actions Bar */}
          <div className="px-4 pb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAssignPatient}
                className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium text-sm active:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Assign Patient
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToList}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Clinicians
              </button>
              <div className="flex items-center space-x-3">
                <button
                  onClick={loadClinicianData}
                  disabled={refreshing}
                  className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <svg className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button
                  onClick={handleEditClinician}
                  className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Clinician
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center space-x-6">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {clinician.name?.charAt(0) || 'C'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{clinician.name}</h1>
                      <div className="flex items-center space-x-2 mt-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${clinician.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {clinician.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-700 capitalize">
                          {clinician.role}
                        </span>
                        {clinician.specialization && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {clinician.specialization}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{clinician.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          {/* Mobile Stats */}
          <div className="md:hidden mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <p className="text-xs font-medium text-gray-600">Total Patients</p>
                <p className="text-lg font-bold mt-1">{stats.totalPatients}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <p className="text-xs font-medium text-gray-600">Active Patients</p>
                <p className="text-lg font-bold mt-1">{stats.activePatients}</p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tabs Navigation */}
            <div className="sticky top-0 md:relative z-40 bg-gray-50 pt-2 md:pt-0">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-4 md:mb-8 bg-white p-1 rounded-xl border shadow-sm">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="patients" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  <span className="flex items-center">
                    Patients
                    {patients.length > 0 && (
                      <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                        {patients.length}
                      </span>
                    )}
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="contact" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Contact
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="mt-4 md:mt-0">
              <TabsContent value="overview">
                <div className="space-y-6 md:space-y-8">
                  {/* Desktop Stats */}
                  <div className="hidden md:grid md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Patients</p>
                          <p className="text-2xl font-bold mt-1">{stats.totalPatients}</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-5.197a6 6 0 00-9 5.197" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Patients</p>
                          <p className="text-2xl font-bold mt-1">{stats.activePatients}</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Appointments Today</p>
                          <p className="text-2xl font-bold mt-1">{stats.appointmentsToday}</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                          <p className="text-2xl font-bold mt-1">{stats.pendingTasks}</p>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-lg">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Patients List */}
                  <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 md:p-6 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg md:text-xl font-semibold">Assigned Patients</h3>
                        <button
                          onClick={handleAssignPatient}
                          className="inline-flex items-center px-3 md:px-4 py-2 bg-white text-black shadow-md border rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Assign Patient
                        </button>
                      </div>
                    </div>
                    
                    <div className="divide-y">
                      {patients.length > 0 ? (
                        patients.slice(0, 5).map((patient) => (
                          <div
                            key={patient.id}
                            onClick={() => handleViewPatient(patient.id)}
                            className="p-4 md:p-6 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 md:space-x-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span className="text-gray-600 font-medium">
                                    {patient.name?.charAt(0) || 'P'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm md:text-base">
                                    {patient.name}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {patient.dob && (
                                      <span className="text-xs text-gray-500">
                                        DOB: {new Date(patient.dob).toLocaleDateString()}
                                      </span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                      {patient.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 md:p-12 text-center">
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-5.197a6 6 0 00-9 5.197" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Assigned</h3>
                          <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            This clinician doesn't have any patients assigned yet.
                          </p>
                          <button
                            onClick={handleAssignPatient}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Assign First Patient
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="patients">
                {/* Using your original ClinicianPatientsTab component */}
                <ClinicianPatientsTab
                  patients={patients}
                  onPatientClick={handleViewPatient}
                  onAssignPatient={handleAssignPatient}
                  onRefresh={loadClinicianData}
                />
              </TabsContent>

              <TabsContent value="contact">
                {/* Using your original ClinicianContactTab component */}
                <ClinicianContactTab clinician={clinician} />
              </TabsContent>

              <TabsContent value="settings">
                {/* Using your original ClinicianSettingsTab component */}
                <ClinicianSettingsTab
                  clinician={clinician}
                  onStatusChange={handleStatusChange}
                  onPasswordReset={handlePasswordReset}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </RoleProtectedLayout>
  );
}