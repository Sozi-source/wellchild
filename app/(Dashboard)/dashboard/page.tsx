// app/dashboard/page.tsx - Professional Color Version
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  People,
  CalendarToday,
  MedicalServices,
  Assignment,
  Warning,
  Settings,
  ExitToApp,
  AdminPanelSettings,
  History,
  ChildCare,
  ArrowForward,
  Dashboard as DashboardIcon,
  Notifications,
  Refresh,
  TrendingUp,
  MonitorHeart,
  Vaccines,
  LocalHospital,
  FamilyRestroom,
  HealthAndSafety,
  Groups,
  Security,
  Business,
  ManageAccounts,
  Analytics,
  MedicalInformation,
  CheckCircle,
  Timeline,
  NavigateNext,
  Menu as MenuIcon,
  Add,
  AccessTime,
  Star,
  School,
  School as SchoolIcon,
  MoreVert,
  OpenInNew,
  ExpandMore,
  Today
} from '@mui/icons-material';

// Import Firestore functions for basic stats
import { 
  collection, 
  query, 
  where, 
  getCountFromServer,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/app/lib/firebase/firebase';

// Types for quick stats
interface QuickStats {
  totalPatients?: number;
  upcomingAppointments?: number;
  healthAlerts?: number;
  pendingTasks?: number;
  systemUsers?: number;
  activeClinics?: number;
  pendingVaccinations?: number;
}

// Professional color palette
const COLORS = {
  // Primary colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  // Secondary colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Accent colors
  accent: {
    teal: '#0d9488',
    emerald: '#059669',
    violet: '#7c3aed',
    rose: '#f43f5e',
    amber: '#f59e0b',
  },
  // Role-specific gradients
  gradients: {
    admin: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    clinician: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    guardian: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  }
};

// Role-based styling
const ROLE_STYLES = {
  admin: {
    title: 'System Administrator',
    description: 'Manage users, clinics, and settings',
    gradient: COLORS.gradients.admin,
    color: COLORS.accent.violet,
    iconBg: 'bg-gradient-to-br from-violet-500 to-violet-600',
    iconColor: 'text-violet-600'
  },
  clinician: {
    title: 'Healthcare Provider',
    description: 'Monitor patients and appointments',
    gradient: COLORS.gradients.clinician,
    color: COLORS.primary[600],
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    iconColor: 'text-blue-600'
  },
  guardian: {
    title: 'Parent/Guardian',
    description: 'Track children\'s health and appointments',
    gradient: COLORS.gradients.guardian,
    color: COLORS.accent.emerald,
    iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    iconColor: 'text-emerald-600'
  },
};

export default function MainDashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading, isAuthenticated, logout } = useAuth();
  
  const [quickStats, setQuickStats] = useState<QuickStats>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsUpdated, setStatsUpdated] = useState<Date | null>(null);

  // Get role-specific styles
  const roleStyles = userProfile?.role ? 
    ROLE_STYLES[userProfile.role as keyof typeof ROLE_STYLES] : 
    ROLE_STYLES.guardian;

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch basic stats for the landing page
  useEffect(() => {
    if (!userProfile || loading || !user) return;

    const fetchQuickStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const stats: QuickStats = {};

        // Fetch basic stats based on role
        switch (userProfile.role) {
          case 'admin':
            const usersSnapshot = await getCountFromServer(collection(db, 'users'));
            stats.systemUsers = usersSnapshot.data().count;

            try {
              const clinicsSnapshot = await getCountFromServer(collection(db, 'clinics'));
              stats.activeClinics = clinicsSnapshot.data().count;
            } catch {
              stats.activeClinics = 0;
            }

            const alertsQuery = query(
              collection(db, 'system_alerts'),
              where('resolved', '==', false)
            );
            try {
              const alertsSnapshot = await getCountFromServer(alertsQuery);
              stats.healthAlerts = alertsSnapshot.data().count;
            } catch {
              stats.healthAlerts = 0;
            }

            const approvalsQuery = query(
              collection(db, 'approvals'),
              where('status', '==', 'pending')
            );
            try {
              const approvalsSnapshot = await getCountFromServer(approvalsQuery);
              stats.pendingTasks = approvalsSnapshot.data().count;
            } catch {
              stats.pendingTasks = 0;
            }
            break;

          case 'clinician':
            const clinicianPatientsQuery = query(
              collection(db, 'patients'),
              where('clinicianId', '==', user.uid),
              where('status', '==', 'active')
            );
            const clinicianPatientsSnapshot = await getCountFromServer(clinicianPatientsQuery);
            stats.totalPatients = clinicianPatientsSnapshot.data().count;

            const todayForClinician = new Date();
            todayForClinician.setHours(0, 0, 0, 0);
            const tomorrowForClinician = new Date(todayForClinician);
            tomorrowForClinician.setDate(tomorrowForClinician.getDate() + 1);

            const todayAppointmentsQuery = query(
              collection(db, 'appointments'),
              where('clinicianId', '==', user.uid),
              where('date', '>=', Timestamp.fromDate(todayForClinician)),
              where('date', '<', Timestamp.fromDate(tomorrowForClinician)),
              where('status', '==', 'scheduled')
            );
            const todayAppointmentsSnapshot = await getCountFromServer(todayAppointmentsQuery);
            stats.upcomingAppointments = todayAppointmentsSnapshot.data().count;

            const medicalTasksQuery = query(
              collection(db, 'medical_tasks'),
              where('clinicianId', '==', user.uid),
              where('status', '==', 'pending')
            );
            try {
              const medicalTasksSnapshot = await getCountFromServer(medicalTasksQuery);
              stats.pendingTasks = medicalTasksSnapshot.data().count;
            } catch {
              stats.pendingTasks = 0;
            }

            const clinicianAlertsQuery = query(
              collection(db, 'patient_alerts'),
              where('clinicianId', '==', user.uid),
              where('status', '==', 'active')
            );
            try {
              const clinicianAlertsSnapshot = await getCountFromServer(clinicianAlertsQuery);
              stats.healthAlerts = clinicianAlertsSnapshot.data().count;
            } catch {
              stats.healthAlerts = 0;
            }
            break;

          case 'guardian':
            const guardianPatientsQuery = query(
              collection(db, 'patients'),
              where('guardianId', '==', user.uid),
              where('status', '==', 'active')
            );
            const guardianPatientsSnapshot = await getCountFromServer(guardianPatientsQuery);
            stats.totalPatients = guardianPatientsSnapshot.data().count;

            const todayForGuardian = new Date();
            todayForGuardian.setHours(0, 0, 0, 0);
            const tomorrowForGuardian = new Date(todayForGuardian);
            tomorrowForGuardian.setDate(tomorrowForGuardian.getDate() + 1);

            const guardianAppointmentsQuery = query(
              collection(db, 'appointments'),
              where('guardianId', '==', user.uid),
              where('date', '>=', Timestamp.fromDate(todayForGuardian)),
              where('date', '<', Timestamp.fromDate(tomorrowForGuardian)),
              where('status', '==', 'scheduled')
            );
            const guardianAppointmentsSnapshot = await getCountFromServer(guardianAppointmentsQuery);
            stats.upcomingAppointments = guardianAppointmentsSnapshot.data().count;

            const guardianAlertsQuery = query(
              collection(db, 'patient_alerts'),
              where('guardianId', '==', user.uid),
              where('status', '==', 'active')
            );
            try {
              const guardianAlertsSnapshot = await getCountFromServer(guardianAlertsQuery);
              stats.healthAlerts = guardianAlertsSnapshot.data().count;
            } catch {
              stats.healthAlerts = 0;
            }

            const vaccinationsQuery = query(
              collection(db, 'vaccinations'),
              where('guardianId', '==', user.uid),
              where('status', '==', 'pending'),
              where('dueDate', '<=', Timestamp.now())
            );
            try {
              const vaccinationsSnapshot = await getCountFromServer(vaccinationsQuery);
              stats.pendingVaccinations = vaccinationsSnapshot.data().count;
            } catch {
              stats.pendingVaccinations = 0;
            }
            break;
        }

        setQuickStats(stats);
        setStatsUpdated(new Date());
      } catch (err: any) {
        console.error('Error fetching quick stats:', err);
        
        const fallbackStats: QuickStats = {
          totalPatients: userProfile.role === 'clinician' ? 0 : 
                        userProfile.role === 'guardian' ? 0 : undefined,
          upcomingAppointments: (userProfile.role === 'clinician' || userProfile.role === 'guardian') ? 0 : undefined,
          healthAlerts: (userProfile.role === 'clinician' || userProfile.role === 'guardian') ? 0 : undefined,
          pendingTasks: userProfile.role === 'admin' ? 0 : 
                       userProfile.role === 'clinician' ? 0 : undefined,
          systemUsers: userProfile.role === 'admin' ? 0 : undefined,
          activeClinics: userProfile.role === 'admin' ? 0 : undefined,
          pendingVaccinations: userProfile.role === 'guardian' ? 0 : undefined
        };
        setQuickStats(fallbackStats);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuickStats();
  }, [userProfile, loading, user]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Logout failed. Please try again.');
    }
  };

  const handleNavigateToRoleDashboard = () => {
    if (!userProfile) return;
    
    switch (userProfile.role) {
      case 'admin':
        router.push('/dashboard/admin');
        break;
      case 'clinician':
        router.push('/dashboard/clinicians');
        break;
      case 'guardian':
        router.push('/dashboard/guardian');
        break;
      default:
        router.push('/profile');
    }
  };

  const refreshStats = () => {
    if (!userProfile || loading || !user) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Stat Card Component - Professional Design
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color,
    loading: cardLoading 
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    loading?: boolean;
  }) => {
    return (
      <div className="h-full">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-200 min-h-[120px] flex flex-col h-full group">
          <div className="p-4 sm:p-5 h-full flex flex-col flex-1">
            <div className="flex flex-col h-full justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-xs font-medium uppercase tracking-wider mb-3">
                  {title}
                </p>
                {cardLoading ? (
                  <div className="h-10 w-32 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <h2 className="text-gray-900 text-2xl sm:text-3xl font-semibold leading-none">
                    {value.toLocaleString()}
                  </h2>
                )}
              </div>
              <div className="flex justify-end items-end mt-auto pt-4">
                <div 
                  className={`p-2 rounded-lg transition-transform duration-200 group-hover:scale-110`}
                  style={{ color }}
                >
                  {icon}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Action Card Component - Professional Design
  const ActionCard = ({ 
    title, 
    icon, 
    color,
    onClick,
    actionText = 'View'
  }: {
    title: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
    actionText?: string;
  }) => (
    <div className="h-full">
      <button
        onClick={onClick}
        className="w-full h-full bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 min-h-[140px] flex flex-col text-left active:scale-[0.98] group"
      >
        <div className="p-4 sm:p-5 h-full flex flex-col flex-1">
          <div className="flex flex-col h-full items-start justify-between">
            <div 
              className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
              style={{ 
                background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                color: color,
                border: `1px solid ${color}20`
              }}
            >
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 text-sm sm:text-base font-medium leading-tight mb-3">
                {title}
              </h3>
            </div>
            <div 
              className="flex items-center text-sm font-medium transition-colors mt-auto group-hover:translate-x-1"
              style={{ color }}
            >
              {actionText}
              <ArrowForward className="ml-1 text-base transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );

  // Feature Item Component - Professional Design
  const FeatureItem = ({ 
    icon, 
    title,
    color
  }: {
    icon: React.ReactNode;
    title: string;
    color: string;
  }) => (
    <div className="h-full w-full">
      <div className="flex items-center p-3 rounded-lg hover:shadow-md transition-all duration-200 min-h-[64px] w-full border border-gray-100 bg-white group hover:border-gray-200">
        <div 
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ 
            background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
            color: color
          }}
        >
          {icon}
        </div>
        <span className="ml-3 text-gray-700 text-sm font-medium leading-tight flex-1">
          {title}
        </span>
      </div>
    </div>
  );

  // ADMIN DASHBOARD
  const AdminDashboard = () => (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            System Overview
          </h2>
          <button 
            onClick={refreshStats}
            disabled={isLoading}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors disabled:opacity-50 hover:shadow-md"
          >
            <Refresh className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        {statsUpdated && (
          <p className="text-gray-500 text-sm mt-1">
            Updated {statsUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="System Users"
            value={quickStats.systemUsers || 0}
            icon={<Groups />}
            color={COLORS.accent.violet}
            loading={isLoading}
          />
          <StatCard
            title="Active Clinics"
            value={quickStats.activeClinics || 0}
            icon={<LocalHospital />}
            color={COLORS.primary[600]}
            loading={isLoading}
          />
          <StatCard
            title="Pending Approvals"
            value={quickStats.pendingTasks || 0}
            icon={<Security />}
            color={COLORS.accent.amber}
            loading={isLoading}
          />
          <StatCard
            title="System Alerts"
            value={quickStats.healthAlerts || 0}
            icon={<MonitorHeart />}
            color={COLORS.accent.rose}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="text-xl font-semibold text-gray-900 mb-6 mt-12">
        System Management
      </h3>
      
      <div className="mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            title="User Management"
            icon={<ManageAccounts />}
            color={COLORS.accent.violet}
            onClick={() => router.push('/dashboard/admin/users')}
          />
          <ActionCard
            title="Clinic Management"
            icon={<Business />}
            color={COLORS.primary[600]}
            onClick={() => router.push('/dashboard/admin/clinics')}
          />
          <ActionCard
            title="System Settings"
            icon={<Settings />}
            color={COLORS.accent.amber}
            onClick={() => router.push('/dashboard/admin/settings')}
          />
          <ActionCard
            title="Analytics"
            icon={<Analytics />}
            color={COLORS.accent.teal}
            onClick={() => router.push('/dashboard/admin/reports')}
          />
        </div>
      </div>
    </>
  );

  // CLINICIAN DASHBOARD
  const ClinicianDashboard = () => (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Patient Care Overview
          </h2>
          <button 
            onClick={refreshStats}
            disabled={isLoading}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 hover:shadow-md"
          >
            <Refresh className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        {statsUpdated && (
          <p className="text-gray-500 text-sm mt-1">
            Updated {statsUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Patients"
            value={quickStats.totalPatients || 0}
            icon={<People />}
            color={COLORS.primary[600]}
            loading={isLoading}
          />
          <StatCard
            title="Today's Appointments"
            value={quickStats.upcomingAppointments || 0}
            icon={<CalendarToday />}
            color={COLORS.accent.emerald}
            loading={isLoading}
          />
          <StatCard
            title="Pending Tasks"
            value={quickStats.pendingTasks || 0}
            icon={<Assignment />}
            color={COLORS.accent.amber}
            loading={isLoading}
          />
          <StatCard
            title="Health Alerts"
            value={quickStats.healthAlerts || 0}
            icon={<Warning />}
            color={COLORS.accent.rose}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="text-xl font-semibold text-gray-900 mb-6 mt-12">
        Healthcare Management
      </h3>
      
      <div className="mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            title="Patient Management"
            icon={<MedicalServices />}
            color={COLORS.primary[600]}
            onClick={() => router.push('/dashboard/clinicians/children')}
          />
          <ActionCard
            title="Appointments"
            icon={<CalendarToday />}
            color={COLORS.accent.emerald}
            onClick={() => router.push('/dashboard/clinicians/appointments')}
          />
          <ActionCard
            title="Growth Tracking"
            icon={<TrendingUp />}
            color={COLORS.accent.teal}
            onClick={() => router.push('/dashboard/clinicians/growth')}
          />
          <ActionCard
            title="Medical Alerts"
            icon={<MedicalInformation />}
            color={COLORS.accent.violet}
            onClick={() => router.push('/dashboard/clinicians/alerts')}
          />
        </div>
      </div>
    </>
  );

  // GUARDIAN DASHBOARD
  const GuardianDashboard = () => (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Children Health Overview
          </h2>
          <button 
            onClick={refreshStats}
            disabled={isLoading}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50 hover:shadow-md"
          >
            <Refresh className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        {statsUpdated && (
          <p className="text-gray-500 text-sm mt-1">
            Updated {statsUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Children"
            value={quickStats.totalPatients || 0}
            icon={<FamilyRestroom />}
            color={COLORS.accent.emerald}
            loading={isLoading}
          />
          <StatCard
            title="Today's Appointments"
            value={quickStats.upcomingAppointments || 0}
            icon={<CalendarToday />}
            color={COLORS.primary[600]}
            loading={isLoading}
          />
          <StatCard
            title="Health Alerts"
            value={quickStats.healthAlerts || 0}
            icon={<Warning />}
            color={COLORS.accent.rose}
            loading={isLoading}
          />
          <StatCard
            title="Vaccinations Due"
            value={quickStats.pendingVaccinations || 0}
            icon={<Vaccines />}
            color={COLORS.accent.teal}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="text-xl font-semibold text-gray-900 mb-6 mt-12">
        Child Health Management
      </h3>
      
      <div className="mb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            title="My Children"
            icon={<ChildCare />}
            color={COLORS.accent.emerald}
            onClick={() => router.push('/dashboard/guardian/children')}
          />
          <ActionCard
            title="Appointments"
            icon={<CalendarToday />}
            color={COLORS.primary[600]}
            onClick={() => router.push('/dashboard/guardian/appointments')}
          />
          <ActionCard
            title="Vaccinations"
            icon={<Vaccines />}
            color={COLORS.accent.teal}
            onClick={() => router.push('/dashboard/guardian/vaccinations')}
          />
          <ActionCard
            title="Health Records"
            icon={<HealthAndSafety />}
            color={COLORS.accent.violet}
            onClick={() => router.push('/dashboard/guardian/records')}
          />
        </div>
      </div>
    </>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-blue-600 px-4">
        <div className="w-16 h-16 border-3 border-white/30 border-t-white rounded-full animate-spin mb-6" />
        <h2 className="text-white text-xl font-medium">
          Loading your dashboard...
        </h2>
      </div>
    );
  }

  if (!isAuthenticated || !userProfile) {
    return null;
  }

  // Render role-specific dashboard
  const renderRoleDashboard = () => {
    switch (userProfile.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'clinician':
        return <ClinicianDashboard />;
      case 'guardian':
        return <GuardianDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3 flex justify-around items-center shadow-lg">
        <button 
          onClick={() => router.push('/profile')}
          className="flex flex-col items-center text-gray-600 active:text-blue-600 transition-colors"
        >
          <Settings className="text-xl mb-1" />
          <span className="text-xs">Profile</span>
        </button>
        
        <button className="flex flex-col items-center text-gray-600 active:text-blue-600 transition-colors relative">
          <div className="relative">
            <Notifications className="text-xl mb-1" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-rose-500 to-rose-600 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </div>
          <span className="text-xs">Alerts</span>
        </button>
        
        <div 
          className="relative -top-8 bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform shadow-blue-500/30"
          onClick={handleNavigateToRoleDashboard}
        >
          <DashboardIcon className="text-white text-2xl" />
        </div>
        
        <button className="flex flex-col items-center text-gray-600 active:text-blue-600 transition-colors">
          <History className="text-xl mb-1" />
          <span className="text-xs">Recent</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center text-gray-600 active:text-rose-600 transition-colors"
        >
          <ExitToApp className="text-xl mb-1" />
          <span className="text-xs">Logout</span>
        </button>
      </div>

      {/* Desktop Navigation */}
       <main className="max-w-7xl mx-auto px-4 py-8 pb-20 sm:pb-8 mt-5">
        {/* Welcome Header */}
        <div 
          className="p-6 rounded-xl shadow-lg mb-8 relative overflow-hidden"
          style={{ background: roleStyles.gradient }}
        >
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-white/90 px-3 py-1.5 rounded-full text-sm font-medium mb-4 bg-white/10 backdrop-blur-sm border border-white/20">
                  {userProfile.role === 'admin' && <AdminPanelSettings />}
                  {userProfile.role === 'clinician' && <MedicalServices />}
                  {userProfile.role === 'guardian' && <ChildCare />}
                  {roleStyles.title}
                </div>
                
                <h1 className="text-2xl font-semibold text-white mb-2">
                  Welcome back, {userProfile.name?.split(' ')[0] || 'User'}!
                </h1>
                
                <p className="text-white/80 mb-4">
                  {roleStyles.description}
                </p>
              </div>
              
              <button
                onClick={handleNavigateToRoleDashboard}
                className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-50 px-4 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <DashboardIcon />
                Go to Dashboard
                <NavigateNext />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md">
            <div className="flex justify-between items-center">
              <span className="font-medium">{error}</span>
              <button onClick={() => setError(null)} className="text-white/80 hover:text-white">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mb-6 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full animate-pulse"
              style={{ 
                background: roleStyles.gradient,
                width: '100%' 
              }}
            />
          </div>
        )}

        {/* Dashboard Content */}
        {renderRoleDashboard()}

        {/* Features Section */}
        <div className="mt-12 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Healthcare Features
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FeatureItem
              icon={<HealthAndSafety />}
              title="Health Monitoring"
              color={COLORS.accent.emerald}
            />
            <FeatureItem
              icon={<CalendarToday />}
              title="Appointments"
              color={COLORS.primary[600]}
            />
            <FeatureItem
              icon={<TrendingUp />}
              title="Growth Analytics"
              color={COLORS.accent.teal}
            />
            <FeatureItem
              icon={<Vaccines />}
              title="Vaccinations"
              color={COLORS.primary[400]}
            />
            <FeatureItem
              icon={<MedicalInformation />}
              title="Medical Records"
              color={COLORS.accent.violet}
            />
            <FeatureItem
              icon={<Timeline />}
              title="Progress Tracking"
              color={COLORS.accent.amber}
            />
          </div>
        </div>
      </main>
    </div>
  );
}