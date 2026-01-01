// app/dashboard/page.tsx - Tailwind CSS Version
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

const DASHBOARD_COLORS = {
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  }
};

// Role-based color assignments
const ROLE_COLORS = {
  admin: {
    primary: DASHBOARD_COLORS.purple[600],
    gradient: `linear-gradient(135deg, ${DASHBOARD_COLORS.purple[600]} 0%, ${DASHBOARD_COLORS.purple[400]} 100%)`,
    light: DASHBOARD_COLORS.purple[100],
    icon: <AdminPanelSettings />,
    title: 'Admin Portal'
  },
  clinician: {
    primary: DASHBOARD_COLORS.blue[600],
    gradient: `linear-gradient(135deg, ${DASHBOARD_COLORS.teal[700]} 0%, ${DASHBOARD_COLORS.teal[500]} 100%)`,
    light: DASHBOARD_COLORS.blue[100],
    icon: <MedicalServices />,
    title: 'Healthcare Provider Portal'
  },
  guardian: {
    primary: DASHBOARD_COLORS.teal[600],
    gradient: `linear-gradient(135deg, ${DASHBOARD_COLORS.teal[600]} 0%, ${DASHBOARD_COLORS.teal[400]} 100%)`,
    light: DASHBOARD_COLORS.teal[100],
    icon: <ChildCare />,
    title: 'Parent/Guardian Portal'
  },
};

export default function MainDashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading, isAuthenticated, logout } = useAuth();
  
  const [quickStats, setQuickStats] = useState<QuickStats>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsUpdated, setStatsUpdated] = useState<Date | null>(null);

  // Get role-specific colors
  const roleColors = userProfile?.role ? ROLE_COLORS[userProfile.role as keyof typeof ROLE_COLORS] : ROLE_COLORS.guardian;

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

  const getRoleDescription = () => {
    switch (userProfile?.role) {
      case 'admin':
        return 'System Administrator - Manage users, clinics, and settings';
      case 'clinician':
        return 'Healthcare Provider - Monitor patients and appointments';
      case 'guardian':
        return 'Parent/Guardian - Track children\'s health and appointments';
      default:
        return 'User - Access your personal dashboard';
    }
  };

  // Stat Card Component
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    colorIndex = 0,
    loading: cardLoading 
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    colorIndex?: number;
    loading?: boolean;
  }) => {
    const colors = [
      `from-teal-500 to-teal-600`,
      `from-blue-500 to-blue-600`,
      `from-purple-500 to-purple-600`,
      `from-orange-500 to-orange-600`,
    ];
    
    return (
      <div className="h-full flex">
        <div className={`flex-1 bg-gradient-to-br ${colors[colorIndex % colors.length]} rounded-2xl md:rounded-3xl shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 active:shadow-lg min-h-[120px] sm:min-h-[140px] md:min-h-[160px] flex flex-col`}>
          <div className="p-4 sm:p-5 md:p-6 h-full flex flex-col flex-1">
            <div className="flex flex-col h-full justify-between">
              <div className="flex-1">
                <p className="text-white/90 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2 md:mb-3">
                  {title}
                </p>
                {cardLoading ? (
                  <div className="h-8 sm:h-10 md:h-12 w-24 bg-white/30 rounded animate-pulse" />
                ) : (
                  <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-none mb-3 md:mb-4">
                    {value.toLocaleString()}
                  </h2>
                )}
              </div>
              <div className="flex justify-end items-end mt-auto">
                <div className="bg-white/20 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white border border-white/30">
                  {icon}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Action Card Component
  const ActionCard = ({ 
    title, 
    icon, 
    color,
    onClick,
    actionText = 'Manage'
  }: {
    title: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
    actionText?: string;
  }) => (
    <div className="h-full flex">
      <div 
        className="flex-1 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-lg active:scale-95 active:border-teal-300 min-h-[140px] sm:min-h-[160px] md:min-h-[180px] flex flex-col cursor-pointer"
        onClick={onClick}
      >
        <div className="p-4 sm:p-5 md:p-6 h-full flex flex-col flex-1">
          <div className="flex flex-col h-full items-center justify-between text-center">
            <div>
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-5 border-2"
                style={{ backgroundColor: `${color}10`, borderColor: `${color}30`, color: color }}
              >
                {icon}
              </div>
              <h3 className="text-gray-800 text-sm sm:text-base md:text-lg font-semibold leading-tight mb-3">
                {title}
              </h3>
            </div>
            <button 
              className="flex items-center justify-center gap-1 text-sm font-semibold mt-auto"
              style={{ color: color }}
            >
              {actionText}
              <ArrowForward className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Feature Item Component
const FeatureItem = ({ 
  icon, 
  title,
  color
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
}) => (
  <div className="h-full w-full min-w-0">
    <div className="flex items-center p-3 sm:p-4 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 min-h-[72px] sm:min-h-[80px] w-full">
      <div 
        className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}10`, color: color }}
      >
        <div className="text-lg sm:text-xl md:text-2xl">
          {icon}
        </div>
      </div>
      <span className="ml-3 text-gray-800 text-sm sm:text-base font-semibold leading-tight flex-1 break-words line-clamp-2">
        {title}
      </span>
    </div>
  </div>
);

  // ADMIN DASHBOARD
  const AdminDashboard = () => (
    <>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            System Overview
          </h2>
          <button 
            onClick={refreshStats}
            disabled={isLoading}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50"
          >
            <Refresh className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        {statsUpdated && (
          <p className="text-gray-500 text-sm mt-1 hidden sm:block">
            Updated {statsUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-8 md:mb-12">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          <div className="h-full flex flex-col">
            <StatCard
              title="System Users"
              value={quickStats.systemUsers || 0}
              icon={<Groups />}
              colorIndex={0}
              loading={isLoading}
            />
          </div>
          <div className="h-full flex flex-col">
            <StatCard
              title="Active Clinics"
              value={quickStats.activeClinics || 0}
              icon={<LocalHospital />}
              colorIndex={1}
              loading={isLoading}
            />
          </div>
          <div className="h-full flex flex-col">
            <StatCard
              title="Pending Approvals"
              value={quickStats.pendingTasks || 0}
              icon={<Security />}
              colorIndex={2}
              loading={isLoading}
            />
          </div>
          <div className="h-full flex flex-col">
            <StatCard
              title="System Alerts"
              value={quickStats.healthAlerts || 0}
              icon={<MonitorHeart />}
              colorIndex={3}
              loading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 md:mb-7 mt-10 md:mt-14">
        System Management
      </h3>
      
      <div className="mb-10 md:mb-14">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          <div className="h-full flex flex-col">
            <ActionCard
              title="User Management"
              icon={<ManageAccounts />}
              color="#9333ea"
              onClick={() => router.push('/dashboard/admin/users')}
            />
          </div>
          <div className="h-full flex flex-col">
            <ActionCard
              title="Clinic Management"
              icon={<Business />}
              color="#2563eb"
              onClick={() => router.push('/dashboard/admin/clinics')}
            />
          </div>
          <div className="h-full flex flex-col">
            <ActionCard
              title="System Settings"
              icon={<Settings />}
              color="#f97316"
              onClick={() => router.push('/dashboard/admin/settings')}
            />
          </div>
          <div className="h-full flex flex-col">
            <ActionCard
              title="Analytics"
              icon={<Analytics />}
              color="#0d9488"
              onClick={() => router.push('/dashboard/admin/reports')}
            />
          </div>
        </div>
      </div>
    </>
  );

  // CLINICIAN DASHBOARD
  const ClinicianDashboard = () => (
    <>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif bg-black bg-clip-text text-transparent">
            Patient Care Overview
          </h2>
          <button 
            onClick={refreshStats}
            disabled={isLoading}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <Refresh className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        {statsUpdated && (
          <p className="text-gray-500 text-sm mt-1 hidden sm:block">
            Updated {statsUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-8 md:mb-12">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          <div className="h-full flex flex-col">
            <StatCard
              title="My Patients"
              value={quickStats.totalPatients || 0}
              icon={<People />}
              colorIndex={0}
              loading={isLoading}
            />
          </div>
          <div className="h-full flex flex-col">
            <StatCard
              title="Today's Appointments"
              value={quickStats.upcomingAppointments || 0}
              icon={<CalendarToday />}
              colorIndex={1}
              loading={isLoading}
            />
          </div>
          <div className="h-full flex flex-col">
            <StatCard
              title="Pending Tasks"
              value={quickStats.pendingTasks || 0}
              icon={<Assignment />}
              colorIndex={2}
              loading={isLoading}
            />
          </div>
          <div className="h-full flex flex-col">
            <StatCard
              title="Health Alerts"
              value={quickStats.healthAlerts || 0}
              icon={<Warning />}
              colorIndex={3}
              loading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="text-xl sm:text-2xl font-serif text-black mb-5 md:mb-7 mt-10 md:mt-14">
        Healthcare Management
      </h3>
      
      <div className="mb-10 md:mb-14">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          <div className="h-full flex flex-col">
            <ActionCard
              title="Patient Management"
              icon={<MedicalServices />}
              color="#2563eb"
              onClick={() => router.push('/dashboard/clinicians/children')}
            />
          </div>
          <div className="h-full flex flex-col">
            <ActionCard
              title="Appointments"
              icon={<CalendarToday />}
              color="#f97316"
              onClick={() => router.push('/dashboard/clinicians/appointments')}
            />
          </div>
          <div className="h-full flex flex-col">
            <ActionCard
              title="Growth Tracking"
              icon={<TrendingUp />}
              color="#0d9488"
              onClick={() => router.push('/dashboard/clinicians/growth')}
            />
          </div>
          <div className="h-full flex flex-col">
            <ActionCard
              title="Medical Alerts"
              icon={<MedicalInformation />}
              color="#ec4899"
              onClick={() => router.push('/dashboard/clinicians/alerts')}
            />
          </div>
        </div>
      </div>
    </>
  );

  // GUARDIAN DASHBOARD
  const GuardianDashboard = () => (
    <>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
            Children Health Overview
          </h2>
          <button 
            onClick={refreshStats}
            disabled={isLoading}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors disabled:opacity-50"
          >
            <Refresh className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        {statsUpdated && (
          <p className="text-gray-500 text-sm mt-1 hidden sm:block">
            Updated {statsUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-8 md:mb-12">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          <div className="h-full flex flex-col">
            <StatCard
              title="My Children"
              value={quickStats.totalPatients || 0}
              icon={<FamilyRestroom />}
              colorIndex={0}
              loading={isLoading}
            />
          </div>
          <div className="h-full flex flex-col">
            <StatCard
              title="Today's Appointments"
              value={quickStats.upcomingAppointments || 0}
              icon={<CalendarToday />}
              colorIndex={1}
              loading={isLoading}
            />
          </div>
          <div className="h-full flex flex-col">
            <StatCard
              title="Health Alerts"
              value={quickStats.healthAlerts || 0}
              icon={<Warning />}
              colorIndex={2}
              loading={isLoading}
            />
          </div>
          <div className="h-full flex flex-col">
            <StatCard
              title="Vaccinations Due"
              value={quickStats.pendingVaccinations || 0}
              icon={<Vaccines />}
              colorIndex={3}
              loading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 md:mb-7 mt-10 md:mt-14">
        Child Health Management
      </h3>
      
      <div className="mb-10 md:mb-14">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          <div className="h-full flex flex-col">
            <ActionCard
              title="My Children"
              icon={<ChildCare />}
              color="#0d9488"
              onClick={() => router.push('/dashboard/guardian/children')}
            />
          </div>
          <div className="h-full flex flex-col">
            <ActionCard
              title="Appointments"
              icon={<CalendarToday />}
              color="#f97316"
              onClick={() => router.push('/dashboard/guardian/appointments')}
            />
          </div>
          <div className="h-full flex flex-col">
            <ActionCard
              title="Vaccinations"
              icon={<Vaccines />}
              color="#06b6d4"
              onClick={() => router.push('/dashboard/guardian/vaccinations')}
            />
          </div>
          <div className="h-full flex flex-col">
            <ActionCard
              title="Health Records"
              icon={<HealthAndSafety />}
              color="#9333ea"
              onClick={() => router.push('/dashboard/guardian/records')}
            />
          </div>
        </div>
      </div>
    </>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-teal-500 to-teal-600 px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6" />
        <h2 className="text-white text-lg sm:text-xl md:text-2xl font-semibold text-center">
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-teal-50">
      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 rounded-t-2xl px-4 py-3 flex justify-around items-center shadow-lg">
        <button 
          onClick={() => router.push('/profile')}
          className="flex flex-col items-center text-gray-500 active:text-teal-600 transition-colors"
        >
          <Settings className="text-xl mb-1" />
          <span className="text-xs">Profile</span>
        </button>
        
        <button className="flex flex-col items-center text-gray-500 active:text-teal-600 transition-colors relative">
          <div className="relative">
            <Notifications className="text-xl mb-1" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </div>
          <span className="text-xs">Alerts</span>
        </button>
        
        <div 
          className="relative -top-8 bg-gradient-to-br from-teal-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          onClick={handleNavigateToRoleDashboard}
        >
          <DashboardIcon className="text-white text-2xl" />
        </div>
        
        <button className="flex flex-col items-center text-gray-500 active:text-teal-600 transition-colors">
          <History className="text-xl mb-1" />
          <span className="text-xs">Recent</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center text-pink-500 active:text-pink-600 transition-colors"
        >
          <ExitToApp className="text-xl mb-1" />
          <span className="text-xs">Logout</span>
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:block sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
              <MedicalServices className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                WellChildCare
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                Pediatric Healthcare System
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors relative">
              <Notifications className="text-xl" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 rounded-lg border border-teal-200 text-teal-700 hover:border-teal-300 hover:bg-teal-50 transition-colors text-sm md:text-base"
            >
              <Settings className="inline mr-2" />
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white hover:shadow-lg transition-all text-sm md:text-base"
            >
              <ExitToApp className="inline mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-10 pb-20 sm:pb-10">
        {/* Welcome Header */}
        <div 
          className="p-6 sm:p-8 md:p-10 mb-8 sm:mb-12 md:mb-16 rounded-3xl sm:rounded-4xl shadow-xl"
          style={{ background: roleColors.gradient }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-8 md:gap-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-white px-3 py-1.5 rounded-full text-sm font-semibold mb-4 border border-white/30">
                {roleColors.icon}
                {roleColors.title}
              </div>
              
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                Welcome back, {userProfile.name?.split(' ')[0] || 'User'}!
              </h1>
              
              <p className="text-white/90 text-base sm:text-sm md:text-lg mb-8 hidden sm:block">
                {getRoleDescription()}
              </p>
            </div>
            
            <button
              onClick={handleNavigateToRoleDashboard}
              className="hidden sm:flex items-center gap-2 bg-white text-teal-600 hover:bg-gray-50 px-6 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <DashboardIcon />
              Go to Full Dashboard
              <NavigateNext />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 sm:mb-8 p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-red-500 text-white">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{error}</span>
              <button onClick={() => setError(null)} className="text-white/80 hover:text-white">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-6">
            <div 
              className="h-full rounded-full animate-pulse"
              style={{ background: roleColors.gradient, width: '100%' }}
            />
          </div>
        )}

        {/* Dashboard Content */}
        {renderRoleDashboard()}

        {/* Features Section */}
       <div className="mt-12 sm:mt-16 md:mt-20 p-4 sm:p-6 md:p-8 lg:p-10 bg-white rounded-2xl sm:rounded-3xl md:rounded-4xl shadow-lg border border-gray-100">
  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-10 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
    Healthcare Features
  </h2>
  
  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
    <div className="h-full flex flex-col min-w-0">
      <FeatureItem
        icon={<HealthAndSafety />}
        title="Health Monitoring"
        color="#0d9488"
      />
    </div>
    <div className="h-full flex flex-col min-w-0">
      <FeatureItem
        icon={<CalendarToday />}
        title="Appointments"
        color="#f97316"
      />
    </div>
    <div className="h-full flex flex-col min-w-0">
      <FeatureItem
        icon={<TrendingUp />}
        title="Growth Analytics"
        color="#2563eb"
      />
    </div>
    <div className="h-full flex flex-col min-w-0">
      <FeatureItem
        icon={<Vaccines />}
        title="Vaccinations"
        color="#06b6d4"
      />
    </div>
    <div className="h-full flex flex-col min-w-0">
      <FeatureItem
        icon={<MedicalInformation />}
        title="Medical Records"
        color="#9333ea"
      />
    </div>
    <div className="h-full flex flex-col min-w-0">
      <FeatureItem
        icon={<Timeline />}
        title="Progress Tracking"
        color="#4f46e5"
      />
    </div>
  </div>
</div>
    </main>
    </div>
  );
}