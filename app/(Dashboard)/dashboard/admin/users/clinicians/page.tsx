// /dashboard/admin/users/clinicians/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import * as AppServices from '@/app/services/app.services';
import type { UserProfile } from '@/app/types/app.types';
import { Users, UserPlus, RefreshCw, Building2, Stethoscope, Filter } from 'lucide-react';

export default function AdminCliniciansPage() {
  const router = useRouter();
  const [clinicians, setClinicians] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Load clinicians
  const loadClinicians = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await AppServices.getUsersByRole('clinician');
      
      if (response && response.items) {
        setClinicians(response.items);
      }
      
    } catch (error) {
      console.error('Error loading clinicians:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClinicians();
  }, []);

  // Calculate stats
  const calculateStats = () => {
    const total = clinicians.length;
    const active = clinicians.filter(c => c.isActive).length;
    const inactive = clinicians.filter(c => !c.isActive).length;
    const totalPatients = clinicians.reduce((sum, clinician) => 
      sum + (clinician.patients?.length || 0), 0
    );
    const avgPatients = total > 0 ? Math.round(totalPatients / total) : 0;

    return { total, active, inactive, avgPatients };
  };

  // Filter clinicians based on search and status
  const getFilteredClinicians = () => {
    let filtered = clinicians;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(clinician =>
        clinician.name?.toLowerCase().includes(term) ||
        clinician.email?.toLowerCase().includes(term) ||
        clinician.clinicName?.toLowerCase().includes(term) ||
        clinician.specialization?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(clinician => clinician.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(clinician => !clinician.isActive);
      }
    }
    
    return filtered;
  };

  // Navigation handlers
  const handleViewClinician = (clinicianId: string) => {
    router.push(`/dashboard/admin/users/clinicians/${clinicianId}`);
  };

  const handleCreateClinician = () => {
    router.push('/dashboard/admin/users/new?role=clinician');
  };

  const handleEditClinician = (clinicianId: string) => {
    router.push(`/dashboard/admin/users/${clinicianId}/edit`);
  };

  const handleRefresh = () => {
    loadClinicians(true);
  };

  const filteredClinicians = getFilteredClinicians();
  const stats = calculateStats();

  // Loading state
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clinician Management</h1>
                <p className="text-gray-600 mt-1">Manage clinician accounts and their permissions</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 text-sm"
                >
                  <RefreshCw className={`h-4 w-4 text-sm ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={handleCreateClinician}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Clinician
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clinicians</p>
                    <p className="text-2xl font-bold mt-1">{stats.total}</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold mt-1">{stats.active}</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Stethoscope className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inactive</p>
                    <p className="text-2xl font-bold mt-1">{stats.inactive}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Patients</p>
                    <p className="text-2xl font-bold mt-1">{stats.avgPatients}</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search clinicians by name, email, specialization..."
                      className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg
                      className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      className="px-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinicians List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                All Clinicians ({filteredClinicians.length})
                <span className="text-sm font-normal text-gray-500 ml-2">
                  Showing {filteredClinicians.length} of {clinicians.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredClinicians.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {clinicians.length === 0 ? 'No Clinicians Found' : 'No Matching Clinicians'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {clinicians.length === 0
                      ? 'Create the first clinician account to get started'
                      : 'Try adjusting your search or filters'
                    }
                  </p>
                  {clinicians.length === 0 && (
                    <Button
                      onClick={handleCreateClinician}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Clinician
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClinicians.map(clinician => (
                    <div
                      key={clinician.id}
                      className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {clinician.profilePicture ? (
                              <img
                                src={clinician.profilePicture}
                                alt={clinician.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <span className="text-white font-medium text-lg">
                                  {clinician.name?.charAt(0) || 'C'}
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
                            <span className="font-medium truncate max-w-[150px]">
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
    </RoleProtectedLayout>
  );
}