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

  useEffect(() => {
    loadClinicians();
  }, []);

  const loadClinicians = async () => {
    try {
      setLoading(true);
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
    }
  };

  const handleViewClinician = (clinicianId: string) => {
    router.push(`/dashboard/admin/clinicians/${clinicianId}`);
  };

  const handleCreateClinician = () => {
    router.push('/dashboard/admin/users/new?role=clinician');
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

  return (
    <RoleProtectedLayout allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8 mt-5">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clinician Management</h1>
            <p className="text-gray-600 mt-2">
              Manage clinician accounts and their permissions
            </p>
          </div>
          <Button onClick={handleCreateClinician}>
            Create New Clinician
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
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
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Clinicians ({clinicians.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {clinicians.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👨‍⚕️</div>
                <h3 className="text-xl font-medium mb-2">No Clinicians Found</h3>
                <p className="text-gray-600 mb-6">
                  Create the first clinician account to get started
                </p>
                <Button onClick={handleCreateClinician}>
                  Create First Clinician
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clinicians.map(clinician => (
                  <Card key={clinician.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {clinician.profilePicture ? (
                            <img
                              src={clinician.profilePicture}
                              alt={clinician.name}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-lg text-blue-600 font-medium">
                                {clinician.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold">{clinician.name}</h3>
                            <p className="text-sm text-gray-600">{clinician.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          clinician.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {clinician.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Clinic:</span>
                          <span>{clinician.clinicName || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Specialization:</span>
                          <span>{clinician.specialization || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">License:</span>
                          <span>{clinician.licenseNumber || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Patients:</span>
                          <span>{clinician.patients?.length || 0}</span>
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
                          onClick={() => router.push(`/dashboard/admin/users/${clinician.id}/edit`)}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleProtectedLayout>
  );
}