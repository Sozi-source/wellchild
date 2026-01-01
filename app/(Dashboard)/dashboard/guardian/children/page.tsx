"use client";

import React, { useState, useEffect } from 'react';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { useAuth } from '@/app/context/AuthContext';
import * as AppServices from '@/app/services/app.services';
import type { HealthcarePatient } from '@/app/types/app.types';

export default function GuardianChildrenPage() {
  const { userProfile } = useAuth();
  const [children, setChildren] = useState<HealthcarePatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      loadChildren();
    }
  }, [userProfile]);

  const loadChildren = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      const response = await AppServices.getGuardianPatients(userProfile.uid);
      setChildren(response.items);
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RoleProtectedLayout allowedRoles={['guardian']}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </RoleProtectedLayout>
    );
  }

  return (
    <RoleProtectedLayout allowedRoles={['guardian']}>
      <div className="container mx-auto px-4 py-8 mt-5">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Children</h1>
        
        {children.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-5xl mb-4">👶</div>
              <h3 className="text-xl font-medium mb-2">No Children Assigned</h3>
              <p className="text-gray-600 mb-6">
                Children will appear here once a clinician enrolls them and invites you.
              </p>
              <Button onClick={() => window.location.href = '/guardian/invitations'}>
                Check Invitations
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map(child => (
              <Card key={child.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{child.name}</h3>
                      <p className="text-sm text-gray-600">
                        {AppServices.calculateAgeString(child.dob)} • {child.sex.charAt(0).toUpperCase() + child.sex.slice(1)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">MR#:</span>
                      <span>{child.medicalRecordNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Growth Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        child.growthStatus === 'normal' ? 'bg-green-100 text-green-800' :
                        child.growthStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {child.growthStatus}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Checkup:</span>
                      <span>{child.lastCheckup ? AppServices.formatDate(child.lastCheckup) : 'Never'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Clinicians:</span>
                      <span>{child.clinicianIds.length}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.href = `/guardian/children/${child.id}`}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleProtectedLayout>
  );
}