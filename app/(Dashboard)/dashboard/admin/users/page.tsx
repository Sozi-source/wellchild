// app/dashboard/admin/users/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/app/components/layout/DashBoardHeader';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { useAuth } from '@/app/context/AuthContext';
import * as AppServices from '@/app/services/app.services';
import type * as AppTypes from '@/app/types/app.types';
import {
  Users,
  UserPlus,
  Shield,
  Stethoscope,
  Heart,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Calendar,
  Activity,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  SortAsc,
  SortDesc,
  Building,
  MapPin,
  Bell,
  AlertCircle,
  FileText,
  Baby,
  ArrowUpRight,
  Plus
} from 'lucide-react';

// Define local types that match your service responses
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AppTypes.UserRole;
  isActive: boolean;
  createdAt?: Date;
  lastLogin?: Date;
  profilePicture?: string;
  phone?: string;
  address?: string;
  clinicName?: string;
  patients?: string[];
  isDeleted?: boolean;
}

type UserRoleFilter = 'all' | 'clinician' | 'guardian' | 'admin';
type UserStatusFilter = 'all' | 'active' | 'inactive';

export default function AdminUsersPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'lastLogin'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    clinicians: 0,
    guardians: 0,
    admins: 0,
    active: 0,
    inactive: 0,
    deleted: 0
  });

  useEffect(() => {
    if (userProfile) {
      loadUsers();
    }
  }, [userProfile]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Use your existing service function
      const response = await AppServices.getAllUsers({ limit: 1000 });
      
      // Map service response to AdminUser type
      const adminUsers: AdminUser[] = response.items.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        profilePicture: user.profilePicture,
        phone: user.phone,
        address: user.address,
        clinicName: user.clinicName,
        patients: user.patients,
        isDeleted: user.isDeleted
      }));
      
      setUsers(adminUsers);
      setFilteredUsers(adminUsers);
      
      // Calculate stats correctly
      const stats = {
        total: adminUsers.length,
        clinicians: adminUsers.filter(u => u.role === 'clinician').length,
        guardians: adminUsers.filter(u => u.role === 'guardian').length,
        admins: adminUsers.filter(u => u.role === 'admin').length,
        active: adminUsers.filter(u => u.isActive && !u.isDeleted).length,
        inactive: adminUsers.filter(u => !u.isActive && !u.isDeleted).length,
        deleted: adminUsers.filter(u => u.isDeleted).length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = users.filter(user => !user.isDeleted); // Filter out deleted users by default

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.clinicName?.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(user => user.isActive);
      } else {
        result = result.filter(user => !user.isActive);
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = sortBy === 'name' ? a.name :
                    sortBy === 'createdAt' ? a.createdAt?.getTime() || 0 :
                    a.lastLogin?.getTime() || 0;
      
      const bValue = sortBy === 'name' ? b.name :
                    sortBy === 'createdAt' ? b.createdAt?.getTime() || 0 :
                    b.lastLogin?.getTime() || 0;
      
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      } else {
        return sortOrder === 'asc' 
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
    });

    setFilteredUsers(result);
  }, [users, searchQuery, roleFilter, statusFilter, sortBy, sortOrder]);

  const handleViewUser = (userId: string, role: string) => {
    router.push(`/dashboard/admin/users/${role}/${userId}`);
  };

  const handleCreateUser = () => {
    router.push('/dashboard/admin/users/new');
  };

  const handleEditUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/admin/users/edit/${userId}`);
  };

  const handleDeleteUser = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this user? This will mark them as deleted but preserve their data.')) {
      try {
        // Use the deleteUser function from your services
        await AppServices.deleteUser(userProfile?.uid || '', userId);
        
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isDeleted: true } : user
        ));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = !currentStatus;
      
      // Use the updateUserProfile function from your services
      await AppServices.updateUserProfile(userId, { isActive: newStatus });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: newStatus } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
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

  const getStatusText = (user: AdminUser) => {
    if (user.isDeleted) return 'Deleted';
    return user.isActive ? 'Active' : 'Inactive';
  };

  const getStatusColor = (user: AdminUser) => {
    if (user.isDeleted) return 'bg-gray-100 text-gray-800';
    return user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (user: AdminUser) => {
    if (user.isDeleted) return <XCircle className="h-4 w-4" />;
    return user.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner size="lg" />
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
          <Button 
            onClick={handleCreateUser}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        }
      />
      
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Clinicians</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.clinicians}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Guardians</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.guardians}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-sky-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Administrators</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.admins}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Inactive Users</p>
                    <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <UserX className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Deleted Users</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.deleted}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Controls */}
          <Card className="mb-8 bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or clinic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value as UserRoleFilter)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Administrators</option>
                      <option value="clinician">Clinicians</option>
                      <option value="guardian">Guardians</option>
                    </select>
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as UserStatusFilter)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSortBy('name');
                      setSortOrder('asc');
                      setSearchQuery('');
                      setRoleFilter('all');
                      setStatusFilter('all');
                    }}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <div className="flex gap-2">
                  {(['name', 'createdAt', 'lastLogin'] as const).map((field) => (
                    <Button
                      key={field}
                      variant={sortBy === field ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (sortBy === field) {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy(field);
                          setSortOrder('asc');
                        }
                      }}
                      className={sortBy === field ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300 hover:bg-gray-50"}
                    >
                      {field === 'name' && 'Name'}
                      {field === 'createdAt' && 'Join Date'}
                      {field === 'lastLogin' && 'Last Login'}
                      {sortBy === field && (
                        sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    User Management ({filteredUsers.length})
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {selectedUsers.length > 0 ? `${selectedUsers.length} selected` : 'Manage all system users'}
                  </CardDescription>
                </div>
                {selectedUsers.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{selectedUsers.length} selected</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        if (confirm(`Delete ${selectedUsers.length} selected users?`)) {
                          try {
                            for (const userId of selectedUsers) {
                              await AppServices.deleteUser(userProfile?.uid || '', userId);
                            }
                            setSelectedUsers([]);
                            loadUsers(); // Refresh the list
                          } catch (error) {
                            console.error('Error deleting users:', error);
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try adjusting your filters or search query'
                      : 'Get started by adding your first user'}
                  </p>
                  <Button
                    onClick={handleCreateUser}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="py-3 px-6 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          User
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Role & Details
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Contact & Activity
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => (
                        <tr 
                          key={user.id} 
                          className={`hover:bg-gray-50 transition-colors ${user.isDeleted ? 'opacity-60' : ''}`}
                          onClick={() => !user.isDeleted && handleViewUser(user.id, user.role)}
                        >
                          <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              disabled={user.isDeleted}
                            />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                {user.profilePicture ? (
                                  <img 
                                    src={user.profilePicture} 
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="font-medium text-gray-700">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">
                                  {user.createdAt ? `Joined ${formatDate(user.createdAt)}` : 'No join date'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                  {getRoleIcon(user.role)}
                                  <span className="ml-1.5 capitalize">{user.role}</span>
                                </span>
                              </div>
                              {user.clinicName && (
                                <div className="text-sm text-gray-600 flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  {user.clinicName}
                                </div>
                              )}
                              {user.patients && user.patients.length > 0 && (
                                <div className="text-sm text-gray-600">
                                  {user.patients.length} patient{user.patients.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user)}`}>
                              {getStatusIcon(user)}
                              <span className="ml-1.5">{getStatusText(user)}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-3 w-3 mr-2" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-3 w-3 mr-2" />
                                  {user.phone}
                                </div>
                              )}
                              {user.lastLogin && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="h-3 w-3 mr-2" />
                                  Last login: {formatDate(user.lastLogin)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                              {!user.isDeleted && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                                    onClick={() => handleViewUser(user.id, user.role)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                                    onClick={(e) => handleEditUser(user.id, e)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700"
                                    onClick={(e) => handleToggleStatus(user.id, user.isActive, e)}
                                    disabled={user.isDeleted}
                                  >
                                    {user.isActive ? (
                                      <UserX className="h-4 w-4" />
                                    ) : (
                                      <UserCheck className="h-4 w-4" />
                                    )}
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-red-50 text-red-600 hover:text-red-700"
                                onClick={(e) => handleDeleteUser(user.id, e)}
                                disabled={user.isDeleted}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {filteredUsers.length > 0 && (
                <div className="border-t border-gray-100 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing 1-{Math.min(filteredUsers.length, 10)} of {filteredUsers.length} users
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:bg-gray-50"
                        onClick={() => loadUsers()}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Download className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Export User Data</h3>
                    <p className="text-sm text-gray-600">Download user list as CSV</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border border-gray-200 hover:border-teal-300 cursor-pointer transition-colors"
              onClick={handleCreateUser}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Create New User</h3>
                    <p className="text-sm text-gray-600">Add clinician, guardian, or admin</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-amber-300 cursor-pointer transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">View Activity Logs</h3>
                    <p className="text-sm text-gray-600">Monitor user actions and system events</p>
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