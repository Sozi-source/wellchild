"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { useAuth, UserRole as AuthUserRole } from '@/app/context/AuthContext';
import * as AppServices from '@/app/services/app.services';
import type * as AppTypes from '@/app/types/app.types';
import {
  Users, UserPlus, Shield, Stethoscope, Heart, Search,
  ChevronRight, Mail, CheckCircle, XCircle, Download,
  RefreshCw, UserCog, Activity, Bell, Building,
  AlertCircle, Phone, TrendingUp, Eye, Filter,
  Calendar, Clock, MapPin, FileText, BarChart3,
  MoreVertical
} from 'lucide-react';

type UserRole = 'admin' | 'clinician' | 'guardian';

interface AdminUser {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isDeleted?: boolean;
  isVerified?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
  profilePicture?: string;
  phone?: string;
  address?: string;
  clinicName?: string;
  patients?: string[];
  specialization?: string;
  licenseNumber?: string;
}

interface DashboardStats {
  total: number;
  clinicians: number;
  guardians: number;
  admins: number;
  active: number;
  inactive: number;
  deleted: number;
  recentActivity: number;
  pendingInvites: number;
  totalPatients: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

const safeToDate = (dateValue: unknown): Date | undefined => {
  if (!dateValue) return undefined;
  try {
    if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue && typeof (dateValue as any).toDate === 'function') {
      return (dateValue as any).toDate();
    }
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'number') return new Date(dateValue);
    
    const date = new Date(String(dateValue));
    return !isNaN(date.getTime()) ? date : undefined;
  } catch {
    return undefined;
  }
};

export default function AdminUsersPage() {
  const { userProfile: currentUserProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    clinicians: 0,
    guardians: 0,
    admins: 0,
    active: 0,
    inactive: 0,
    deleted: 0,
    recentActivity: 0,
    pendingInvites: 0,
    totalPatients: 0,
    systemHealth: 'good'
  });
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showMobileActions, setShowMobileActions] = useState(false);

  const extractUsersFromResponse = (response: unknown): any[] => {
    let userItems: any[] = [];
    
    if (!response || typeof response !== 'object') {
      return userItems;
    }

    const apiResponse = response as AppTypes.ApiResponse<any>;
    if ('success' in apiResponse && 'timestamp' in apiResponse) {
      if (apiResponse.success && apiResponse.data) {
        const data = apiResponse.data;
        if (Array.isArray(data)) {
          userItems = data;
        } else if (data && typeof data === 'object') {
          if ('items' in data && Array.isArray(data.items)) {
            userItems = data.items;
          } else {
            userItems = [data];
          }
        }
      }
    } else if ('items' in response && Array.isArray((response as any).items)) {
      userItems = (response as any).items;
    } else if (Array.isArray(response)) {
      userItems = response;
    }

    return userItems;
  };

  const mapUserItem = (item: any, index: number): AdminUser | null => {
    try {
      let userData = item;
      
      if (item && typeof item === 'object' && 'data' in item && typeof item.data === 'function') {
        userData = item.data();
      }
      
      if (!userData || typeof userData !== 'object') {
        return null;
      }

      let userRole: UserRole = 'guardian';
      if (userData.role) {
        const roleStr = String(userData.role).toLowerCase();
        if (roleStr === 'clinician' || roleStr === 'doctor' || roleStr === 'physician') {
          userRole = 'clinician';
        } else if (roleStr === 'admin' || roleStr === 'administrator') {
          userRole = 'admin';
        }
      }

      const userId = userData.id || userData.uid || userData.userId || `user-${Date.now()}-${index}`;
      const userName = userData.name || userData.displayName || userData.fullName || 
                      userData.email?.split('@')[0] || 'Unnamed User';
      const userEmail = userData.email || userData.userEmail || 'No email provided';
      
      return {
        id: userId,
        uid: userId,
        name: userName,
        email: userEmail,
        role: userRole,
        isActive: userData.isActive !== false,
        isDeleted: userData.isDeleted || false,
        isVerified: userData.isVerified || false,
        createdAt: safeToDate(userData.createdAt || userData.createdDate),
        lastLogin: safeToDate(userData.lastLogin || userData.lastSignInTime),
        profilePicture: userData.profilePicture || userData.photoURL || userData.avatar,
        phone: userData.phone || userData.phoneNumber || userData.mobile,
        address: userData.address || userData.location || userData.city,
        clinicName: userData.clinicName || userData.clinic || userData.hospital,
        patients: userData.patients || userData.assignedPatients || [],
        specialization: userData.specialization,
        licenseNumber: userData.licenseNumber,
      };
    } catch {
      return null;
    }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUserProfile || currentUserProfile.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      const response = await AppServices.getAllUsers({ limit: 1000 });
      const userItems = extractUsersFromResponse(response);

      const adminUsers: AdminUser[] = userItems
        .map(mapUserItem)
        .filter((user): user is AdminUser => user !== null);

      setAllUsers(adminUsers);

      const total = adminUsers.length;
      const clinicians = adminUsers.filter(u => u.role === 'clinician').length;
      const guardians = adminUsers.filter(u => u.role === 'guardian').length;
      const admins = adminUsers.filter(u => u.role === 'admin').length;
      const active = adminUsers.filter(u => u.isActive && !u.isDeleted).length;
      const inactive = adminUsers.filter(u => !u.isActive && !u.isDeleted).length;
      const deleted = adminUsers.filter(u => u.isDeleted).length;

      const recent = adminUsers
        .filter(u => !u.isDeleted)
        .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
        .slice(0, 5);
      setRecentUsers(recent);

      try {
        const adminStats = await AppServices.getAdminDashboardStats();
        setStats({
          total,
          clinicians: adminStats.totalClinicians || clinicians,
          guardians: adminStats.totalGuardians || guardians,
          admins: adminStats.totalAdmins || admins,
          active: adminStats.activeUsers || active,
          inactive: adminStats.inactiveUsers || inactive,
          deleted: adminStats.deletedUsers || deleted,
          recentActivity: adminStats.recentActivity || 0,
          pendingInvites: adminStats.pendingInvitations || 0,
          totalPatients: adminStats.totalPatients || 0,
          systemHealth: adminStats.systemHealth || 'good'
        });
      } catch {
        setStats({ 
          total, 
          clinicians, 
          guardians, 
          admins, 
          active, 
          inactive, 
          deleted, 
          recentActivity: 0, 
          pendingInvites: 0,
          totalPatients: 0,
          systemHealth: 'good'
        });
      }

    } catch (error: any) {
      setError(error.message || 'Failed to load user data. Please try again.');
      setStats({ 
        total: 0, 
        clinicians: 0, 
        guardians: 0, 
        admins: 0, 
        active: 0, 
        inactive: 0, 
        deleted: 0, 
        recentActivity: 0, 
        pendingInvites: 0,
        totalPatients: 0,
        systemHealth: 'good'
      });
      setAllUsers([]);
      setRecentUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserProfile]);

  useEffect(() => {
    if (currentUserProfile && currentUserProfile.role === 'admin') {
      loadDashboardData();
    } else if (currentUserProfile) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
    }
  }, [currentUserProfile, loadDashboardData]);

  const handleRoleSelect = (role: UserRole) => {
    if (role === 'admin') {
      router.push('/dashboard/admin/users/admins');
    } else {
      router.push(`/dashboard/admin/users/${role}s`);
    }
  };

  const handleViewAllUsers = () => {
    router.push('/dashboard/admin/users/all');
  };

  const handleCreateUser = () => {
    router.push('/dashboard/admin/users/new');
  };

  const handleViewUser = (userId: string, role: UserRole) => {
    if (role === 'clinician') {
      router.push(`/dashboard/admin/users/clinicians/${userId}`);
    } else if (role === 'guardian') {
      router.push(`/dashboard/admin/users/guardians/${userId}`);
    } else if (role === 'admin') {
      router.push(`/dashboard/admin/users/admins/${userId}`);
    }
  };

  const handleExportData = async () => {
    if (allUsers.length === 0) {
      setError('No data to export');
      return;
    }

    try {
      const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Phone', 'Clinic', 'Created At', 'Last Login'];
      const csv = [
        headers.join(','),
        ...allUsers.map(u => [
          u.id,
          `"${(u.name || '').replace(/"/g, '""')}"`,
          u.email,
          u.role,
          u.isActive ? 'Active' : 'Inactive',
          u.phone || 'N/A',
          u.clinicName ? `"${u.clinicName.replace(/"/g, '""')}"` : 'N/A',
          u.createdAt ? u.createdAt.toISOString().split('T')[0] : 'N/A',
          u.lastLogin ? u.lastLogin.toISOString().split('T')[0] : 'Never'
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export data');
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: diffDays > 365 ? 'numeric' : undefined 
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'clinician': return <Stethoscope className="h-4 w-4" />;
      case 'guardian': return <Heart className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'clinician': return 'bg-teal-100 text-teal-800';
      case 'guardian': return 'bg-sky-100 text-sky-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800';
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return recentUsers;
    const term = searchTerm.toLowerCase();
    return allUsers.filter(user =>
      !user.isDeleted &&
      (user.name?.toLowerCase().includes(term) ||
       user.email?.toLowerCase().includes(term) ||
       user.role?.toLowerCase().includes(term) ||
       user.clinicName?.toLowerCase().includes(term) ||
       user.phone?.toLowerCase().includes(term))
    ).slice(0, 5);
  }, [searchTerm, recentUsers, allUsers]);

  const refreshData = () => {
    setError(null);
    loadDashboardData();
  };

  if (loading) {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <LoadingSpinner size="lg" />
          <span className="mt-4 text-gray-600">Loading user management dashboard...</span>
        </div>
      </RoleProtectedLayout>
    );
  }

  if (currentUserProfile?.role !== 'admin') {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">Admin privileges are required to access this page.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </RoleProtectedLayout>
    );
  }

  return (
    <RoleProtectedLayout allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Mobile Header */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-600 mt-1">Manage users and roles</p>
              </div>
              <Button 
                onClick={handleCreateUser} 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search users"
              />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Button 
                variant="outline" 
                onClick={refreshData}
                disabled={loading}
                size="sm"
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="ml-2">{loading ? 'Refreshing' : 'Refresh'}</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowMobileActions(!showMobileActions)}
                size="sm"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            
            {showMobileActions && (
              <div className="mb-4 p-3 bg-white rounded-lg border shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    disabled={allUsers.length === 0}
                    size="sm"
                    className="justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleViewAllUsers}
                    size="sm"
                    className="justify-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">Manage clinicians, guardians, and administrators</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search users"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={refreshData}
                    disabled={loading}
                    className="min-w-[100px]"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing' : 'Refresh'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    disabled={allUsers.length === 0}
                    className="hidden sm:inline-flex"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    onClick={handleCreateUser} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                  <span className="text-red-800">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="ml-auto text-red-700 hover:text-red-800 hover:bg-red-100"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards - Mobile Optimized */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border hover:border-teal-300" 
              onClick={() => handleRoleSelect('clinician')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Clinicians</p>
                    <p className="text-xl sm:text-2xl font-bold text-teal-600">{stats.clinicians}</p>
                    <p className="text-xs text-gray-500 hidden sm:block">Medical professionals</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t px-4 sm:px-6 py-2 sm:py-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-gray-600">View</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                </div>
              </CardFooter>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border hover:border-sky-300" 
              onClick={() => handleRoleSelect('guardian')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Guardians</p>
                    <p className="text-xl sm:text-2xl font-bold text-sky-600">{stats.guardians}</p>
                    <p className="text-xs text-gray-500 hidden sm:block">Caregivers</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-sky-100 flex items-center justify-center">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-sky-600" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t px-4 sm:px-6 py-2 sm:py-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-gray-600">View</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                </div>
              </CardFooter>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border hover:border-blue-300 hidden sm:block" 
              onClick={handleViewAllUsers}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">All Users</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-gray-500 hidden sm:block">{stats.active} active</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t px-4 sm:px-6 py-2 sm:py-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-gray-600">View all</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                </div>
              </CardFooter>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border hover:border-emerald-300 hidden sm:block" 
              onClick={handleCreateUser}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Add User</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-600">+</p>
                    <p className="text-xs text-gray-500 hidden sm:block">Create account</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t px-4 sm:px-6 py-2 sm:py-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-gray-600">Create</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Secondary Stats - Mobile Collapsible */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Quick Stats</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/dashboard/admin/analytics')}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Details →
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <Card className="text-center">
                <CardContent className="p-3 sm:p-4">
                  <div className="text-lg sm:text-2xl font-bold text-indigo-600">{stats.admins}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Admins</div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-3 sm:p-4">
                  <div className="text-lg sm:text-2xl font-bold text-purple-600">{stats.pendingInvites}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Pending</div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-3 sm:p-4">
                  <div className="text-lg sm:text-2xl font-bold text-amber-600">{stats.recentActivity}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Activity</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content - Mobile Stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* User Types Card */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500" />
                  User Types
                </CardTitle>
                <CardDescription className="text-sm">Manage specific user groups</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { 
                      role: 'clinician' as UserRole, 
                      icon: Stethoscope, 
                      color: 'teal', 
                      statsKey: 'clinicians',
                    },
                    { 
                      role: 'guardian' as UserRole, 
                      icon: Heart, 
                      color: 'sky', 
                      statsKey: 'guardians',
                    },
                    { 
                      role: 'admin' as UserRole, 
                      icon: Shield, 
                      color: 'blue', 
                      statsKey: 'admins',
                    },
                  ].map(({ role, icon: Icon, color, statsKey }) => (
                    <div 
                      key={role}
                      className="p-3 sm:p-4 border rounded-lg cursor-pointer hover:shadow-sm transition-all active:scale-[0.98]"
                      onClick={() => handleRoleSelect(role)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-${color}-100 flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${color}-600`} />
                          </div>
                          <div>
                            <h3 className="font-semibold capitalize text-sm sm:text-base">{role}s</h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {stats[statsKey as keyof typeof stats]} {role === 'admin' ? 'admins' : role === 'clinician' ? 'doctors' : 'caregivers'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-4 sm:p-6 pt-0">
                <Button 
                  onClick={handleCreateUser} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New User
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Users Card */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500" />
                      {searchTerm ? 'Search Results' : 'Recent Users'}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {searchTerm ? `${filteredUsers.length} results` : 'Recently added'}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleViewAllUsers}
                    className="text-xs sm:text-sm"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">View All</span>
                    <span className="sm:hidden">All</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Users className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium mb-2">
                      {searchTerm ? 'No matches' : 'No users'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4">
                      {searchTerm ? 'Try different search' : 'Create first user'}
                    </p>
                    <Button onClick={handleCreateUser} size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {filteredUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer active:bg-gray-100 transition-colors"
                        onClick={() => handleViewUser(user.id, user.role)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              {user.profilePicture ? (
                                <img 
                                  src={user.profilePicture} 
                                  alt={user.name} 
                                  className="h-8 w-8 sm:h-10 sm:w-10 object-cover rounded-full"
                                />
                              ) : (
                                <span className="font-medium text-gray-700 text-xs sm:text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm sm:text-base truncate">{user.name}</div>
                              <div className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</div>
                              <div className="flex gap-1 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)} truncate`}>
                                  <span className="capitalize">{user.role}</span>
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(user.isActive)}`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end flex-shrink-0 ml-2">
                            <div className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDate(user.createdAt)}
                            </div>
                            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mt-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Status - Mobile Simplified */}
          <div className="mt-6 sm:mt-8">
            <Card className={`border ${
              stats.systemHealth === 'good' 
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
                : stats.systemHealth === 'warning'
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
                : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
            }`}>
              <CardContent className="p-4 sm:p-6">
                <div className="sm:flex items-center justify-between">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="font-semibold text-sm sm:text-base">System Status</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-white">
                        {stats.systemHealth === 'good' ? '✓ Good' : stats.systemHealth === 'warning' ? '⚠ Warning' : '✗ Critical'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                      <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
                        <div className="text-base sm:text-xl font-bold">{stats.total}</div>
                        <div className="text-xs text-gray-600">Total</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
                        <div className="text-base sm:text-xl font-bold text-emerald-600">{stats.active}</div>
                        <div className="text-xs text-gray-600">Active</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
                        <div className="text-base sm:text-xl font-bold text-red-600">{stats.inactive}</div>
                        <div className="text-xs text-gray-600">Inactive</div>
                      </div>
                      <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
                        <div className="text-base sm:text-xl font-bold text-gray-600">{stats.deleted}</div>
                        <div className="text-xs text-gray-600">Archived</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleProtectedLayout>
  );
}