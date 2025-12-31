// app/admin/users/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import Tabs from '@/app/components/common/Tabs';
import { StatsCard } from '@/app/components/common/StatsCard';
import { useAuth } from '@/app/context/AuthContext';
import * as AppServices from '@/app/types/app.types';

import type { UserProfile, HealthcarePatient } from '@/app/types/app.types';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Shield, 
  Activity, 
  Edit, 
  ArrowLeft,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  FileText,
  Clock,
  Building,
  Search
} from 'lucide-react';
import { formatDate } from '@/app/services/app.services';

export default function AdminUserDetailPage() {
  const { userProfile: currentUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userPatients, setUserPatients] = useState<HealthcarePatient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const userId = params.id as string;

  useEffect(() => {
    if (currentUser && userId) {
      loadUserData();
    }
  }, [userId, currentUser]);

  const loadUserData = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;

    try {
      setLoading(true);
      
      // Get user profile using available service
      const userData = await AppServices.getUserProfile(userId);
      if (!userData) {
        router.push('/admin/users');
        return;
      }
      setUser(userData);
      
      // Load user's patients based on role (using available services)
      if (userData.patients && userData.patients.length > 0) {
        await loadUserPatients(userData.patients);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPatients = async (patientIds: string[]) => {
    try {
      setLoadingPatients(true);
      const patients: HealthcarePatient[] = [];
      
      // Fetch each patient individually since we don't have getPatientsByIds
      for (const patientId of patientIds.slice(0, 20)) { // Limit to 20 patients
        try {
          const patient = await AppServices.getPatient(patientId);
          if (patient) {
            patients.push(patient);
          }
        } catch (error) {
          console.error(`Error loading patient ${patientId}:`, error);
        }
      }
      
      setUserPatients(patients);
    } catch (error) {
      console.error('Error loading user patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleToggleActive = async () => {
    if (!user || updating) return;
    
    try {
      setUpdating(true);
      await AppServices.updateUserProfile(userId, { isActive: !user.isActive });
      setUser({ ...user, isActive: !user.isActive });
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user status');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleVerified = async () => {
    if (!user || updating) return;
    
    try {
      setUpdating(true);
      await AppServices.updateUserProfile(userId, { isVerified: !user.isVerified });
      setUser({ ...user, isVerified: !user.isVerified });
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update verification status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user || !confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return;
    }
    
    // Note: You would need to add a deleteUser service function
    alert('Delete user functionality would be implemented here');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'clinician': return 'default';
      case 'guardian': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'clinician': return <User className="h-4 w-4" />;
      case 'guardian': return <Users className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="h-4 w-4" /> },
    { id: 'patients', label: `Patients (${userPatients.length})`, icon: <Users className="h-4 w-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Shield className="h-4 w-4" /> },
  ];

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'Never';
    return AppServices.formatDate(date);
  };

  const formatDateTime = (date: Date | string | undefined): string => {
    if (!date) return 'Never';
    return AppServices.formatDateTime(date);
  };

  // Calculate stats based on available data
  const calculateStats = () => {
    if (!user) return { totalPatients: 0, activePatients: 0 };
    
    const totalPatients = user.patients?.length || 0;
    const activePatients = userPatients.filter(p => p.status === 'active').length;
    
    return { totalPatients, activePatients };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </RoleProtectedLayout>
    );
  }

  if (!user) {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <Button onClick={() => router.push('/admin/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </div>
      </RoleProtectedLayout>
    );
  }

  return (
    <RoleProtectedLayout allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-6">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white shadow-lg flex items-center justify-center">
                        <span class="text-3xl text-white font-medium">
                          ${user.name.charAt(0)}
                        </span>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-3xl text-white font-medium">
                  {user.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <Badge variant={getRoleColor(user.role)} className="gap-1">
                  {getRoleIcon(user.role)}
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/users')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/users/${userId}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Patients"
            value={stats.totalPatients.toString()}
            description="Assigned patients"
            icon={<Users className="h-5 w-5" />}
          />
          <StatsCard
            title="Active Patients"
            value={stats.activePatients.toString()}
            description="Currently active"
            icon={<Activity className="h-5 w-5" />}
          />
          <StatsCard
            title="Account Status"
            value={user.isActive ? 'Active' : 'Inactive'}
            description={user.isActive ? 'Account is active' : 'Account is disabled'}
            icon={user.isActive ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
          />
          <StatsCard
            title="Verification"
            value={user.isVerified ? 'Verified' : 'Pending'}
            description={user.isVerified ? 'Account verified' : 'Needs verification'}
            icon={user.isVerified ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-yellow-500" />}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
          <Button
            variant={user.isActive ? "destructive" : "default"}
            onClick={handleToggleActive}
            disabled={updating}
            className="gap-2"
          >
            {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            {user.isActive ? 'Deactivate Account' : 'Activate Account'}
          </Button>
          <Button
            variant={user.isVerified ? "secondary" : "default"}
            onClick={handleToggleVerified}
            disabled={updating}
            className="gap-2"
          >
            {user.isVerified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            {user.isVerified ? 'Mark as Unverified' : 'Verify Account'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/users/${userId}/reset-password`)}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            Reset Password
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>
                  Complete profile details for {user.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Personal Details</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-600">Full Name</label>
                          <p className="font-medium">{user.name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Email Address</label>
                          <p className="font-medium">{user.email}</p>
                        </div>
                        {user.phone && (
                          <div>
                            <label className="text-sm text-gray-600">Phone Number</label>
                            <p className="font-medium">{user.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {user.clinicName && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Professional Details</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-600">Clinic/Hospital</label>
                            <p className="font-medium flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {user.clinicName}
                            </p>
                          </div>
                          {user.specialization && (
                            <div>
                              <label className="text-sm text-gray-600">Specialization</label>
                              <p className="font-medium">{user.specialization}</p>
                            </div>
                          )}
                          {user.licenseNumber && (
                            <div>
                              <label className="text-sm text-gray-600">License Number</label>
                              <p className="font-medium">{user.licenseNumber}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Account Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-600">User ID</label>
                          <p className="font-mono text-sm bg-gray-100 p-2 rounded">{user.id}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Account Created</label>
                          <p className="font-medium">{formatDateTime(user.createdAt)}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Last Updated</label>
                          <p className="font-medium">{formatDateTime(user.updatedAt)}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Last Login</label>
                          <p className="font-medium">{formatDateTime(user.lastLogin)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {user.address && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <p className="text-gray-700">{user.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {user.isActive ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span>Account Status</span>
                    </div>
                    <Badge variant={user.isActive ? 'success' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {user.isVerified ? (
                        <Shield className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <span>Verification</span>
                    </div>
                    <Badge variant={user.isVerified ? 'success' : 'warning'}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <span>Role</span>
                    </div>
                    <Badge variant={getRoleColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Account Actions</p>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleActive}
                        disabled={updating}
                      >
                        {user.isActive ? 'Deactivate Account' : 'Activate Account'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleVerified}
                        disabled={updating}
                      >
                        {user.isVerified ? 'Mark as Unverified' : 'Verify Account'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Account Created</p>
                        <p className="text-xs text-gray-500">{formatDateTime(user.createdAt)}</p>
                      </div>
                    </div>
                    {user.lastLogin && (
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <div>
                          <p className="text-sm font-medium">Last Login</p>
                          <p className="text-xs text-gray-500">{formatDateTime(user.lastLogin)}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <div>
                        <p className="text-sm font-medium">Profile Updated</p>
                        <p className="text-xs text-gray-500">{formatDateTime(user.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <Card>
            <CardHeader>
              <CardTitle>Patient Assignments</CardTitle>
              <CardDescription>
                {user.role === 'clinician' ? 'Patients under care' : 
                 user.role === 'guardian' ? 'Patients they are guardian for' : 
                 'Patients associated with this user'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPatients ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="md" />
                  <p className="mt-2 text-gray-600">Loading patients...</p>
                </div>
              ) : userPatients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Patient</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date of Birth</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Age</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userPatients.map(patient => (
                        <tr key={patient.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {patient.photoUrl ? (
                                <img
                                  src={patient.photoUrl}
                                  alt={patient.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium">
                                    {patient.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{patient.name}</p>
                                <p className="text-sm text-gray-500">ID: {patient.id.substring(0, 8)}...</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p>{formatDate(patient.dob)}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-600">
                              {AppServices.calculateAgeString(patient.dob)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={
                              patient.status === 'active' ? 'success' :
                              patient.status === 'inactive' ? 'secondary' :
                              'outline'
                            }>
                              {patient.status?.charAt(0).toUpperCase() + patient.status?.slice(1) || 'Unknown'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/patients/${patient.id}`)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Patients Found</h3>
                  <p className="text-gray-600 mb-6">
                    {user.name} doesn't have any patients assigned or we couldn't load them.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/admin/patients')}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Browse All Patients
                    </Button>
                    <Button 
                      onClick={() => loadUserPatients(user.patients || [])}
                      disabled={loadingPatients}
                    >
                      Retry Loading Patients
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage account settings and permissions for {user.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Danger Zone</h4>
                      <p className="text-sm text-red-700 mt-1">
                        These actions are irreversible. Please proceed with caution.
                      </p>
                      <div className="flex flex-wrap gap-3 mt-3">
                        <Button
                          variant="destructive"
                          onClick={handleDeleteUser}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User Account
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/admin/users/${userId}/reset-password`)}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Force Password Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notification Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email Notifications</span>
                        <Badge variant={user.notificationPreferences?.email ? 'success' : 'secondary'}>
                          {user.notificationPreferences?.email ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Push Notifications</span>
                        <Badge variant={user.notificationPreferences?.push ? 'success' : 'secondary'}>
                          {user.notificationPreferences?.push ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SMS Alerts</span>
                        <Badge variant={user.notificationPreferences?.sms ? 'success' : 'secondary'}>
                          {user.notificationPreferences?.sms ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Account Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600">Language</label>
                        <p className="font-medium">{user.language?.toUpperCase() || 'English'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Timezone</label>
                        <p className="font-medium">{user.timezone || 'UTC'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleProtectedLayout>
  );
}