"use client";

import React, { useState, useEffect } from 'react';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import * as AppServices from '@/app/services/app.services';
import { auth } from '@/app/lib/firebase/firebase';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Plus, Users, UserPlus, BarChart3, Stethoscope, Shield, Activity, Download, Settings } from 'lucide-react';

// Enhanced modal component with responsive design
const CreateUserModal = ({ isOpen, onClose, onCreate }: { 
  isOpen: boolean; 
  onClose: () => void;
  onCreate: (userData: any) => Promise<{ success: boolean; userId?: string; message: string }>;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'TempPassword123!',
    role: 'clinician' as 'clinician' | 'guardian' | 'admin',
    phone: '',
    clinicName: '',
    specialization: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await onCreate(formData);
      
      if (result.success) {
        setSuccess('User created successfully! You will be redirected to login.');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: 'TempPassword123!',
          role: 'clinician',
          phone: '',
          clinicName: '',
          specialization: '',
        });

        // Auto-close after success
        setTimeout(() => {
          onClose();
          // Redirect to login after a moment
          setTimeout(() => {
            window.location.href = '/login?message=UserCreated&returnUrl=/dashboard/admin';
          }, 1000);
        }, 2000);
      } else {
        setError(result.message || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create New User</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as 'clinician' | 'guardian' | 'admin'})}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="clinician">Clinician</option>
              <option value="guardian">Guardian</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Temporary Password *</label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              User will need to change this on first login
            </p>
          </div>

          {formData.role === 'clinician' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Clinic Name</label>
                <input
                  type="text"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                  placeholder="Enter clinic name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                  placeholder="e.g., Pediatrics, Neurology"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              placeholder="(123) 456-7890"
            />
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Creating...
                </span>
              ) : 'Create User'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
              className="text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
            >
              Cancel
            </Button>
          </div>

          <div className="text-xs sm:text-sm text-gray-600 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
            <p className="font-semibold mb-1">⚠️ Important Notice:</p>
            <p>After creating a user, you will be logged out and redirected to the login page. 
            This is a security measure. Please log back in with your admin credentials.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await AppServices.getAdminDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const simpleCreateUser = async (userData: any) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Please log in as admin');
    }

    try {
      const result = await AppServices.createUserSimple(currentUser.uid, {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        clinicName: userData.clinicName,
        specialization: userData.specialization,
      });

      if (result.success) {
        return {
          success: true,
          userId: result.data?.userId,
          message: result.message || 'User created successfully'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to create user'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to create user'
      };
    }
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
    <>
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="min-h-screen bg-gray-50">
          {/* Main Container */}
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            
            {/* Dashboard Header Card */}
            <Card className="mb-6 sm:mb-8 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-sm">
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        Admin Dashboard
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        System Overview & Management
                      </p>
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex items-center gap-3">
                    <Button 
                      onClick={() => setShowCreateUserModal(true)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New User
                    </Button>
                    
                    <button
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors border border-gray-300"
                      aria-label={isCollapsed ? "Show actions" : "Hide actions"}
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronUp className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Mobile actions */}
                  <div className="sm:hidden flex items-center gap-2">
                    <button
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      aria-label={isCollapsed ? "Expand actions" : "Collapse actions"}
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronUp className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile actions dropdown */}
                {!isCollapsed && (
                  <div className="sm:hidden mt-4 pt-4 border-t border-gray-200">
                    <Button 
                      onClick={() => setShowCreateUserModal(true)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 w-full text-sm px-4 py-2.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New User
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <CardTitle className="text-base sm:text-lg">Total Users</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {stats?.totalUsers || 0}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {stats?.totalClinicians || 0} clinicians
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      {stats?.totalGuardians || 0} guardians
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <CardTitle className="text-base sm:text-lg">Total Patients</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {stats?.totalPatients || 0}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Active patients in the system
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                    <CardTitle className="text-base sm:text-lg">Pending Invitations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {stats?.pendingInvitations || 0}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Guardians awaiting acceptance
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    <CardTitle className="text-base sm:text-lg">System Status</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    <span className={`px-3 py-1.5 rounded-lg text-sm sm:text-base font-medium ${
                      stats?.systemHealth === 'good' ? 'bg-green-100 text-green-800' :
                      stats?.systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {stats?.systemHealth?.toUpperCase() || 'GOOD'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    All systems operational
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Section */}
            {!isCollapsed && (
              <Card className="mb-6 sm:mb-8">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">Quick Actions</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Manage your healthcare platform efficiently
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-blue-200 cursor-pointer">
                      <CardContent className="p-4 sm:p-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg mb-3 sm:mb-4">
                          <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">Manage Clinicians</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-4">
                          View and manage clinician accounts
                        </p>
                        <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                          <a href="/dashboard/admin/users/clinicians">View Clinicians</a>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-green-200 cursor-pointer">
                      <CardContent className="p-4 sm:p-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-lg mb-3 sm:mb-4">
                          <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">Manage Guardians</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-4">
                          View and manage guardian accounts
                        </p>
                        <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                          <a href="/dashboard/admin/users/guardians">View Guardians</a>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-purple-200 cursor-pointer">
                      <CardContent className="p-4 sm:p-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg mb-3 sm:mb-4">
                          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">Create User</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-4">
                          Add new clinicians or guardians
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full text-xs sm:text-sm"
                          onClick={() => setShowCreateUserModal(true)}
                        >
                          Create User
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-orange-200 cursor-pointer">
                      <CardContent className="p-4 sm:p-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-lg mb-3 sm:mb-4">
                          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">System Reports</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-4">
                          Generate system usage reports
                        </p>
                        <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                          <a href="/dashboard/admin/reports">View Reports</a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Content Area */}
            {!isCollapsed && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <CardTitle>Recent Activity</CardTitle>
                    </div>
                    <CardDescription>Latest system events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                          <Plus className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">New user registration</p>
                          <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Guardian invitation sent</p>
                          <p className="text-xs text-gray-500">15 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-full">
                          <Download className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Monthly report generated</p>
                          <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Health Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-green-600" />
                      <CardTitle>System Health</CardTitle>
                    </div>
                    <CardDescription>Performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">API Response Time</span>
                          <span className="text-sm font-medium text-green-600">125ms</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Database Uptime</span>
                          <span className="text-sm font-medium text-green-600">99.9%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Active Sessions</span>
                          <span className="text-sm font-medium text-blue-600">42</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </RoleProtectedLayout>

      {/* Create User Modal */}
      <CreateUserModal 
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onCreate={simpleCreateUser}
      />
    </>
  );
}