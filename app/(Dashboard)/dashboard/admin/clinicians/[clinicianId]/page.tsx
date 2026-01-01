// /app/admin/clinicians/[clinicianId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/Tabs';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import * as AppServices from '@/app/services/app.services';
import type { UserProfile, HealthcarePatient } from '@/app/types/app.types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/Index';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  Building,
  Calendar,
  Users,
  AlertTriangle,
  Edit,
  ArrowLeft,
  RefreshCw,
  Shield,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  ChevronRight,
  MoreVertical,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Settings,
  UserPlus,
} from 'lucide-react';

// Mobile-friendly components
const MobileHeader = ({ 
  clinician, 
  onBack, 
  onRefresh, 
  loading 
}: { 
  clinician: UserProfile; 
  onBack: () => void; 
  onRefresh: () => void; 
  loading: boolean; 
}) => (
  <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 md:hidden">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={clinician.photoUrl} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              {clinician.name?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold text-lg truncate max-w-[180px]">
              {clinician.name}
            </h1>
            <div className="flex items-center space-x-1">
              <Badge 
                variant={clinician.isActive ? "default" : "secondary"} 
                className="text-xs px-1.5 py-0 h-5"
              >
                {clinician.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge 
                variant="outline" 
                className="text-xs px-1.5 py-0 h-5 capitalize"
              >
                {clinician.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={loading}
          className="h-9 w-9 rounded-full"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

const StatsGrid = ({ stats }: { stats: any }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
    <Card className="border shadow-sm">
      <CardContent className="pt-4 pb-3 px-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Patients</p>
            <p className="text-lg sm:text-2xl font-bold mt-1">{stats.totalPatients}</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border shadow-sm">
      <CardContent className="pt-4 pb-3 px-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Active</p>
            <p className="text-lg sm:text-2xl font-bold mt-1">{stats.activePatients}</p>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border shadow-sm">
      <CardContent className="pt-4 pb-3 px-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Appointments</p>
            <p className="text-lg sm:text-2xl font-bold mt-1">{stats.appointmentsToday}</p>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border shadow-sm">
      <CardContent className="pt-4 pb-3 px-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Tasks</p>
            <p className="text-lg sm:text-2xl font-bold mt-1">{stats.pendingTasks}</p>
          </div>
          <div className="p-2 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const PatientList = ({ 
  patients, 
  onPatientClick, 
  onAssignPatient 
}: { 
  patients: HealthcarePatient[]; 
  onPatientClick: (id: string) => void; 
  onAssignPatient: () => void; 
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Assigned Patients</h3>
      <Button 
        onClick={onAssignPatient} 
        size="sm"
        className="h-8 text-xs"
      >
        <Plus className="h-3 w-3 mr-1" />
        Assign
      </Button>
    </div>
    
    {patients.length > 0 ? (
      <div className="space-y-2">
        {patients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => onPatientClick(patient.id)}
            className="bg-white border rounded-lg p-3 active:bg-gray-50 transition-colors touch-manipulation"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gray-100">
                    {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {patient.dateOfBirth && (
                      <span className="text-xs text-gray-500">
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </span>
                    )}
                    <Badge 
                      variant={patient.status === 'active' ? 'default' : 'secondary'} 
                      className="text-xs h-4 px-1.5"
                    >
                      {patient.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8 bg-gray-50 rounded-lg border">
        <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 mb-4">No patients assigned</p>
        <Button onClick={onAssignPatient} size="sm">
          <UserPlus className="h-3 w-3 mr-1" />
          Assign First Patient
        </Button>
      </div>
    )}
  </div>
);

const ContactInfoCard = ({ clinician }: { clinician: UserProfile }) => (
  <Card className="border shadow-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg">Contact Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Mail className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium truncate">{clinician.email}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Phone className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{clinician.phone || 'Not provided'}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <MapPin className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{clinician.address || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProfessionalInfoCard = ({ clinician }: { clinician: UserProfile }) => (
  <Card className="border shadow-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg">Professional Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <Stethoscope className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Specialization</p>
            <p className="font-medium">{clinician.specialization || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Building className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Clinic/Hospital</p>
            <p className="font-medium">{clinician.clinicName || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <FileText className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">License Number</p>
            <p className="font-medium">{clinician.licenseNumber || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SettingsCard = ({ 
  clinician, 
  onStatusChange, 
  onPasswordReset 
}: { 
  clinician: UserProfile; 
  onStatusChange: () => Promise<void>; 
  onPasswordReset: () => Promise<void>; 
}) => (
  <div className="space-y-4">
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Account Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {clinician.isActive ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="font-medium">
                Account is {clinician.isActive ? 'Active' : 'Deactivated'}
              </p>
              <p className="text-sm text-gray-500">
                {clinician.isActive
                  ? 'Clinician can access the system'
                  : 'Clinician cannot access the system'}
              </p>
            </div>
          </div>
          <Button
            variant={clinician.isActive ? "destructive" : "default"}
            size="sm"
            onClick={onStatusChange}
            className="h-8 text-xs"
          >
            {clinician.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Security</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start h-10"
          onClick={onPasswordReset}
        >
          <Shield className="h-4 w-4 mr-2" />
          Reset Password
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start h-10"
          onClick={() => {/* Edit permissions logic */}}
        >
          <Settings className="h-4 w-4 mr-2" />
          Edit Permissions
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default function ClinicianDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clinicianId = params.clinicianId as string;
  
  const [clinician, setClinician] = useState<UserProfile | null>(null);
  const [patients, setPatients] = useState<HealthcarePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    appointmentsToday: 0,
    pendingTasks: 0
  });

  const loadClinicianData = useCallback(async () => {
    const isRefresh = !loading;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      // Load clinician profile
      const clinicianData = await AppServices.getUserProfile(clinicianId);
      if (!clinicianData) {
        throw new Error('Clinician not found');
      }
      
      // Verify this is a clinician
      if (clinicianData.role !== 'clinician') {
        throw new Error('User is not a clinician');
      }
      
      setClinician(clinicianData);
      
      // Load clinician's patients
      if (clinicianData.patients && clinicianData.patients.length > 0) {
        const patientsPromises = clinicianData.patients.map(
          patientId => AppServices.getPatient(patientId)
        );
        
        const patientsResults = await Promise.allSettled(patientsPromises);
        const successfulPatients = patientsResults
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => (result as PromiseFulfilledResult<HealthcarePatient>).value);
        
        setPatients(successfulPatients);
        
        // Calculate stats
        const activePatients = successfulPatients.filter(p => p.status === 'active').length;
        const growthWarnings = successfulPatients.filter(p => p.growthStatus === 'warning').length;
        const growthCritical = successfulPatients.filter(p => p.growthStatus === 'critical').length;
        
        setStats({
          totalPatients: successfulPatients.length,
          activePatients,
          appointmentsToday: 0,
          pendingTasks: growthWarnings + growthCritical
        });
      }
      
    } catch (error) {
      console.error('Error loading clinician data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load clinician information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clinicianId, loading]);

  useEffect(() => {
    if (clinicianId) {
      loadClinicianData();
    }
  }, [clinicianId, loadClinicianData]);

  const handleEditClinician = () => {
    router.push(`/admin/users/${clinicianId}/edit`);
  };

  const handleAssignPatient = () => {
    router.push(`/admin/patients/assign?clinicianId=${clinicianId}`);
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`/admin/patients/${patientId}`);
  };

  const handleBackToList = () => {
    router.push('/admin/clinicians');
  };

  const handleStatusChange = async () => {
    if (!clinician) return;
    
    try {
      await AppServices.updateUserProfile(clinicianId, {
        isActive: !clinician.isActive
      });
      loadClinicianData();
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const handlePasswordReset = async () => {
    alert(`Password reset link would be sent to ${clinician?.email}`);
  };

  // Desktop Header
  const DesktopHeader = () => (
    <div className="hidden md:block mb-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={handleBackToList}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clinicians
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadClinicianData}
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleEditClinician} size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={clinician?.photoUrl} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl">
              {clinician?.name?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{clinician?.name}</h1>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={clinician?.isActive ? 'default' : 'secondary'}>
                    {clinician?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {clinician?.role}
                  </Badge>
                  {clinician?.specialization && (
                    <Badge variant="secondary">{clinician.specialization}</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{clinician?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && !refreshing) {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </RoleProtectedLayout>
    );
  }

  if (error || !clinician) {
    return (
      <RoleProtectedLayout allowedRoles={['admin']}>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-md mx-auto pt-8">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Clinician Not Found</AlertTitle>
              <AlertDescription className="mt-2">
                {error || 'The requested clinician could not be found.'}
                <div className="mt-4">
                  <Button onClick={handleBackToList} className="w-full">
                    Return to Clinicians
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </RoleProtectedLayout>
    );
  }

  return (
    <RoleProtectedLayout allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <MobileHeader
          clinician={clinician}
          onBack={handleBackToList}
          onRefresh={loadClinicianData}
          loading={refreshing}
        />

        {/* Desktop Header */}
        <DesktopHeader />

        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {/* Mobile Action Bar */}
          <div className="md:hidden mb-4">
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleEditClinician}
                className="flex-1 h-10"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                onClick={handleAssignPatient}
                variant="outline"
                className="flex-1 h-10"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Patient
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="sticky top-0 bg-gray-50 z-40 pb-4 md:relative md:bg-transparent">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto mb-4 md:mb-6">
                <TabsTrigger value="overview" className="text-xs md:text-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="patients" className="text-xs md:text-sm">
                  Patients ({patients.length})
                </TabsTrigger>
                <TabsTrigger value="contact" className="text-xs md:text-sm">
                  Contact
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs md:text-sm">
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 md:space-y-6">
              <StatsGrid stats={stats} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <PatientList
                  patients={patients}
                  onPatientClick={handleViewPatient}
                  onAssignPatient={handleAssignPatient}
                />
                
                <div className="space-y-4">
                  <ContactInfoCard clinician={clinician} />
                  <ProfessionalInfoCard clinician={clinician} />
                </div>
              </div>
            </TabsContent>

            {/* Patients Tab */}
            <TabsContent value="patients">
              <PatientList
                patients={patients}
                onPatientClick={handleViewPatient}
                onAssignPatient={handleAssignPatient}
              />
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <ContactInfoCard clinician={clinician} />
                <ProfessionalInfoCard clinician={clinician} />
              </div>
              
              {/* Additional Info Card */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Timezone</p>
                        <p className="font-medium">{clinician.timezone || 'UTC'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <Shield className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">NPI Number</p>
                        <p className="font-medium">{clinician.npiNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <SettingsCard
                clinician={clinician}
                onStatusChange={handleStatusChange}
                onPasswordReset={handlePasswordReset}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleProtectedLayout>
  );
}