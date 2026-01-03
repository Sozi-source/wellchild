// app/dashboard/page.tsx - FIXED VERSION
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
import { Users } from 'lucide-react';
import {
  CalendarToday,
  MedicalServices,
  Assignment,
  Warning,
  Settings,
  ExitToApp,
  AdminPanelSettings,
  ChildCare,
  Refresh,
  TrendingUp,
  MonitorHeart,
  Vaccines,
  LocalHospital,
  FamilyRestroom,
  HealthAndSafety,
  Groups,
  Business,
  ManageAccounts,
  Analytics,
  MedicalInformation,
  CheckCircle,
  Error as ErrorIcon,
  AccountCircle,
  Group,
  Home,
  TaskAlt,
  Store,
} from '@mui/icons-material';
import { Shield } from 'lucide-react';

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

  // Get role-based styles
  const getRoleStyles = useCallback(() => {
    if (!userProfile) return { 
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
      color: '#059669', 
      title: 'User', 
      description: 'Health dashboard', 
      bgColor: 'bg-emerald-50', 
      primaryColor: '#059669',
      secondaryColor: '#047857'
    };
    
    switch (userProfile.role) {
      case 'admin':
        return {
          gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          color: '#7c3aed',
          title: 'System Administrator',
          description: 'Manage users, clinics, and settings',
          bgColor: 'bg-violet-50',
          primaryColor: '#7c3aed',
          secondaryColor: '#4f46e5'
        };
      case 'clinician':
        return {
          gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          color: '#0ea5e9',
          title: 'Healthcare Provider',
          description: 'Monitor patients and appointments',
          bgColor: 'bg-blue-50',
          primaryColor: '#0ea5e9',
          secondaryColor: '#0284c7'
        };
      case 'guardian':
        return {
          gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: '#059669',
          title: 'Parent/Guardian',
          description: 'Track children\'s health and appointments',
          bgColor: 'bg-emerald-50',
          primaryColor: '#059669',
          secondaryColor: '#047857'
        };
      default:
        return {
          gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: '#059669',
          title: 'User',
          description: 'Health dashboard',
          bgColor: 'bg-emerald-50',
          primaryColor: '#059669',
          secondaryColor: '#047857'
        };
    }
  }, [userProfile]);

  const roleStyles = getRoleStyles();

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
          console.log('Admin stats:', adminStats); // Debug log
          
          fetchedStats = {
            totalPatients: adminStats?.totalPatients || 0,
            systemUsers: adminStats?.totalUsers || 0,
            recentActivity: adminStats?.recentActivity || 0,
            pendingInvitations: adminStats?.pendingInvitations || 0,
            // These properties exist in AdminStats
            totalClinicians: adminStats?.totalClinicians || 0,
            totalGuardians: adminStats?.totalGuardians || 0,
            totalAdmins: adminStats?.totalAdmins || 0,
            activeUsers: adminStats?.activeUsers || 0,
            inactiveUsers: adminStats?.inactiveUsers || 0,
            deletedUsers: adminStats?.deletedUsers || 0,
            // Set defaults for properties not in AdminStats
            upcomingAppointments: 0,
            healthAlerts: 0,
            pendingTasks: 0,
            activeClinics: 0, // This doesn't exist in AdminStats, default to 0
            pendingVaccinations: 0
          };
          break;

        case 'clinician':
          const clinicianStats = await getClinicianStats(user.uid);
          console.log('Clinician stats:', clinicianStats); // Debug log
          
          fetchedStats = {
            totalPatients: clinicianStats?.totalPatients || 0,
            upcomingAppointments: clinicianStats?.upcomingAppointments || 0,
            healthAlerts: clinicianStats?.growthAlerts || 0,
            recentActivity: clinicianStats?.recentRecords || 0,
            pendingVaccinations: clinicianStats?.vaccinationDue || 0,
            // These might exist in ClinicianStats
            growthAlerts: clinicianStats?.growthAlerts || 0,
            recentRecords: clinicianStats?.recentRecords || 0,
            vaccinationDue: clinicianStats?.vaccinationDue || 0,
            activePatients: clinicianStats?.activePatients || 0,
            pendingInvitations: clinicianStats?.pendingInvitations || 0,
            averagePatientsPerDay: clinicianStats?.averagePatientsPerDay || 0,
            patientRetentionRate: clinicianStats?.patientRetentionRate || 0,
            // Set defaults
            pendingTasks: 0
          };
          break;

        case 'guardian':
          const guardianStats = await getGuardianStats(user.uid);
          console.log('Guardian stats:', guardianStats); // Debug log
          
          fetchedStats = {
            totalPatients: guardianStats?.totalPatients || 0,
            upcomingAppointments: guardianStats?.upcomingAppointments || 0,
            healthAlerts: guardianStats?.healthAlerts || 0,
            recentActivity: guardianStats?.recentRecords || 0,
            pendingVaccinations: guardianStats?.vaccinationDue || 0,
            // These might exist in GuardianStats
            vaccinationDue: guardianStats?.vaccinationDue || 0,
            recentRecords: guardianStats?.recentRecords || 0,
            missedAppointments: guardianStats?.missedAppointments || 0,
            averageAppointmentsPerMonth: guardianStats?.averageAppointmentsPerMonth || 0,
            // Set defaults
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

  // Stat Card Component
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color,
    loading = false,
    onClick
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    loading?: boolean;
    onClick?: () => void;
  }) => {
    return (
      <div 
        className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-gray-200 min-h-[100px] flex flex-col ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="p-4 sm:p-5 h-full flex flex-col justify-between">
          <p className="text-gray-600 text-xs sm:text-sm font-medium uppercase tracking-wider mb-2">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
          ) : (
            <h2 className="text-gray-900 text-xl sm:text-2xl font-semibold">
              {value?.toLocaleString() || 0}
            </h2>
          )}
          <div className="flex justify-end mt-2">
            <div 
              className="p-1.5 rounded-lg" 
              style={{ 
                color,
                backgroundColor: `${color}15`
              }}
            >
              {icon}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading || isLoading) {
    return (
      <RootDashboardLayout
        title="Loading..."
        subtitle="Please wait"
        showBackButton={false}
        showSearch={false}
        showBreadcrumb={false}
      >
        <div className="flex justify-center items-center h-96">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </RootDashboardLayout>
    );
  }

  if (!isAuthenticated || !userProfile) {
    return null;
  }

  // Get dashboard info
  const getDashboardInfo = () => {
    switch (userProfile.role) {
      case 'admin':
        return {
          title: 'System Dashboard',
          subtitle: 'Manage users, clinics, and system settings',
          icon: <AdminPanelSettings />
        };
      case 'clinician':
        return {
          title: 'Clinical Dashboard',
          subtitle: 'Monitor patients and healthcare activities',
          icon: <MedicalServices />
        };
      case 'guardian':
        return {
          title: 'Family Dashboard',
          subtitle: 'Track your children\'s health and appointments',
          icon: <ChildCare />
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Health monitoring dashboard',
          icon: <MedicalServices />
        };
    }
  };

  const dashboardInfo = getDashboardInfo();

  // Get responsive grid columns
  const getGridCols = () => {
    if (typeof window === 'undefined') return 'grid-cols-1';
    const width = window.innerWidth;
    if (width < 640) return 'grid-cols-1';
    if (width < 1024) return 'grid-cols-2';
    return 'grid-cols-4';
  };

  return (
    <RootDashboardLayout
      title={dashboardInfo.title}
      subtitle={dashboardInfo.subtitle}
      showBackButton={false}
      showSearch={true}
      showBreadcrumb={true}
      headerActions={
        <div className="flex items-center space-x-3">
          {!userProfile.isVerified && (
            <button
              onClick={() => router.push('/verify-email')}
              className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg hover:bg-amber-200 transition-colors flex items-center space-x-2 text-sm"
            >
              <Warning className="h-4 w-4" />
              <span>Verify Email</span>
            </button>
          )}
          <button
            onClick={refreshStats}
            disabled={isLoading}
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2 text-sm"
          >
            <Refresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      }
      contentClassName={roleStyles.bgColor}
    >
      <div className="pb-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ErrorIcon />
                <span className="font-medium">{error}</span>
              </div>
              <button 
                onClick={() => setError(null)} 
                className="text-white/80 hover:text-white text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Hero Banner */}
        <div 
          className="p-6 rounded-xl shadow-lg mb-8"
          style={{ background: roleStyles.gradient }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-white/90 px-3 py-1.5 rounded-full text-sm font-medium mb-4 bg-white/10 backdrop-blur-sm border border-white/20">
                {dashboardInfo.icon}
                {roleStyles.title}
              </div>
              
              <h1 className="text-xl md:text-2xl font-semibold text-white mb-2">
                Welcome back, {userProfile.name?.split(' ')[0] || 'User'}!
              </h1>
              
              <p className="text-white/80 text-base mb-4">
                {userProfile.email} • Last login: {new Date(userProfile.lastLogin).toLocaleDateString()}
              </p>

              {/* Account Status */}
              <div className="flex flex-wrap items-center gap-3">
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${userProfile.isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {userProfile.isVerified ? <CheckCircle className="w-3 h-3" /> : <Warning className="w-3 h-3" />}
                  {userProfile.isVerified ? 'Email Verified' : 'Email Not Verified'}
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <AccountCircle className="w-3 h-3" />
                  {userProfile.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Overview</h2>
              {statsUpdated && (
                <p className="text-gray-500 text-sm mt-1">
                  Updated {statsUpdated.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true 
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Role-specific Stats */}
          <div className={`grid ${getGridCols()} gap-6`}>
            {userProfile.role === 'admin' && (
              <>
                <StatCard 
                  title="Total Users" 
                  value={stats.systemUsers || 0} 
                  icon={<Groups />} 
                  color="#7c3aed" 
                  loading={isLoading}
                  onClick={() => router.push('/dashboard/admin/users')}
                />
                <StatCard 
                  title="Patients" 
                  value={stats.totalPatients || 0} 
                  icon={<LocalHospital />} 
                  color="#0ea5e9" 
                  loading={isLoading}
                  onClick={() => router.push('/dashboard/admin/patients')}
                />
                <StatCard 
                  title="Clinicians" 
                  value={stats.totalClinicians || 0} 
                  icon={<MedicalServices />} 
                  color="#059669" 
                  loading={isLoading}
                  onClick={() => router.push('/dashboard/admin/users?role=clinician')}
                />
                <StatCard 
                  title="Recent Activity" 
                  value={stats.recentActivity || 0} 
                  icon={<MonitorHeart />} 
                  color="#f43f5e" 
                  loading={isLoading}
                  onClick={() => router.push('/dashboard/admin/activity')}
                />
              </>
            )}

            {userProfile.role === 'clinician' && (
              <>
                <StatCard 
                  title="My Patients" 
                  value={stats.totalPatients || 0} 
                  icon={<Users />} 
                  color="#0ea5e9" 
                  loading={isLoading}
                  onClick={() => router.push('/dashboard/clinician/patients')}
                />
                <StatCard 
                  title="Appointments" 
                  value={stats.upcomingAppointments || 0} 
                  icon={<CalendarToday />} 
                  color="#059669" 
                  loading={isLoading}
                  onClick={() => router.push('/dashboard/clinician/appointments')}
                />
                <StatCard 
                  title="Growth Alerts" 
                  value={stats.growthAlerts || stats.healthAlerts || 0} 
                  icon={<Warning />} 
                  color="#f43f5e" 
                  loading={isLoading}
                  onClick={() => router.push('/dashboard/clinician/alerts')}
                />
                <StatCard 
                  title="Recent Records" 
                  value={stats.recentActivity || stats.recentRecords || 0} 
                  icon={<Assignment />} 
                  color="#f59e0b" 
                  loading={isLoading}
                  onClick={() => router.push('/dashboard/clinician/records')}
                />
              </>
            )}

            {userProfile.role === 'guardian' && (
              <>
                <StatCard 
                  title="My Children" 
                  value={stats.totalPatients || 0} 
                  icon={<FamilyRestroom />} 
                  color="#059669" 
                  loading={isLoading}
                  onClick={() => router.push('/dashboard/guardian/children')}
                />
                <StatCard 
                  title="Appointments" 
                  value={stats.upcomingAppointments || 0} 
                  icon={<CalendarToday />} 
                  color="#0ea5e9" 
                  loading={isLoading}
                  onClick={() => router.push('/dashboard/guardian/appointments')}
                />
                <StatCard 
                  title="Health Alerts" 
                  value={stats.healthAlerts || 0} 
                  icon={<Warning />} 
                  color="#f43f5e" 
                  loading={isLoading}
                  onClick={() => router.push('/dashboard/guardian/alerts')}
                />
                <StatCard 
                  title="Vaccinations Due" 
                  value={stats.vaccinationDue || stats.pendingVaccinations || 0} 
                  icon={<Vaccines />} 
                  color="#0d9488" 
                  loading={isLoading}
                  onClick={() => router.push('/dashboard/guardian/vaccinations')}
                />
              </>
            )}
          </div>
          
          {/* Additional Admin Stats Row */}
          {userProfile.role === 'admin' && (
            <div className={`grid ${getGridCols()} gap-6 mt-6`}>
              <StatCard 
                title="Guardians" 
                value={stats.totalGuardians || 0} 
                icon={<FamilyRestroom />} 
                color="#0d9488" 
                loading={isLoading}
                onClick={() => router.push('/dashboard/admin/users?role=guardian')}
              />
              <StatCard 
                title="Admins" 
                value={stats.totalAdmins || 0} 
                icon={<Shield />} 
                color="#7c3aed" 
                loading={isLoading}
                onClick={() => router.push('/dashboard/admin/users?role=admin')}
              />
              <StatCard 
                title="Pending Invites" 
                value={stats.pendingInvitations || 0} 
                icon={<Group />} 
                color="#f59e0b" 
                loading={isLoading}
                onClick={() => router.push('/dashboard/admin/invitations')}
              />
              <StatCard 
                title="Active Users" 
                value={stats.activeUsers || 0} 
                icon={<AccountCircle />} 
                color="#059669" 
                loading={isLoading}
                onClick={() => router.push('/dashboard/admin/users?status=active')}
              />
            </div>
          )}
        </div>
      </div>
    </RootDashboardLayout>
  );
}