// app/dashboard/page.tsx - REDESIGNED VERSION
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import RootDashboardLayout from '@/app/components/layout/RootDashboardLayout';
import {
  getAdminDashboardStats,
  getClinicianStats,
  getGuardianStats
} from '@/app/services/app.services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { 
  ChevronDown, 
  ChevronUp, 
  Users, 
  UserPlus, 
  BarChart3, 
  Stethoscope, 
  Shield, 
  Activity, 
  Settings,
  Calendar,
  AlertCircle,
  FileText,
  Home,
  RefreshCw,
  LogOut,
  UserCheck,
  Heart,
  Baby,
  Clock,
  TrendingUp,
  CheckCircle,
  User as UserIcon
} from 'lucide-react';

// Types matching your service returns
interface DashboardStats {
  totalPatients: number;
  upcomingAppointments: number;
  healthAlerts: number;
  pendingTasks: number;
  systemUsers?: number;
  activeClinics?: number;
  pendingVaccinations?: number;
  recentActivity?: number;
  pendingInvitations?: number;
  totalUsers?: number;
  growthAlerts?: number;
  recentRecords?: number;
  vaccinationDue?: number;
  totalClinicians?: number;
  totalGuardians?: number;
  totalAdmins?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  deletedUsers?: number;
  activePatients?: number;
  missedAppointments?: number;
  averagePatientsPerDay?: number;
  patientRetentionRate?: number;
  averageAppointmentsPerMonth?: number;
}

export default function MainDashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading, isAuthenticated, logout } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    upcomingAppointments: 0,
    healthAlerts: 0,
    pendingTasks: 0,
    systemUsers: 0,
    activeClinics: 0,
    pendingVaccinations: 0,
    recentActivity: 0,
    pendingInvitations: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsUpdated, setStatsUpdated] = useState<Date | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Handle authentication redirect
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    if (!userProfile || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let fetchedStats: DashboardStats = {
        totalPatients: 0,
        upcomingAppointments: 0,
        healthAlerts: 0,
        pendingTasks: 0
      };

      switch (userProfile.role) {
        case 'admin':
          const adminStats = await getAdminDashboardStats();
          console.log('Admin stats:', adminStats);
          
          fetchedStats = {
            totalPatients: adminStats?.totalPatients || 0,
            systemUsers: adminStats?.totalUsers || 0,
            recentActivity: adminStats?.recentActivity || 0,
            pendingInvitations: adminStats?.pendingInvitations || 0,
            totalClinicians: adminStats?.totalClinicians || 0,
            totalGuardians: adminStats?.totalGuardians || 0,
            totalAdmins: adminStats?.totalAdmins || 0,
            activeUsers: adminStats?.activeUsers || 0,
            inactiveUsers: adminStats?.inactiveUsers || 0,
            deletedUsers: adminStats?.deletedUsers || 0,
            upcomingAppointments: 0,
            healthAlerts: 0,
            pendingTasks: 0,
            activeClinics: 0,
            pendingVaccinations: 0
          };
          break;

        case 'clinician':
          const clinicianStats = await getClinicianStats(user.uid);
          console.log('Clinician stats:', clinicianStats);
          
          fetchedStats = {
            totalPatients: clinicianStats?.totalPatients || 0,
            upcomingAppointments: clinicianStats?.upcomingAppointments || 0,
            healthAlerts: clinicianStats?.growthAlerts || 0,
            recentActivity: clinicianStats?.recentRecords || 0,
            pendingVaccinations: clinicianStats?.vaccinationDue || 0,
            growthAlerts: clinicianStats?.growthAlerts || 0,
            recentRecords: clinicianStats?.recentRecords || 0,
            vaccinationDue: clinicianStats?.vaccinationDue || 0,
            activePatients: clinicianStats?.activePatients || 0,
            pendingInvitations: clinicianStats?.pendingInvitations || 0,
            averagePatientsPerDay: clinicianStats?.averagePatientsPerDay || 0,
            patientRetentionRate: clinicianStats?.patientRetentionRate || 0,
            pendingTasks: 0
          };
          break;

        case 'guardian':
          const guardianStats = await getGuardianStats(user.uid);
          console.log('Guardian stats:', guardianStats);
          
          fetchedStats = {
            totalPatients: guardianStats?.totalPatients || 0,
            upcomingAppointments: guardianStats?.upcomingAppointments || 0,
            healthAlerts: guardianStats?.healthAlerts || 0,
            recentActivity: guardianStats?.recentRecords || 0,
            pendingVaccinations: guardianStats?.vaccinationDue || 0,
            vaccinationDue: guardianStats?.vaccinationDue || 0,
            recentRecords: guardianStats?.recentRecords || 0,
            missedAppointments: guardianStats?.missedAppointments || 0,
            averageAppointmentsPerMonth: guardianStats?.averageAppointmentsPerMonth || 0,
            pendingTasks: 0
          };
          break;
      }

      setStats(fetchedStats);
      setStatsUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, user]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const refreshStats = async () => {
    await fetchDashboardStats();
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      setError('Failed to logout. Please try again.');
    }
  };

  // Get role info
  const getRoleInfo = () => {
    if (!userProfile) return {
      title: 'User Dashboard',
      description: 'Health monitoring dashboard',
      icon: <UserIcon className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'gray',
      gradient: 'from-gray-500 to-gray-600'
    };
    
    switch (userProfile.role) {
      case 'admin':
        return {
          title: 'Admin Dashboard',
          description: 'System Overview & Management',
          icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
          color: 'purple',
          gradient: 'from-purple-500 to-purple-600'
        };
      case 'clinician':
        return {
          title: 'Clinician Dashboard',
          description: 'Patient Care & Management',
          icon: <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />,
          color: 'blue',
          gradient: 'from-blue-500 to-blue-600'
        };
      case 'guardian':
        return {
          title: 'Guardian Dashboard',
          description: 'Family Health Tracking',
          icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
          color: 'green',
          gradient: 'from-green-500 to-green-600'
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Health monitoring dashboard',
          icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" />,
          color: 'gray',
          gradient: 'from-gray-500 to-gray-600'
        };
    }
  };

  const roleInfo = getRoleInfo();

  if (loading || isLoading) {
    return (
      <RootDashboardLayout
        title="Loading..."
        subtitle="Please wait"
        showBackButton={false}
        showSearch={false}
        showBreadcrumb={false}
      >
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </RootDashboardLayout>
    );
  }

  if (!isAuthenticated || !userProfile) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Main Container */}
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
              {error}
              <button 
                onClick={() => setError(null)} 
                className="float-right text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          )}

          {/* Dashboard Header Card */}
          <Card className="mb-6 sm:mb-8 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br ${roleInfo.gradient} text-white rounded-lg shadow-sm`}>
                    {roleInfo.icon}
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      Welcome, {userProfile.name?.split(' ')[0] || 'User'}!
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {userProfile.email} • Last login: {new Date(userProfile.lastLogin).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        userProfile.isVerified 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {userProfile.isVerified ? '✓ Verified' : '⚠ Not Verified'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        userProfile.isActive 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {userProfile.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:flex items-center gap-3">
                  <Button 
                    onClick={refreshStats}
                    variant="outline"
                    className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
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
                    onClick={refreshStats}
                    variant="outline"
                    className="w-full text-sm px-4 py-2.5 mb-2"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Stats
                  </Button>
                  <Button 
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full text-sm px-4 py-2.5"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {/* Admin Stats */}
            {userProfile.role === 'admin' && (
              <>
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <CardTitle className="text-base sm:text-lg">Total Users</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {stats?.systemUsers || 0}
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
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {stats?.recentActivity || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      System events last 24h
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Clinician Stats */}
            {userProfile.role === 'clinician' && (
              <>
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <CardTitle className="text-base sm:text-lg">My Patients</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {stats?.totalPatients || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Active patients under care
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <CardTitle className="text-base sm:text-lg">Upcoming Appointments</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {stats?.upcomingAppointments || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Scheduled for next 7 days
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      <CardTitle className="text-base sm:text-lg">Growth Alerts</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {stats?.healthAlerts || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Patients requiring attention
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      <CardTitle className="text-base sm:text-lg">Recent Records</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {stats?.recentActivity || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Updated last 24 hours
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Guardian Stats */}
            {userProfile.role === 'guardian' && (
              <>
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <Baby className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <CardTitle className="text-base sm:text-lg">My Children</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {stats?.totalPatients || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Children under your care
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <CardTitle className="text-base sm:text-lg">Upcoming Appointments</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {stats?.upcomingAppointments || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Scheduled for next 7 days
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      <CardTitle className="text-base sm:text-lg">Health Alerts</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {stats?.healthAlerts || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Requiring your attention
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      <CardTitle className="text-base sm:text-lg">Vaccinations Due</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {stats?.vaccinationDue || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Upcoming vaccinations
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Quick Actions Section */}
          {!isCollapsed && (
            <Card className="mb-6 sm:mb-8">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Quick Actions</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Manage your dashboard efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {userProfile.role === 'admin' && (
                    <>
                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-blue-200 cursor-pointer">
                        <CardContent className="p-4 sm:p-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg mb-3 sm:mb-4">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">Manage Users</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            View and manage all user accounts
                          </p>
                          <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                            <a href="/dashboard/admin/users">View Users</a>
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-green-200 cursor-pointer">
                        <CardContent className="p-4 sm:p-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-lg mb-3 sm:mb-4">
                            <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">View Patients</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            Manage patient records
                          </p>
                          <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                            <a href="/dashboard/admin/patients">View Patients</a>
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-purple-200 cursor-pointer">
                        <CardContent className="p-4 sm:p-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg mb-3 sm:mb-4">
                            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">System Settings</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            Configure system preferences
                          </p>
                          <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                            <a href="/dashboard/admin/settings">View Settings</a>
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-orange-200 cursor-pointer">
                        <CardContent className="p-4 sm:p-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-lg mb-3 sm:mb-4">
                            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">View Reports</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            Generate system reports
                          </p>
                          <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                            <a href="/dashboard/admin/reports">View Reports</a>
                          </Button>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {userProfile.role === 'clinician' && (
                    <>
                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-blue-200 cursor-pointer">
                        <CardContent className="p-4 sm:p-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg mb-3 sm:mb-4">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">My Patients</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            View patient list and records
                          </p>
                          <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                            <a href="/dashboard/clinician/patients">View Patients</a>
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-green-200 cursor-pointer">
                        <CardContent className="p-4 sm:p-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-lg mb-3 sm:mb-4">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">Appointments</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            Manage your schedule
                          </p>
                          <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                            <a href="/dashboard/clinician/appointments">View Appointments</a>
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-purple-200 cursor-pointer">
                        <CardContent className="p-4 sm:p-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg mb-3 sm:mb-4">
                            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">Alerts</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            Review health alerts
                          </p>
                          <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                            <a href="/dashboard/clinician/alerts">View Alerts</a>
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-orange-200 cursor-pointer">
                        <CardContent className="p-4 sm:p-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-lg mb-3 sm:mb-4">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">Records</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            Access patient records
                          </p>
                          <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                            <a href="/dashboard/clinician/records">View Records</a>
                          </Button>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {userProfile.role === 'guardian' && (
                    <>
                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-blue-200 cursor-pointer">
                        <CardContent className="p-4 sm:p-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg mb-3 sm:mb-4">
                            <Baby className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">My Children</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            View child profiles
                          </p>
                          <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                            <a href="/dashboard/guardian/children">View Children</a>
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-green-200 cursor-pointer">
                        <CardContent className="p-4 sm:p-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-lg mb-3 sm:mb-4">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">Appointments</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            Schedule and view appointments
                          </p>
                          <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                            <a href="/dashboard/guardian/appointments">View Appointments</a>
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-purple-200 cursor-pointer">
                        <CardContent className="p-4 sm:p-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg mb-3 sm:mb-4">
                            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">Health Alerts</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            Review important alerts
                          </p>
                          <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                            <a href="/dashboard/guardian/alerts">View Alerts</a>
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-orange-200 cursor-pointer">
                        <CardContent className="p-4 sm:p-6">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-lg mb-3 sm:mb-4">
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900">Vaccinations</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            Track vaccination schedule
                          </p>
                          <Button variant="outline" className="w-full text-xs sm:text-sm" asChild>
                            <a href="/dashboard/guardian/vaccinations">View Vaccinations</a>
                          </Button>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity Section */}
          {!isCollapsed && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <CardTitle>Recent Activity</CardTitle>
                </div>
                <CardDescription>Latest dashboard updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Dashboard loaded</p>
                      <p className="text-xs text-gray-500">Just now • All systems operational</p>
                    </div>
                  </div>
                  
                  {statsUpdated && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 flex text-sm items-center justify-center bg-green-100 text-green-600 rounded-full">
                        <RefreshCw className="w-4 h-4 text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Stats updated</p>
                        <p className="text-xs text-gray-500">
                          {statsUpdated.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            hour12: true 
                          })} • Fresh data loaded
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Welcome back</p>
                      <p className="text-xs text-gray-500">
                        {userProfile.lastLogin ? 
                          `Last login: ${new Date(userProfile.lastLogin).toLocaleDateString()}` : 
                          'First time login'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}