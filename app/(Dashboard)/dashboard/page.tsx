// app/dashboard/page.tsx - COMPLETE DASHBOARD
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Stack, 
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  People,
  CalendarToday,
  MedicalServices,
  Assignment,
  Notifications,
  TrendingUp,
  AccessTime,
  CheckCircle,
  Warning,
  PersonAdd,
  EventNote,
  AssignmentTurnedIn,
  Vaccines,
  Height,
  Scale,
  MonitorHeart,
  Chat,
  Settings,
  ExitToApp,
  AdminPanelSettings,
  History,
  Schedule,
  Star,
  LocalHospital
} from '@mui/icons-material';
import { format } from 'date-fns';

// Types for dashboard data
interface DashboardStats {
  totalPatients: number;
  upcomingAppointments: number;
  pendingTasks: number;
  healthAlerts: number;
  recentActivity: ActivityItem[];
  systemHealth: 'good' | 'warning' | 'critical';
  growthMeasurements: GrowthMeasurement[];
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'appointment' | 'record' | 'alert' | 'system';
}

interface GrowthMeasurement {
  date: Date;
  height: number;
  weight: number;
  headCircumference?: number;
  ageInMonths: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading, isAuthenticated, logout } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch dashboard stats
  useEffect(() => {
    if (!userProfile || loading) return;

    const fetchDashboardStats = async () => {
      setIsLoadingStats(true);
      setError(null);

      try {
        // Simulate API call - replace with actual data fetching
        const mockStats: DashboardStats = {
          totalPatients: userProfile.patients?.length || 0,
          upcomingAppointments: 3,
          pendingTasks: 2,
          healthAlerts: 1,
          systemHealth: 'good',
          recentActivity: [
            {
              id: '1',
              title: 'New growth measurement recorded',
              description: 'Height and weight measurements for Patient A',
              timestamp: new Date(Date.now() - 3600000), // 1 hour ago
              type: 'record'
            },
            {
              id: '2',
              title: 'Appointment scheduled',
              description: 'Annual checkup with Dr. Smith',
              timestamp: new Date(Date.now() - 86400000), // 1 day ago
              type: 'appointment'
            },
            {
              id: '3',
              title: 'Health alert',
              description: 'Patient B has vaccination due',
              timestamp: new Date(Date.now() - 172800000), // 2 days ago
              type: 'alert'
            }
          ],
          growthMeasurements: [
            {
              date: new Date(Date.now() - 86400000),
              height: 85,
              weight: 12,
              headCircumference: 45,
              ageInMonths: 24
            },
            {
              date: new Date(Date.now() - 2592000000),
              height: 80,
              weight: 11.5,
              ageInMonths: 23
            }
          ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setDashboardStats(mockStats);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, [userProfile, loading]);

  // Loading state
  if (loading) {
    return (
      <Container sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        gap: 3
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  // If not authenticated (should redirect, but just in case)
  if (!isAuthenticated || !userProfile) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Logout failed. Please try again.');
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const getRoleColor = () => {
    switch (userProfile.role) {
      case 'admin': return 'error';
      case 'clinician': return 'primary';
      case 'guardian': return 'success';
      default: return 'default';
    }
  };

  const getRoleIcon = () => {
    switch (userProfile.role) {
      case 'admin': return <AdminPanelSettings />;
      case 'clinician': return <MedicalServices />;
      case 'guardian': return <People />;
      default: return <People />;
    }
  };

  const getRoleDashboard = () => {
    switch (userProfile.role) {
      case 'admin':
        return <AdminDashboard stats={dashboardStats} onNavigate={handleNavigation} />;
      case 'clinician':
        return <ClinicianDashboard stats={dashboardStats} userProfile={userProfile} onNavigate={handleNavigation} />;
      case 'guardian':
        return <GuardianDashboard stats={dashboardStats} userProfile={userProfile} onNavigate={handleNavigation} />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} className='mt-5'>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header Section */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'white',
                color: 'primary.main',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              {userProfile.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Welcome back, {userProfile.name || user?.email?.split('@')[0]}!
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip 
                  label={userProfile.role === 'admin' ? 'Administrator' : 
                         userProfile.role === 'clinician' ? 'Healthcare Provider' : 'Parent/Guardian'}
                  color={getRoleColor()}
                  sx={{ 
                    fontWeight: 600,
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                  icon={getRoleIcon()}
                />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {userProfile.email || user?.email}
                </Typography>
              </Stack>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => handleNavigation('/profile')}
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': { 
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Profile
            </Button>
            <Button
              variant="contained"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { 
                  bgcolor: 'grey.100' 
                }
              }}
            >
              Logout
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Dashboard Content */}
      {isLoadingStats ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Role-specific Dashboard */}
          {getRoleDashboard()}

          {/* Recent Activity Section (Common for all roles) */}
          {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 && (
            <Paper sx={{ p: 3, mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <History />
                Recent Activity
              </Typography>
              <Grid container spacing={2}>
                {dashboardStats.recentActivity.map((activity) => (
                  <Grid item xs={12} key={activity.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar
                            sx={{
                              bgcolor: activity.type === 'appointment' ? 'primary.light' :
                                       activity.type === 'record' ? 'success.light' :
                                       activity.type === 'alert' ? 'warning.light' : 'info.light'
                            }}
                          >
                            {activity.type === 'appointment' && <CalendarToday />}
                            {activity.type === 'record' && <Assignment />}
                            {activity.type === 'alert' && <Warning />}
                            {activity.type === 'system' && <Settings />}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={500}>
                              {activity.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(activity.timestamp, 'MMM d, yyyy h:mm a')}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
}

// Admin Dashboard Component
function AdminDashboard({ stats, onNavigate }: { 
  stats: DashboardStats | null, 
  onNavigate: (path: string) => void 
}) {
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* System Health */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <MonitorHeart color="primary" />
                  <Typography variant="h6">System Health</Typography>
                </Stack>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" color="primary">
                      {stats?.systemHealth === 'good' ? 'Good' : 
                       stats?.systemHealth === 'warning' ? 'Warning' : 'Critical'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All systems operational
                    </Typography>
                  </Box>
                  {stats?.systemHealth === 'good' ? (
                    <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />
                  ) : (
                    <Warning sx={{ fontSize: 48, color: stats?.systemHealth === 'warning' ? 'warning.main' : 'error.main' }} />
                  )}
                </Box>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => onNavigate('/admin/system')}
                >
                  View Details
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Users */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'secondary.main' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <People color="secondary" />
                  <Typography variant="h6">Total Users</Typography>
                </Stack>
                <Typography variant="h3" color="secondary">
                  42
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registered users
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary"
                  fullWidth
                  onClick={() => onNavigate('/admin/users')}
                  startIcon={<PersonAdd />}
                >
                  Manage Users
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Patients */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <LocalHospital color="success" />
                  <Typography variant="h6">Active Patients</Typography>
                </Stack>
                <Typography variant="h3" color="success.main">
                  {stats?.totalPatients || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Under care
                </Typography>
                <Button 
                  variant="contained" 
                  color="success"
                  fullWidth
                  onClick={() => onNavigate('/admin/patients')}
                  startIcon={<MedicalServices />}
                >
                  View Patients
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'info.main' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Stack spacing={2}>
                <Button 
                  variant="outlined" 
                  startIcon={<AdminPanelSettings />}
                  onClick={() => onNavigate('/admin/settings')}
                  fullWidth
                >
                  System Settings
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<TrendingUp />}
                  onClick={() => onNavigate('/admin/analytics')}
                  fullWidth
                >
                  View Analytics
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Notifications />}
                  onClick={() => onNavigate('/admin/notifications')}
                  fullWidth
                >
                  Notifications
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

// Clinician Dashboard Component
function ClinicianDashboard({ stats, userProfile, onNavigate }: { 
  stats: DashboardStats | null, 
  userProfile: any,
  onNavigate: (path: string) => void 
}) {
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Clinical Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Patients Card */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <People color="primary" />
                  <Typography variant="h6">My Patients</Typography>
                </Stack>
                <Typography variant="h3" color="primary">
                  {userProfile?.patients?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Under your care
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  startIcon={<PersonAdd />}
                  onClick={() => onNavigate('/patients')}
                >
                  Manage Patients
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Appointments Card */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'secondary.main' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CalendarToday color="secondary" />
                  <Typography variant="h6">Appointments</Typography>
                </Stack>
                <Typography variant="h3" color="secondary">
                  {stats?.upcomingAppointments || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upcoming
                </Typography>
                <Button 
                  variant="contained" 
                  color="secondary"
                  fullWidth
                  startIcon={<EventNote />}
                  onClick={() => onNavigate('/appointments')}
                >
                  View Schedule
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Medical Records */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Assignment color="success" />
                  <Typography variant="h6">Pending Tasks</Typography>
                </Stack>
                <Typography variant="h3" color="success.main">
                  {stats?.pendingTasks || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Require attention
                </Typography>
                <Button 
                  variant="contained" 
                  color="success"
                  fullWidth
                  startIcon={<AssignmentTurnedIn />}
                  onClick={() => onNavigate('/tasks')}
                >
                  View Tasks
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Health Alerts */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', borderTop: '4px solid', borderColor: 'warning.main' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Warning color="warning" />
                  <Typography variant="h6">Health Alerts</Typography>
                </Stack>
                <Typography variant="h3" color="warning.main">
                  {stats?.healthAlerts || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Need review
                </Typography>
                <Button 
                  variant="contained" 
                  color="warning"
                  fullWidth
                  startIcon={<Notifications />}
                  onClick={() => onNavigate('/alerts')}
                >
                  Review Alerts
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Growth Tracking Section */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp />
          Growth Tracking Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Height color="primary" />
                  <Typography variant="h6">Height Tracking</Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  75% of patients with recent measurements
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Scale color="secondary" />
                  <Typography variant="h6">Weight Tracking</Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={68} 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  color="secondary"
                />
                <Typography variant="body2" color="text.secondary">
                  68% of patients with recent measurements
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<PersonAdd />}
              onClick={() => onNavigate('/patients/new')}
              sx={{ py: 1.5 }}
            >
              Add Patient
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<CalendarToday />}
              onClick={() => onNavigate('/appointments/new')}
              sx={{ py: 1.5 }}
            >
              Schedule Visit
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<MedicalServices />}
              onClick={() => onNavigate('/records/new')}
              sx={{ py: 1.5 }}
            >
              Add Record
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<Vaccines />}
              onClick={() => onNavigate('/vaccinations')}
              sx={{ py: 1.5 }}
            >
              Vaccinations
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}

// Guardian Dashboard Component
function GuardianDashboard({ stats, userProfile, onNavigate }: { 
  stats: DashboardStats | null, 
  userProfile: any,
  onNavigate: (path: string) => void 
}) {
  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Family Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Children Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <People sx={{ color: 'white' }} />
                  <Typography variant="h6">My Children</Typography>
                </Stack>
                <Typography variant="h2" sx={{ fontWeight: 700 }}>
                  {userProfile?.patients?.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Under your care
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'success.main',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                  fullWidth
                  onClick={() => onNavigate('/children')}
                >
                  View All Children
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Next Appointment */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CalendarToday color="primary" />
                  <Typography variant="h6">Next Appointment</Typography>
                </Stack>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  {stats?.upcomingAppointments && stats.upcomingAppointments > 0 ? (
                    <>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                        Tomorrow
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        10:00 AM
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Dr. Smith - Pediatrics
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h4" color="text.secondary">
                        No Appointments
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Schedule an appointment
                      </Typography>
                    </>
                  )}
                </Box>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<Schedule />}
                  onClick={() => onNavigate('/appointments')}
                >
                  View Calendar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Health Updates */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Notifications sx={{ color: 'white' }} />
                  <Typography variant="h6">Health Updates</Typography>
                </Stack>
                <Typography variant="h2" sx={{ fontWeight: 700 }}>
                  {stats?.healthAlerts || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  New updates available
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'info.main',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                  fullWidth
                  onClick={() => onNavigate('/updates')}
                >
                  Check Updates
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Vaccination Tracking */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Vaccines />
          Vaccination Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Completed</Typography>
                <Typography variant="h3" color="success.main">12</Typography>
                <Typography variant="body2" color="text.secondary">Vaccinations</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Due Soon</Typography>
                <Typography variant="h3" color="warning.main">3</Typography>
                <Typography variant="body2" color="text.secondary">Next 30 days</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Overdue</Typography>
                <Typography variant="h3" color="error.main">1</Typography>
                <Typography variant="body2" color="text.secondary">Requires attention</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<MedicalServices />}
              onClick={() => onNavigate('/records')}
              sx={{ py: 1.5 }}
            >
              Health Records
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<Height />}
              onClick={() => onNavigate('/growth')}
              sx={{ py: 1.5 }}
            >
              Growth Charts
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<Chat />}
              onClick={() => onNavigate('/messages')}
              sx={{ py: 1.5 }}
            >
              Messages
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<Star />}
              onClick={() => onNavigate('/milestones')}
              sx={{ py: 1.5 }}
            >
              Milestones
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}

// Default Dashboard (fallback)
function DefaultDashboard() {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Welcome to WellChild Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Your dashboard is being prepared. Please contact support if you continue to see this message.
      </Typography>
      <Button variant="contained" href="/profile">
        Complete Your Profile
      </Button>
    </Paper>
  );
}