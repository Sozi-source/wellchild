// /dashboard/admin/users/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/app/components/layout/DashBoardHeader';
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
  Calendar, Clock, MapPin, FileText, BarChart3
} from 'lucide-react';

// Use UserRole from AuthContext (should match AppTypes.UserRole)
type UserRole = 'admin' | 'clinician' | 'guardian';

// Update AdminUser interface to match AppTypes.UserProfile
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

// Helper to safely extract date
const safeToDate = (dateValue: any): Date | undefined => {
  if (!dateValue) return undefined;
  try {
    if (dateValue?.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'number') return new Date(dateValue);
    
    const date = new Date(dateValue);
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
  const [stats, setStats] = useState({
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
    systemHealth: 'good' as 'good' | 'warning' | 'critical'
  });
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if current user is admin
      if (!currentUserProfile || currentUserProfile.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Get all users using the service function
      const response = await AppServices.getAllUsers({ limit: 1000 });
      console.log('Service response type:', typeof response, response);

      let userItems: any[] = [];
      
      // SAFE response handling with proper type checking
      if (response && typeof response === 'object') {
        // First check if it's an ApiResponse
        if ('success' in response && 'timestamp' in response) {
          const apiResponse = response as unknown as AppTypes.ApiResponse<any>;
          if (apiResponse.success && apiResponse.data) {
            // Handle data from ApiResponse
            const data = apiResponse.data;
            if (Array.isArray(data)) {
              userItems = data;
              console.log('Extracted array from ApiResponse.data:', userItems.length);
            } else if (data && typeof data === 'object') {
              // Check if data is PaginatedResponse
              if ('items' in data && Array.isArray(data.items)) {
                userItems = data.items;
                console.log('Extracted items from PaginatedResponse in ApiResponse:', userItems.length);
              } else {
                // Try to extract user data from object
                userItems = [data];
                console.log('Wrapped single object in array:', userItems.length);
              }
            }
          } else {
            console.warn('ApiResponse was not successful or has no data:', apiResponse);
          }
        } 
        // Check if it's a PaginatedResponse directly
        else if ('items' in response && Array.isArray(response.items)) {
          userItems = response.items;
          console.log('Extracted items from direct PaginatedResponse:', userItems.length);
        }
        // Check if response itself is an array
        else if (Array.isArray(response)) {
          userItems = response;
          console.log('Response is direct array:', userItems.length);
        }
        // Check if it's a DocumentSnapshot or similar
        else if ('data' in response && typeof response.data === 'function') {
          try {
            const data = (response as any).data();
            if (data && typeof data === 'object') {
              userItems = [data];
              console.log('Extracted data from DocumentSnapshot:', userItems.length);
            }
          } catch (error) {
            console.error('Error extracting data from DocumentSnapshot:', error);
          }
        }
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        userItems = response;
        console.log('Response is directly an array:', userItems.length);
      } else {
        console.warn('Unexpected response format:', response);
      }

      // If no items found, try to extract from any possible structure
      if (userItems.length === 0 && response) {
        console.log('Attempting fallback extraction...');
        // Try to stringify and parse to find arrays
        try {
          const responseStr = JSON.stringify(response);
          const parsed = JSON.parse(responseStr);
          
          // Look for arrays in the parsed object
          if (Array.isArray(parsed)) {
            userItems = parsed;
          } else if (parsed && typeof parsed === 'object') {
            // Search for any array property
            for (const key in parsed) {
              if (Array.isArray(parsed[key])) {
                userItems = parsed[key];
                console.log('Found array in property:', key, userItems.length);
                break;
              }
            }
          }
        } catch (error) {
          console.error('Fallback extraction failed:', error);
        }
      }

      console.log('Final user items count:', userItems.length);

            // Map to AdminUser with proper type handling
      const adminUsers: AdminUser[] = userItems
        .map((item: any, index: number): AdminUser | null => {
          try {
            let userData = item;
            
            // If it's a document snapshot with data method
            if (item && typeof item === 'object' && 'data' in item && typeof item.data === 'function') {
              userData = item.data();
            }
            
            // If it's already a UserProfile type
            if (item && typeof item === 'object' && 'uid' in item) {
              userData = item;
            }

            // Ensure we have valid data
            if (!userData || typeof userData !== 'object') {
              console.warn('Invalid user data at index', index, item);
              return null;
            }

            // Map role - ensure it matches UserRole type
            let userRole: UserRole = 'guardian'; // default
            if (userData.role) {
              const roleStr = userData.role.toString().toLowerCase();
              if (roleStr === 'clinician' || roleStr === 'doctor' || roleStr === 'physician') {
                userRole = 'clinician';
              } else if (roleStr === 'admin' || roleStr === 'administrator') {
                userRole = 'admin';
              } else if (roleStr === 'guardian' || roleStr === 'caregiver' || roleStr === 'family') {
                userRole = 'guardian';
              }
            }

            // Extract user data with fallbacks
            const userId = userData.id || userData.uid || userData.userId || `user-${Date.now()}-${index}`;
            const userName = userData.name || userData.displayName || userData.fullName || userData.email?.split('@')[0] || 'Unnamed User';
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
          } catch (itemError) {
            console.error('Error processing user item at index', index, itemError, item);
            return null;
          }
        })
        .filter((user): user is AdminUser => user !== null);

            

      console.log('Loaded admin users:', adminUsers.length);
      console.log('Sample user:', adminUsers[0]);

      setAllUsers(adminUsers);

      // Calculate stats
      const total = adminUsers.length;
      const clinicians = adminUsers.filter(u => u.role === 'clinician').length;
      const guardians = adminUsers.filter(u => u.role === 'guardian').length;
      const admins = adminUsers.filter(u => u.role === 'admin').length;
      const active = adminUsers.filter(u => u.isActive && !u.isDeleted).length;
      const inactive = adminUsers.filter(u => !u.isActive && !u.isDeleted).length;
      const deleted = adminUsers.filter(u => u.isDeleted).length;

      // Get recent users (non-deleted, sorted by creation date)
      const recent = adminUsers
        .filter(u => !u.isDeleted)
        .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
        .slice(0, 5);
      setRecentUsers(recent);

      // Get admin dashboard stats
      try {
        const adminStats = await AppServices.getAdminDashboardStats();
        console.log('Admin stats received:', adminStats);
        
        // Use the stats from service, fallback to our calculations
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
      } catch (statsError) {
        console.log('Using fallback stats:', statsError);
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
      console.error('Error loading dashboard:', error);
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

  // Load data on component mount
  useEffect(() => {
    if (currentUserProfile && currentUserProfile.role === 'admin') {
      loadDashboardData();
    } else if (currentUserProfile) {
      // If user is logged in but not admin, show error
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
    } else {
      router.push(`/dashboard/admin/users/${userId}`);
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
    } catch (exportError) {
      console.error('Export error:', exportError);
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
      case 'admin': return <Shield className="h-5 w-5" />;
      case 'clinician': return <Stethoscope className="h-5 w-5" />;
      case 'guardian': return <Heart className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
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

  // Check if user is authorized
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
      <DashboardHeader
  title="User Management"
  subtitle="Manage clinicians, guardians, and administrators"
  actions={
    <div className="flex items-center space-x-4">
      {/* Search input */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search users"
        />
      </div>
      
      {/* Buttons */}
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          onClick={refreshData}
          disabled={loading}
          className="min-w-[120px]"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
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
          <span className="hidden sm:inline">Create User</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  }
/>
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Error Display */}
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border hover:border-teal-300" 
              onClick={() => handleRoleSelect('clinician')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleRoleSelect('clinician')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Clinicians</p>
                    <p className="text-2xl font-bold text-teal-600">{stats.clinicians}</p>
                    <p className="text-xs text-gray-500">Medical professionals</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t px-6 py-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-gray-600">View clinicians</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardFooter>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border hover:border-sky-300" 
              onClick={() => handleRoleSelect('guardian')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleRoleSelect('guardian')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Guardians</p>
                    <p className="text-2xl font-bold text-sky-600">{stats.guardians}</p>
                    <p className="text-xs text-gray-500">Patient caregivers</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-sky-600" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t px-6 py-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-gray-600">View guardians</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardFooter>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border hover:border-blue-300" 
              onClick={handleViewAllUsers}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleViewAllUsers()}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">All Users</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-gray-500">{stats.active} active</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t px-6 py-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-gray-600">View all users</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardFooter>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border hover:border-emerald-300" 
              onClick={handleCreateUser}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateUser()}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Add New User</p>
                    <p className="text-2xl font-bold text-emerald-600">+</p>
                    <p className="text-xs text-gray-500">Create new account</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t px-6 py-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-gray-600">Create user</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card 
              className="cursor-pointer hover:border-indigo-300"
              onClick={() => router.push('/dashboard/admin/users/admins')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Administrators</p>
                    <p className="text-2xl font-bold text-indigo-600">{stats.admins}</p>
                    <p className="text-xs text-gray-500">System administrators</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-purple-300"
              onClick={() => router.push('/dashboard/admin/settings/invitations')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Invites</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.pendingInvites}</p>
                    <p className="text-xs text-gray-500">Awaiting acceptance</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-amber-300"
              onClick={() => router.push('/dashboard/admin/activity')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Recent Activity</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.recentActivity}</p>
                    <p className="text-xs text-gray-500">Last 7 days</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-gray-500" />
                  Select User Type
                </CardTitle>
                <CardDescription>Manage specific user groups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { 
                    role: 'clinician' as UserRole, 
                    icon: Stethoscope, 
                    color: 'teal', 
                    description: 'medical professionals',
                    statsKey: 'clinicians',
                    route: () => handleRoleSelect('clinician')
                  },
                  { 
                    role: 'guardian' as UserRole, 
                    icon: Heart, 
                    color: 'sky', 
                    description: 'caregivers',
                    statsKey: 'guardians',
                    route: () => handleRoleSelect('guardian')
                  },
                  { 
                    role: 'admin' as UserRole, 
                    icon: Shield, 
                    color: 'blue', 
                    description: 'system admins',
                    statsKey: 'admins',
                    route: () => router.push('/dashboard/admin/users/admins')
                  },
                ].map(({ role, icon: Icon, color, description, statsKey, route }) => (
                  <div 
                    key={role}
                    className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all hover:border-${color}-300`}
                    onClick={route}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && route()}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`h-12 w-12 rounded-lg ${color === 'teal' ? 'bg-teal-100' : color === 'sky' ? 'bg-sky-100' : 'bg-blue-100'} flex items-center justify-center`}>
                          <Icon className={`h-6 w-6 ${color === 'teal' ? 'text-teal-600' : color === 'sky' ? 'text-sky-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold capitalize">{role}s</h3>
                          <p className="text-sm text-gray-600">
                            {stats[statsKey as keyof typeof stats]} {description}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(true)}`}>
                              <TrendingUp className="h-3 w-3 inline mr-1" />
                              {role === 'admin' ? 'All active' : `${stats.active} active`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleCreateUser} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New User
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-gray-500" />
                      {searchTerm ? 'Search Results' : 'Recent Users'}
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      {searchTerm ? (
                        <>
                          <FileText className="h-4 w-4 mr-1" />
                          {filteredUsers.length} results for "{searchTerm}"
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4 mr-1" />
                          Recently added users
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleViewAllUsers}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {searchTerm ? 'No matching users' : 'No users found'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm ? 'Try different search terms' : 'Create your first user'}
                    </p>
                    <Button onClick={handleCreateUser}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                        onClick={() => handleViewUser(user.id, user.role)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleViewUser(user.id, user.role)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                              {user.profilePicture ? (
                                <img 
                                  src={user.profilePicture} 
                                  alt={user.name} 
                                  className="h-10 w-10 object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    const parent = (e.target as HTMLImageElement).parentElement;
                                    if (parent) {
                                      const fallback = document.createElement('span');
                                      fallback.className = 'font-medium text-gray-700';
                                      fallback.textContent = user.name.charAt(0).toUpperCase();
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                              ) : (
                                <span className="font-medium text-gray-700">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium group-hover:text-blue-600 truncate">{user.name}</div>
                              <div className="text-sm text-gray-600 flex items-center truncate">
                                <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full flex items-center ${getRoleColor(user.role)}`}>
                                  {getRoleIcon(user.role)}
                                  <span className="ml-1 capitalize">{user.role}</span>
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full flex items-center ${getStatusColor(user.isActive)}`}>
                                  {user.isActive ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {user.isVerified && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-xs text-gray-500 mb-1">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {formatDate(user.createdAt)}
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                          </div>
                        </div>
                        
                        {/* Additional user info */}
                        {(user.phone || user.clinicName || user.address) && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                              {user.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {user.phone}
                                </div>
                              )}
                              {user.clinicName && (
                                <div className="flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  <span className="truncate max-w-[150px]">{user.clinicName}</span>
                                </div>
                              )}
                              {user.address && (
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span className="truncate max-w-[150px]">{user.address}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer hover:border-blue-300 transition-colors"
              onClick={handleExportData}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleExportData()}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Download className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Export Data</h3>
                    <p className="text-sm text-gray-600">Download user list as CSV</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-teal-300 transition-colors"
              onClick={() => router.push('/dashboard/admin/settings/invitations')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && router.push('/dashboard/admin/settings/invitations')}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Invitations</h3>
                    <p className="text-sm text-gray-600">{stats.pendingInvites} pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-amber-300 transition-colors"
              onClick={() => router.push('/dashboard/admin/activity')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && router.push('/dashboard/admin/activity')}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Activity Logs</h3>
                    <p className="text-sm text-gray-600">{stats.recentActivity} recent actions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card className={`mt-8 border ${
            stats.systemHealth === 'good' 
              ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
              : stats.systemHealth === 'warning'
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
              : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <UserCog className="h-5 w-5 mr-2" />
                    System Status
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">User management overview</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                      <div className="text-xs text-gray-600 mt-1">Total Users</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
                      <div className="text-xs text-gray-600 mt-1">Active</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
                      <div className="text-xs text-gray-600 mt-1">Inactive</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-gray-600">{stats.deleted}</div>
                      <div className="text-xs text-gray-600 mt-1">Archived</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="text-xs flex items-center">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className={`h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm ml-6 ${
                  stats.systemHealth === 'good' ? 'text-emerald-600' : 
                  stats.systemHealth === 'warning' ? 'text-amber-600' : 
                  'text-red-600'
                }`}>
                  <UserCog className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleProtectedLayout>
  );
}