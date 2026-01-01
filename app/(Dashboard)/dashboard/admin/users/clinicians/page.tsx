"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import * as AppServices from '@/app/services/app.services';
import type { UserProfile } from '@/app/types/app.types';

export default function AdminCliniciansPage() {
  const router = useRouter();
  const [clinicians, setClinicians] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClinicians();
  }, []);

  const loadClinicians = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await AppServices.getUsersByRole('clinician');
      
      if (response && response.items) {
        setClinicians(response.items);
      } else {
        setError('Unexpected response format');
      }
      
    } catch (error) {
      console.error('Error loading clinicians:', error);
      setError(error instanceof Error ? error.message : 'Failed to load clinicians');
      
      // Fallback to getAllUsers if getUsersByRole fails
      try {
        const allUsers = await AppServices.getAllUsers();
        
        if (allUsers && allUsers.items) {
          const cliniciansOnly = allUsers.items.filter(user => user.role === 'clinician');
          setClinicians(cliniciansOnly);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleViewClinician = (clinicianId: string) => {
    router.push(`/admin/clinicians/${clinicianId}`);
  };

  const handleCreateClinician = () => {
    router.push('/admin/users/new?role=clinician');
  };

  const handleEditClinician = (clinicianId: string) => {
    router.push(`/admin/users/${clinicianId}/edit`);
  };

  const handleRefresh = () => {
    loadClinicians(true);
  };

  // Skeleton loader for mobile
  const ClinicianSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-white rounded-xl border p-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-16 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (loading && !refreshing) {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="min-h-screen bg-gray-50">
          {/* Mobile Header Skeleton */}
          <div className="md:hidden sticky top-0 z-50 bg-white border-b px-4 py-3">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          
          {/* Desktop Loading */}
          <div className="hidden md:flex min-h-screen items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
          
          {/* Mobile Loading */}
          <div className="md:hidden p-4">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <ClinicianSkeleton key={i} />
              ))}
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
              <div>
                <h1 className="font-bold text-lg">Clinicians</h1>
                <p className="text-xs text-gray-500">{clinicians.length} clinicians</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <svg 
                    className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={handleCreateClinician}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium active:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="container mx-auto px-6 py-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Clinician Management</h1>
                <p className="text-gray-600 mt-2">
                  Manage clinician accounts and their permissions
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <svg 
                    className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </Button>
                <Button onClick={handleCreateClinician}>
                  Create New Clinician
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          {/* Mobile Clinicians List */}
          <div className="md:hidden">
            {clinicians.length === 0 ? (
              <div className="bg-white rounded-xl border p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Clinicians Found</h3>
                <p className="text-gray-600 mb-6">
                  Create the first clinician account to get started
                </p>
                <button
                  onClick={handleCreateClinician}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium active:bg-blue-700 transition-colors"
                >
                  Create First Clinician
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {clinicians.map(clinician => (
                  <div
                    key={clinician.id}
                    className="bg-white rounded-xl border shadow-sm overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {clinician.profilePicture ? (
                            <img
                              src={clinician.profilePicture}
                              alt={clinician.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {clinician.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold truncate">{clinician.name}</h3>
                            <p className="text-sm text-gray-600 truncate">{clinician.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          clinician.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {clinician.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Clinic:</span>
                          <span className="font-medium truncate max-w-[120px]">
                            {clinician.clinicName || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Specialization:</span>
                          <span className="font-medium">{clinician.specialization || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Patients:</span>
                          <span className="font-medium">{clinician.patients?.length || 0}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <button
                          onClick={() => handleViewClinician(clinician.id)}
                          className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditClinician(clinician.id)}
                          className="flex-1 py-2 px-3 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 active:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Clinicians Grid */}
          <div className="hidden md:block">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Clinicians ({clinicians.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {clinicians.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium mb-2">No Clinicians Found</h3>
                    <p className="text-gray-600 mb-6">
                      Create the first clinician account to get started
                    </p>
                    <Button onClick={handleCreateClinician} size="lg">
                      Create First Clinician
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clinicians.map(clinician => (
                      <div
                        key={clinician.id}
                        className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group"
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {clinician.profilePicture ? (
                                <img
                                  src={clinician.profilePicture}
                                  alt={clinician.name}
                                  className="w-12 h-12 rounded-full"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                  <span className="text-white font-medium text-lg">
                                    {clinician.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg truncate">{clinician.name}</h3>
                                <p className="text-sm text-gray-600 truncate">{clinician.email}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              clinician.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {clinician.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Clinic:</span>
                              <span className="font-medium">{clinician.clinicName || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Specialization:</span>
                              <span className="font-medium">{clinician.specialization || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">License:</span>
                              <span className="font-medium">{clinician.licenseNumber || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Patients:</span>
                              <span className="font-medium">{clinician.patients?.length || 0}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleViewClinician(clinician.id)}
                            >
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEditClinician(clinician.id)}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleProtectedLayout>
  );
}