"use client";

import React, { useState, useEffect } from 'react';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import * as AppServices from '@/app/services/app.services';
import { auth } from '@/app/lib/firebase/firebase';
import { useRouter } from 'next/navigation';

// Add this modal component for creating users
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New User</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border rounded"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as 'clinician' | 'guardian' | 'admin'})}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              <option value="clinician">Clinician</option>
              <option value="guardian">Guardian</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Temporary Password *</label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-2 border rounded"
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
                <label className="block text-sm font-medium mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                  className="w-full p-2 border rounded"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  className="w-full p-2 border rounded"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          <div className="text-sm text-gray-500 p-3 bg-yellow-50 rounded">
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

  // Use the simpleCreateUser function directly
  const simpleCreateUser = async (userData: any) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Please log in as admin');
    }

    try {
      // Use the service function
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

  // Alternative: Direct Firebase implementation
  const directCreateUser = async (userData: any) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Please log in as admin');
    }

    try {
      // Dynamically import Firebase functions
      const { createUserWithEmailAndPassword, signOut } = await import('firebase/auth');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { auth: firebaseAuth, db } = await import('@/app/lib/firebase/firebase');

      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        userData.email,
        userData.password
      );
      
      const newUserId = userCredential.user.uid;

      // Create user profile
      await setDoc(doc(db, 'users', newUserId), {
        uid: newUserId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone || '',
        clinicName: userData.clinicName || '',
        specialization: userData.specialization || '',
        patients: [],
        isVerified: false,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: null,
        notificationPreferences: {
          email: true,
          push: true,
          sms: false,
          appointmentReminders: true,
          healthAlerts: true
        }
      });

      // Sign out the new user (admin will be logged out)
      await signOut(firebaseAuth);
      
      return { 
        success: true, 
        userId: newUserId,
        message: 'User created successfully' 
      };
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button 
              onClick={() => setShowCreateUserModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              + Create New User
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span>{stats?.totalClinicians || 0} clinicians</span>
                  <span>{stats?.totalGuardians || 0} guardians</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalPatients || 0}</div>
                <p className="text-sm text-gray-600 mt-2">
                  Active patients in the system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending Invitations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.pendingInvitations || 0}</div>
                <p className="text-sm text-gray-600 mt-2">
                  Guardians awaiting acceptance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  stats?.systemHealth === 'good' ? 'bg-green-100 text-green-800' :
                  stats?.systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {stats?.systemHealth?.toUpperCase() || 'GOOD'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your healthcare platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-4">👨‍⚕️</div>
                    <h3 className="font-semibold mb-2">Manage Clinicians</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      View and manage clinician accounts
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/dashboard/admin/clinicians">View Clinicians</a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-4">👥</div>
                    <h3 className="font-semibold mb-2">Manage Guardians</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      View and manage guardian accounts
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/dashboard/admin/guardians">View Guardians</a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-4">➕</div>
                    <h3 className="font-semibold mb-2">Create User</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Add new clinicians or guardians
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowCreateUserModal(true)}
                    >
                      Create User
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="font-semibold mb-2">System Reports</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Generate system usage reports
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/dashboard/admin/reports">View Reports</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleProtectedLayout>

      {/* Create User Modal */}
      <CreateUserModal 
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onCreate={simpleCreateUser} // Use directCreateUser if AppServices doesn't work
      />
    </>
  );
}