"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
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
      
      // Load clinician's patients
      if (clinicianData.patients && clinicianData.patients.length > 0) {
        const patientsResponse = await AppServices.getClinicianPatients(clinicianId, { 
          limit: 100 
        });
        setPatients(patientsResponse.items);
      } else {
        setPatients([]);
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
    alert('Password reset link would be sent to clinician email');
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </RoleProtectedLayout>
    );
  }

  // Error state
  if (error || !clinician) {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-2xl mx-auto">
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
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
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

  // Calculate stats for overview
  const stats = {
    totalPatients: patients.length,
    activePatients: patients.filter(p => p.status === 'active').length,
    appointmentsToday: 0, // You can implement this
    pendingTasks: patients.filter(p => 
      p.growthStatus === 'warning' || p.growthStatus === 'critical'
    ).length
  };

  return (
    <RoleProtectedLayout allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Header using your ClinicianHeader component */}
          <ClinicianHeader
            clinician={clinician}
            loading={refreshing}
            onBack={handleBackToList}
            onRefresh={loadClinicianData}
            onEdit={handleEditClinician}
          />

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-6">
              <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-xl border shadow-sm">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 rounded-lg transition-all"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="patients" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 rounded-lg transition-all"
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
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 rounded-lg transition-all"
                >
                  Contact
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 rounded-lg transition-all"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              <TabsContent value="overview">
                <ClinicianOverviewTab
                  clinician={clinician}
                  patients={patients}
                  onViewPatient={handleViewPatient}
                  onAddPatient={handleAssignPatient}
                  stats={stats}
                />
              </TabsContent>

              <TabsContent value="patients">
                <ClinicianPatientsTab
                  patients={patients}
                  onPatientClick={handleViewPatient}
                  onAssignPatient={handleAssignPatient}
                  onRefresh={loadClinicianData}
                />
              </TabsContent>

              <TabsContent value="contact">
                <ClinicianContactTab clinician={clinician} />
              </TabsContent>

              <TabsContent value="settings">
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