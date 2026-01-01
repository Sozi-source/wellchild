"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { useAuth } from '@/app/context/AuthContext';
import * as AppServices from '@/app/services/app.services';
import type { HealthcarePatient } from '@/app/types/app.types';
import { 
  Baby, 
  Users, 
  Calendar, 
  FileText,
  AlertCircle,
  Clock,
  ChevronRight,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Activity,
  Heart,
  Stethoscope,
  ArrowUpRight
} from 'lucide-react';

export default function ClinicianDashboardPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentPatients, setRecentPatients] = useState<HealthcarePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on component mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (userProfile) {
      loadDashboardData();
    }
  }, [userProfile]);

  const loadDashboardData = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      const [clinicianStats, patientsResponse] = await Promise.all([
        AppServices.getClinicianStats(userProfile.uid),
        AppServices.getClinicianPatients(userProfile.uid, { limit: 5 })
      ]);
      
      setStats(clinicianStats);
      setRecentPatients(patientsResponse.items);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChild = () => {
    router.push('/dashboard/clinicians/children/new');
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`/dashboard/clinicians/children/${patientId}`);
  };

  if (loading) {
    return (
      <RoleProtectedLayout allowedRoles={['clinician']}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600 text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </RoleProtectedLayout>
    );
  }

  return (
    <RoleProtectedLayout allowedRoles={['clinician']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-white pb-20 md:pb-8">
        {/* Mobile Top Bar */}
        {isMobile && (
          <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 text-sm">Pediatric Care</h1>
                  <p className="text-xs text-gray-600">Dr. {userProfile?.name?.split(' ')[0]}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-full bg-gray-100">
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-full bg-gray-100">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
          {/* Header - Mobile optimized */}
          {!isMobile && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                Welcome, Dr. {userProfile?.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-6 md:mb-8">
                Pediatric Care Dashboard
              </p>
            </>
          )}

          {/* Stats Cards - Mobile responsive grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-blue-50/30">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Baby className="w-5 h-5 text-blue-600" />
                  </div>
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {stats?.activePatients || 0}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Active Children
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Under your care
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-amber-50/30">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">
                  {stats?.growthAlerts || 0}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Growth Alerts
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Require attention
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-emerald-50/30">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <Clock className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {stats?.upcomingAppointments || 0}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Today's Appointments
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Scheduled
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-purple-50/30">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {stats?.recentRecords || 0}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Recent Records
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions - Mobile optimized layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
            <Card 
              className="overflow-hidden border border-blue-100 bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
              onClick={handleRegisterChild}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">
                  Register New Child
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Enroll a new child and invite guardians
                </p>
                <div className="mt-4 flex items-center">
                  <span className="text-xs text-blue-600 font-medium">Quick Register</span>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="overflow-hidden border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
              onClick={() => router.push('/dashboard/clinicians/children')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">
                  All Children
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  View all children under your care
                </p>
                <div className="mt-4 flex items-center">
                  <span className="text-xs text-emerald-600 font-medium">{stats?.activePatients || 0} children</span>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="overflow-hidden border border-purple-100 bg-gradient-to-br from-white to-purple-50 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
              onClick={() => router.push('/dashboard/clinicians/appointments')}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">
                  Appointments
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Schedule and manage appointments
                </p>
                <div className="mt-4 flex items-center">
                  <span className="text-xs text-purple-600 font-medium">{stats?.upcomingAppointments || 0} today</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Patients - Mobile optimized table/cards */}
          <Card className="border-none shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                    Recent Children
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Recently enrolled or updated children
                  </CardDescription>
                </div>
                {isMobile ? (
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-sm"
                    onClick={handleRegisterChild}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    New Child
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Filter
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-sm"
                      onClick={handleRegisterChild}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New Child
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentPatients.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Baby className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-gray-600 mb-4">No children enrolled yet.</p>
                  <Button 
                    onClick={handleRegisterChild}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Enroll First Child
                  </Button>
                </div>
              ) : isMobile ? (
                // Mobile card view
                <div className="divide-y divide-gray-100">
                  {recentPatients.map(patient => (
                    <div 
                      key={patient.id} 
                      className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleViewPatient(patient.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                            <Baby className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{patient.name}</h3>
                            <p className="text-xs text-gray-600">
                              MR#: {patient.medicalRecordNumber}
                            </p>
                          </div>
                        </div>
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Age</p>
                          <p className="text-sm font-medium">{AppServices.calculateAgeString(patient.dob)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Guardians</p>
                          <p className="text-sm font-medium">{patient.guardianIds.length} assigned</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          patient.growthStatus === 'normal' ? 'bg-green-100 text-green-800' :
                          patient.growthStatus === 'warning' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {patient.growthStatus}
                        </span>
                        <div className="text-xs text-gray-500">
                          {patient.lastCheckup 
                            ? AppServices.formatDate(patient.lastCheckup)
                            : 'Never checked'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop table view
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Child
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Age
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Growth Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Guardians
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Last Checkup
                        </th>
                        <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPatients.map(patient => (
                        <tr 
                          key={patient.id} 
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleViewPatient(patient.id)}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                                <Baby className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-sm sm:text-base">{patient.name}</div>
                                <div className="text-xs text-gray-600">
                                  MR#: {patient.medicalRecordNumber}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm sm:text-base font-medium">
                              {AppServices.calculateAgeString(patient.dob)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              patient.growthStatus === 'normal' ? 'bg-green-100 text-green-800' :
                              patient.growthStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {patient.growthStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              {patient.guardianIds.length} assigned
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-600">
                              {patient.lastCheckup 
                                ? AppServices.formatDate(patient.lastCheckup)
                                : 'Never'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-gray-100 text-blue-600 hover:text-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPatient(patient.id);
                              }}
                            >
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile Bottom Action Bar */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 shadow-lg">
              <div className="flex items-center justify-around">
                <button 
                  onClick={() => router.push('/dashboard/clinicians')}
                  className="flex flex-col items-center space-y-1 text-blue-600"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">Dashboard</span>
                </button>
                
                <button 
                  onClick={() => router.push('/dashboard/clinicians/children')}
                  className="flex flex-col items-center space-y-1 text-gray-600"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">Children</span>
                </button>
                
                <button 
                  onClick={handleRegisterChild}
                  className="relative -top-4"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </button>
                
                <button 
                  onClick={() => router.push('/dashboard/clinicians/appointments')}
                  className="flex flex-col items-center space-y-1 text-gray-600"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">Schedule</span>
                </button>
                
                <button 
                  onClick={() => router.push('/dashboard/clinician/profile')}
                  className="flex flex-col items-center space-y-1 text-gray-600"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">Profile</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleProtectedLayout>
  );
}

// Add missing Bell icon component
const Bell = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);