// "use client";

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
// import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
// import { Button } from '@/app/components/ui/Button';
// import LoadingSpinner from '@/app/components/common/LoadingSpinner';
// import * as AppServices from '@/app/services/app.services';
// import type { UserProfile } from '@/app/types/app.types';

// export default function AdminGuardiansPage() {
//   const router = useRouter();
//   const [guardians, setGuardians] = useState<UserProfile[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadGuardians();
//   }, []);

//   const loadGuardians = async () => {
//     try {
//       setLoading(true);
//       const response = await AppServices.getUsersByRole('guardian');
//       setGuardians(response.items);
//     } catch (error) {
//       console.error('Error loading guardians:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewGuardian = (guardianId: string) => {
//     router.push(`/dashboard/admin/users/guardians/${guardianId}`);
//   };

//   const handleCreateGuardian = () => {
//     router.push('/dashboard/admin/users/new?role=guardian');
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

//   return (
//     <RoleProtectedLayout allowedRoles={['admin']}>
//       <div className="container mx-auto px-4 py-8 mt-5">
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Guardian Management</h1>
//             <p className="text-gray-600 mt-2">
//               Manage guardian accounts and their assigned children
//             </p>
//           </div>
//           <Button onClick={handleCreateGuardian}>
//             Create New Guardian
//           </Button>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>All Guardians ({guardians.length})</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {guardians.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="text-5xl mb-4">👥</div>
//                 <h3 className="text-xl font-medium mb-2">No Guardians Found</h3>
//                 <p className="text-gray-600 mb-6">
//                   Guardians are typically created when clinicians enroll children
//                 </p>
//                 <Button onClick={handleCreateGuardian}>
//                   Create Guardian
//                 </Button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {guardians.map(guardian => (
//                   <Card key={guardian.id} className="hover:shadow-lg transition-shadow">
//                     <CardContent className="pt-6">
//                       <div className="flex items-start justify-between mb-4">
//                         <div className="flex items-center gap-3">
//                           {guardian.profilePicture ? (
//                             <img
//                               src={guardian.profilePicture}
//                               alt={guardian.name}
//                               className="w-12 h-12 rounded-full"
//                             />
//                           ) : (
//                             <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
//                               <span className="text-lg text-green-600 font-medium">
//                                 {guardian.name.charAt(0)}
//                               </span>
//                             </div>
//                           )}
//                           <div>
//                             <h3 className="font-bold">{guardian.name}</h3>
//                             <p className="text-sm text-gray-600">{guardian.email}</p>
//                           </div>
//                         </div>
//                         <span className={`px-2 py-1 rounded text-xs font-medium ${
//                           guardian.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                         }`}>
//                           {guardian.isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </div>

//                       <div className="space-y-2 text-sm mb-4">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Phone:</span>
//                           <span>{guardian.phone || 'Not provided'}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Children:</span>
//                           <span>{guardian.patients?.length || 0}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Member since:</span>
//                           <span>{AppServices.formatDate(guardian.createdAt)}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Last login:</span>
//                           <span>{guardian.lastLogin ? AppServices.formatDate(guardian.lastLogin) : 'Never'}</span>
//                         </div>
//                       </div>

//                       <div className="flex gap-2 pt-4 border-t">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="flex-1"
//                           onClick={() => handleViewGuardian(guardian.id)}
//                         >
//                           View Details
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="flex-1"
//                           onClick={() => router.push(`/dashboard/admin/users/${guardian.id}/edit`)}
//                         >
//                           Edit
//                         </Button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </RoleProtectedLayout>
//   );
// }

// /dashboard/admin/users/guardians/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import * as AppServices from '@/app/services/app.services';
import type { UserProfile } from '@/app/types/app.types';
import { Users, UserPlus, RefreshCw, Shield, Filter, Phone, Mail } from 'lucide-react';

export default function AdminGuardiansPage() {
  const router = useRouter();
  const [guardians, setGuardians] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Load guardians
  const loadGuardians = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await AppServices.getUsersByRole('guardian');
      
      if (response && response.items) {
        setGuardians(response.items);
      }
      
    } catch (error) {
      console.error('Error loading guardians:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGuardians();
  }, []);

  // Calculate stats
  const calculateStats = () => {
    const total = guardians.length;
    const active = guardians.filter(g => g.isActive).length;
    const inactive = guardians.filter(g => !g.isActive).length;
    const totalPatients = guardians.reduce((sum, guardian) => 
      sum + (guardian.patients?.length || 0), 0
    );
    const avgPatients = total > 0 ? Math.round(totalPatients / total) : 0;

    return { total, active, inactive, avgPatients };
  };

  // Filter guardians based on search and status
  const getFilteredGuardians = () => {
    let filtered = guardians;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(guardian =>
        guardian.name?.toLowerCase().includes(term) ||
        guardian.email?.toLowerCase().includes(term) ||
        guardian.phone?.toLowerCase().includes(term) ||
        guardian.address?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(guardian => guardian.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(guardian => !guardian.isActive);
      }
    }
    
    return filtered;
  };

  // Navigation handlers
  const handleViewGuardian = (guardianId: string) => {
    router.push(`/dashboard/admin/users/guardians/${guardianId}`);
  };

  const handleCreateGuardian = () => {
    router.push('/dashboard/admin/users/new?role=guardian');
  };

  const handleEditGuardian = (guardianId: string) => {
    router.push(`/dashboard/admin/users/${guardianId}/edit`);
  };

  const handleRefresh = () => {
    loadGuardians(true);
  };

  const filteredGuardians = getFilteredGuardians();
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Guardian Management</h1>
                <p className="text-gray-600 mt-1">Manage guardian accounts and their associated patients</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={handleCreateGuardian}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Guardian
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
                    <p className="text-sm font-medium text-gray-600">Total Guardians</p>
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
                    <Shield className="h-6 w-6 text-green-600" />
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
                    <Users className="h-6 w-6 text-purple-600" />
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
                      placeholder="Search guardians by name, email, phone..."
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

          {/* Guardians List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                All Guardians ({filteredGuardians.length})
                <span className="text-sm font-normal text-gray-500 ml-2">
                  Showing {filteredGuardians.length} of {guardians.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredGuardians.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {guardians.length === 0 ? 'No Guardians Found' : 'No Matching Guardians'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {guardians.length === 0
                      ? 'Create the first guardian account to get started'
                      : 'Try adjusting your search or filters'
                    }
                  </p>
                  {guardians.length === 0 && (
                    <Button
                      onClick={handleCreateGuardian}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Guardian
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGuardians.map(guardian => (
                    <div
                      key={guardian.id}
                      className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {guardian.profilePicture ? (
                              <img
                                src={guardian.profilePicture}
                                alt={guardian.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                                <span className="text-white font-medium text-lg">
                                  {guardian.name?.charAt(0) || 'G'}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg truncate">{guardian.name}</h3>
                              <p className="text-sm text-gray-600 truncate">{guardian.email}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            guardian.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {guardian.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-2 text-sm mb-4">
                          {guardian.phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{guardian.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{guardian.email}</span>
                          </div>
                          {guardian.address && (
                            <div className="text-gray-600 truncate" title={guardian.address}>
                              📍 {guardian.address}
                            </div>
                          )}
                        </div>

                        {/* Patients Count */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-600">Patients:</div>
                            <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {guardian.patients?.length || 0} patient(s)
                            </div>
                          </div>
                          {guardian.isVerified && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Verified
                            </span>
                          )}
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
                            onClick={() => handleEditGuardian(guardian.id)}
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