"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import * as AppServices from '@/app/services/app.services';
import type { UserProfile } from '@/app/types/app.types';

export default function AdminGuardiansPage() {
  const router = useRouter();
  const [guardians, setGuardians] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuardians();
  }, []);

  const loadGuardians = async () => {
    try {
      setLoading(true);
      const response = await AppServices.getUsersByRole('guardian');
      setGuardians(response.items);
    } catch (error) {
      console.error('Error loading guardians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewGuardian = (guardianId: string) => {
    router.push(`/admin/guardians/${guardianId}`);
  };

  const handleCreateGuardian = () => {
    router.push('/admin/users/new?role=guardian');
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
            <h1 className="text-3xl font-bold text-gray-900">Guardian Management</h1>
            <p className="text-gray-600 mt-2">
              Manage guardian accounts and their assigned children
            </p>
          </div>
          <Button onClick={handleCreateGuardian}>
            Create New Guardian
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Guardians ({guardians.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {guardians.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-xl font-medium mb-2">No Guardians Found</h3>
                <p className="text-gray-600 mb-6">
                  Guardians are typically created when clinicians enroll children
                </p>
                <Button onClick={handleCreateGuardian}>
                  Create Guardian
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guardians.map(guardian => (
                  <Card key={guardian.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {guardian.profilePicture ? (
                            <img
                              src={guardian.profilePicture}
                              alt={guardian.name}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-lg text-green-600 font-medium">
                                {guardian.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold">{guardian.name}</h3>
                            <p className="text-sm text-gray-600">{guardian.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          guardian.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {guardian.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span>{guardian.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Children:</span>
                          <span>{guardian.patients?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Member since:</span>
                          <span>{AppServices.formatDate(guardian.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last login:</span>
                          <span>{guardian.lastLogin ? AppServices.formatDate(guardian.lastLogin) : 'Never'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewGuardian(guardian.id)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/admin/users/${guardian.id}/edit`)}
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