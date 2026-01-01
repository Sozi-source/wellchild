// /app/admin/guardians/[guardianId]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/Tabs';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import * as AppServices from '@/app/services/app.services';
import type { UserProfile, HealthcarePatient } from '@/app/types/app.types';
import { Button } from '@/app/components/ui/Button';
import {
  GuardianHeader,
  GuardianOverviewTab,
  GuardianPatientsTab,
  GuardianContactTab,
  GuardianSettingsTab
} from '@/app/components/ui/GuardiansComponents';
import { Card, CardContent } from '@/app/components/ui/Card';

export default function GuardianDetailPage() {
  const router = useRouter();
  const params = useParams();
  const guardianId = params.guardianId as string;
  
  const [guardian, setGuardian] = useState<UserProfile | null>(null);
  const [patients, setPatients] = useState<HealthcarePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadGuardianData();
  }, [guardianId]);

  const loadGuardianData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const guardianData = await AppServices.getUserProfile(guardianId);
      if (!guardianData) {
        throw new Error('Guardian not found');
      }
      
      if (guardianData.role !== 'guardian') {
        throw new Error('User is not a guardian');
      }
      
      setGuardian(guardianData);
      
      if (guardianData.patients && guardianData.patients.length > 0) {
        const patientsPromises = guardianData.patients.map(
          patientId => AppServices.getPatient(patientId)
        );
        
        const patientsResults = await Promise.allSettled(patientsPromises);
        const successfulPatients = patientsResults
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => (result as PromiseFulfilledResult<HealthcarePatient>).value);
        
        setPatients(successfulPatients);
      }
      
    } catch (error) {
      console.error('Error loading guardian data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load guardian information');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGuardian = () => {
    router.push(`/dashboard/admin/users/${guardianId}/edit`);
  };

  const handleAddPatient = () => {
    router.push(`/dashboard/admin/patients/new?guardianId=${guardianId}`);
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`/dashboard/admin/patients/${patientId}`);
  };

  const handleBackToList = () => {
    router.push('/dashboard/admin/guardians');
  };

  const handleStatusChange = async () => {
    if (!guardian) return;
    
    try {
      await AppServices.updateUserProfile(guardianId, {
        isActive: !guardian.isActive
      });
      loadGuardianData();
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const handlePasswordReset = async () => {
    alert('Password reset link would be sent to guardian email');
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

  if (error || !guardian) {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="container mx-auto px-4 py-8 mt-5">
          <div className="flex items-center mb-6">
            <Button variant="outline" onClick={handleBackToList} className="mr-4">
              ← Back to Guardians
            </Button>
          </div>
          
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-medium mb-2">Guardian Not Found</h3>
                <p className="text-gray-600 mb-6">{error || 'The requested guardian could not be found.'}</p>
                <Button onClick={handleBackToList}>Return to Guardians List</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleProtectedLayout>
    );
  }

  return (
    <RoleProtectedLayout allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8 mt-5">
        <GuardianHeader
          guardian={guardian}
          loading={loading}
          onBack={handleBackToList}
          onRefresh={loadGuardianData}
          onEdit={handleEditGuardian}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients ({patients.length})</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <GuardianOverviewTab
              guardian={guardian}
              patients={patients}
              onViewPatient={handleViewPatient}
              onAddPatient={handleAddPatient}
            />
          </TabsContent>

          <TabsContent value="patients">
            <GuardianPatientsTab
              patients={patients}
              onPatientClick={handleViewPatient}
              onAddPatient={handleAddPatient}
              onRefresh={loadGuardianData}
            />
          </TabsContent>

          <TabsContent value="contact">
            <GuardianContactTab guardian={guardian} />
          </TabsContent>

          <TabsContent value="settings">
            <GuardianSettingsTab
              guardian={guardian}
              onStatusChange={handleStatusChange}
              onPasswordReset={handlePasswordReset}
            />
          </TabsContent>
        </Tabs>
      </div>
    </RoleProtectedLayout>
  );
}