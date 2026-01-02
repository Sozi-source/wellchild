// // /app/admin/guardians/[guardianId]/page.tsx
// "use client";

// import React, { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/Tabs';
// import LoadingSpinner from '@/app/components/common/LoadingSpinner';
// import * as AppServices from '@/app/services/app.services';
// import type { UserProfile, HealthcarePatient } from '@/app/types/app.types';
// import { Button } from '@/app/components/ui/Button';
// import {
//   GuardianHeader,
//   GuardianOverviewTab,
//   GuardianPatientsTab,
//   GuardianContactTab,
//   GuardianSettingsTab
// } from '@/app/components/ui/GuardiansComponents';
// import { Card, CardContent } from '@/app/components/ui/Card';

// export default function GuardianDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const guardianId = params.guardianId as string;
  
//   const [guardian, setGuardian] = useState<UserProfile | null>(null);
//   const [patients, setPatients] = useState<HealthcarePatient[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState('overview');

//   useEffect(() => {
//     loadGuardianData();
//   }, [guardianId]);

//   const loadGuardianData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const guardianData = await AppServices.getUserProfile(guardianId);
//       if (!guardianData) {
//         throw new Error('Guardian not found');
//       }
      
//       if (guardianData.role !== 'guardian') {
//         throw new Error('User is not a guardian');
//       }
      
//       setGuardian(guardianData);
      
//       if (guardianData.patients && guardianData.patients.length > 0) {
//         const patientsPromises = guardianData.patients.map(
//           patientId => AppServices.getPatient(patientId)
//         );
        
//         const patientsResults = await Promise.allSettled(patientsPromises);
//         const successfulPatients = patientsResults
//           .filter(result => result.status === 'fulfilled' && result.value)
//           .map(result => (result as PromiseFulfilledResult<HealthcarePatient>).value);
        
//         setPatients(successfulPatients);
//       }
      
//     } catch (error) {
//       console.error('Error loading guardian data:', error);
//       setError(error instanceof Error ? error.message : 'Failed to load guardian information');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditGuardian = () => {
//     router.push(`/dashboard/admin/users/${guardianId}/edit`);
//   };

//   const handleAddPatient = () => {
//     router.push(`/dashboard/admin/patients/new?guardianId=${guardianId}`);
//   };

//   const handleViewPatient = (patientId: string) => {
//     router.push(`/dashboard/admin/patients/${patientId}`);
//   };

//   const handleBackToList = () => {
//     router.push('/dashboard/admin/users/guardians');
//   };

//   const handleStatusChange = async () => {
//     if (!guardian) return;
    
//     try {
//       await AppServices.updateUserProfile(guardianId, {
//         isActive: !guardian.isActive
//       });
//       loadGuardianData();
//     } catch (error) {
//       console.error('Error changing status:', error);
//     }
//   };

//   const handlePasswordReset = async () => {
//     alert('Password reset link would be sent to guardian email');
//   };

//   if (loading) {
//     return (
//       <RoleProtectedLayout allowedRoles={['admin']}>
//         <div className="min-h-screen flex items-center justify-center">
//           <LoadingSpinner size="lg" />
//         </div>
//       </RoleProtectedLayout>
//     );
//   }

//   if (error || !guardian) {
//     return (
//       <RoleProtectedLayout allowedRoles={['admin']}>
//         <div className="container mx-auto px-4 py-8 mt-5">
//           <div className="flex items-center mb-6">
//             <Button variant="outline" onClick={handleBackToList} className="mr-4">
//               ← Back to Guardians
//             </Button>
//           </div>
          
//           <Card className="border-red-200">
//             <CardContent className="pt-6">
//               <div className="text-center py-12">
//                 <div className="text-5xl mb-4">⚠️</div>
//                 <h3 className="text-xl font-medium mb-2">Guardian Not Found</h3>
//                 <p className="text-gray-600 mb-6">{error || 'The requested guardian could not be found.'}</p>
//                 <Button onClick={handleBackToList}>Return to Guardians List</Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </RoleProtectedLayout>
//     );
//   }

//   return (
//     <RoleProtectedLayout allowedRoles={['admin']}>
//       <div className="container mx-auto px-4 py-8 mt-5">
//         <GuardianHeader
//           guardian={guardian}
//           loading={loading}
//           onBack={handleBackToList}
//           onRefresh={loadGuardianData}
//           onEdit={handleEditGuardian}
//         />

//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 mb-6">
//             <TabsTrigger value="overview">Overview</TabsTrigger>
//             <TabsTrigger value="patients">Patients ({patients.length})</TabsTrigger>
//             <TabsTrigger value="contact">Contact Info</TabsTrigger>
//             <TabsTrigger value="settings">Settings</TabsTrigger>
//           </TabsList>

//           <TabsContent value="overview">
//             <GuardianOverviewTab
//               guardian={guardian}
//               patients={patients}
//               onViewPatient={handleViewPatient}
//               onAddPatient={handleAddPatient}
//             />
//           </TabsContent>

//           <TabsContent value="patients">
//             <GuardianPatientsTab
//               patients={patients}
//               onPatientClick={handleViewPatient}
//               onAddPatient={handleAddPatient}
//               onRefresh={loadGuardianData}
//             />
//           </TabsContent>

//           <TabsContent value="contact">
//             <GuardianContactTab guardian={guardian} />
//           </TabsContent>

//           <TabsContent value="settings">
//             <GuardianSettingsTab
//               guardian={guardian}
//               onStatusChange={handleStatusChange}
//               onPasswordReset={handlePasswordReset}
//             />
//           </TabsContent>
//         </Tabs>
//       </div>
//     </RoleProtectedLayout>
//   );
// }

// /dashboard/admin/users/guardians/[guardianId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import * as AppServices from '@/app/services/app.services';
import type { UserProfile, HealthcarePatient } from '@/app/types/app.types';
import {
  GuardianHeader,
  GuardianOverviewTab,
  GuardianPatientsTab,
  GuardianContactTab,
  GuardianSettingsTab
} from '@/app/components/ui/GuardiansComponents';

export default function GuardianDetailPage() {
  const router = useRouter();
  const params = useParams();
  const guardianId = params.guardianId as string;
  
  const [guardian, setGuardian] = useState<UserProfile | null>(null);
  const [patients, setPatients] = useState<HealthcarePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadGuardianData = useCallback(async () => {
    const isRefresh = !loading;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      // Load guardian profile
      const guardianData = await AppServices.getUserProfile(guardianId);
      if (!guardianData) {
        throw new Error('Guardian not found');
      }
      
      // Verify this is a guardian
      if (guardianData.role !== 'guardian') {
        throw new Error('User is not a guardian');
      }
      
      setGuardian(guardianData);
      
      // Load guardian's patients
      if (guardianData.patients && guardianData.patients.length > 0) {
        const patientsResponse = await AppServices.getGuardianPatients(guardianId, { 
          limit: 100 
        });
        setPatients(patientsResponse.items);
      } else {
        setPatients([]);
      }
      
    } catch (error) {
      console.error('Error loading guardian data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load guardian information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [guardianId, loading]);

  useEffect(() => {
    if (guardianId) {
      loadGuardianData();
    }
  }, [guardianId, loadGuardianData]);

  const handleEditGuardian = () => {
    router.push(`/dashboard/admin/users/${guardianId}/edit`);
  };

  const handleAddPatient = () => {
    router.push(`/dashboard/admin/patients/assign?guardianId=${guardianId}`);
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`/dashboard/admin/patients/${patientId}`);
  };

  const handleBackToList = () => {
    router.push('/dashboard/admin/users/guardians');
  };

  const handleStatusChange = async () => {
    if (!guardian) return;
    
    try {
      await AppServices.updateUserProfile(guardianId, {
        isActive: !guardian.isActive
      });
      loadGuardianData(); // Refresh data
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const handlePasswordReset = async () => {
    alert('Password reset link would be sent to guardian email');
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
  if (error || !guardian) {
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
                <h3 className="text-xl font-medium text-gray-900 mb-2">Guardian Not Found</h3>
                <p className="text-gray-600 mb-6">
                  {error || 'The requested guardian could not be found.'}
                </p>
                <button
                  onClick={handleBackToList}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Return to Guardians List
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
        <div className="container mx-auto px-4 py-6">
          {/* Header using your GuardianHeader component */}
          <GuardianHeader
            guardian={guardian}
            loading={refreshing}
            onBack={handleBackToList}
            onRefresh={loadGuardianData}
            onEdit={handleEditGuardian}
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
            </div>
          </Tabs>
        </div>
      </div>
    </RoleProtectedLayout>
  );
}