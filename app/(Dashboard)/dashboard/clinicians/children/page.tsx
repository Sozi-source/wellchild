"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { SearchBar } from '@/app/components/common/SearchBar';
import { useAuth } from '@/app/context/AuthContext';
import * as AppServices from '@/app/services/app.services';
import type { HealthcarePatient } from '@/app/types/app.types';

export default function ClinicianChildrenPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<HealthcarePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (userProfile) {
      loadPatients();
    }
  }, [userProfile]);

  const loadPatients = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      const response = await AppServices.getClinicianPatients(userProfile.uid);
      
      let filtered = response.items;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(patient => 
          patient.name.toLowerCase().includes(term) ||
          patient.medicalRecordNumber.toLowerCase().includes(term)
        );
      }
      
      setPatients(filtered);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChild = () => {
    router.push('/clinician/children/new');
  };

  const handleViewChild = (patientId: string) => {
    router.push(`/clinician/children/${patientId}`);
  };

  if (loading) {
    return (
      <RoleProtectedLayout allowedRoles={['clinician']}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </RoleProtectedLayout>
    );
  }

  return (
    <RoleProtectedLayout allowedRoles={['clinician']}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Children</h1>
            <p className="text-gray-600 mt-2">
              All children under your clinical care
            </p>
          </div>
          <Button onClick={handleRegisterChild}>
            Enroll New Child
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <SearchBar
              placeholder="Search children by name or MR number..."
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={loadPatients}
            />
          </CardContent>
        </Card>

        {/* Children Grid */}
        {patients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-5xl mb-4">👶</div>
              <h3 className="text-xl font-medium mb-2">No Children Enrolled</h3>
              <p className="text-gray-600 mb-6">
                Start by enrolling your first child patient
              </p>
              <Button onClick={handleRegisterChild}>
                Enroll First Child
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map(patient => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{patient.name}</h3>
                      <p className="text-sm text-gray-600">
                        MR#: {patient.medicalRecordNumber}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      patient.growthStatus === 'normal' ? 'bg-green-100 text-green-800' :
                      patient.growthStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {patient.growthStatus}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Age:</span>
                      <span>{AppServices.calculateAgeString(patient.dob)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sex:</span>
                      <span>{patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Guardians:</span>
                      <span>{patient.guardianIds.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Visit:</span>
                      <span>{patient.lastCheckup ? AppServices.formatDate(patient.lastCheckup) : 'Never'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewChild(patient.id)}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/clinician/children/${patient.id}/medical`)}
                    >
                      Medical
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RoleProtectedLayout>
  );
}