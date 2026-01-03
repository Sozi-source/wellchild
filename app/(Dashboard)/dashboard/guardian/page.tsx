// app/guardian/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import RootDashboardLayout from '@/app/components/layout/RootDashboardLayout';
import { Button } from '@/app/components/ui/Button';
import { Badge } from '@/app/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { useAuth } from '@/app/context/AuthContext';
import * as AppServices from '@/app/services/app.services';
import type { HealthcarePatient } from '@/app/types/app.types';
import {
  Calendar,
  Heart,
  Bell,
  Syringe,
  User,
  ArrowRight,
  TrendingUp,
  FileText,
  MessageSquare,
  Shield,
  Plus,
  ChevronRight,
  Clock,
  Activity,
  Baby,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function GuardianDashboardPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
   const [isUnfinished] = useState(true); 
  const [children, setChildren] = useState<HealthcarePatient[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      loadDashboardData();
    }
  }, [userProfile]);

  const loadDashboardData = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      const [guardianStats, childrenResponse] = await Promise.all([
        AppServices.getGuardianStats(userProfile.uid),
        AppServices.getGuardianPatients(userProfile.uid)
      ]);
      
      setStats(guardianStats);
      setChildren(childrenResponse.items);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChild = (childId: string) => {
    router.push(`/dashboard/guardian/children/${childId}`);
  };

  if (loading) {
    return (
      <RootDashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </RootDashboardLayout>
    );
  }

  return (
    <>
      {/* Enhanced Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-blue-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Welcome back, {userProfile?.name}!
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Track your child's health here !
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <div className="bg-white/80 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-gray-500">Children</p>
                  <p className="text-2xl font-bold text-gray-900">{children.length}</p>
                </div>
                <div className="bg-white/80 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-gray-500">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.healthAlerts || 0}</p>
                </div>
                <div className="bg-white/80 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-gray-500">Appointments</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.upcomingAppointments || 0}</p>
                </div>
                <div className="bg-white/80 rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-gray-500">Vaccinations Due</p>
                  <p className="text-2xl font-bold text-amber-600">{stats?.vaccinationDue || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={isUnfinished? () => router.push('/dashboard/guardian/appointments'): undefined}
                className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Visit
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/guardian/children')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View All Children
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/guardian/children')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="p-2 bg-blue-100 rounded-lg w-fit mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">My Children</h3>
                <p className="text-sm text-gray-500 mt-1">View all children</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={isUnfinished? () => router.push('/dashboard/guardian/appointments'):undefined}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="p-2 bg-green-100 rounded-lg w-fit mb-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Appointments</h3>
                <p className="text-sm text-gray-500 mt-1">Manage visits</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={isUnfinished? () => router.push('/dashboard/guardian/notifications'):undefined}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="p-2 bg-amber-100 rounded-lg w-fit mb-3">
                  <Bell className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Health Alerts</h3>
                <p className="text-sm text-gray-500 mt-1">{stats?.healthAlerts || 0} active</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={isUnfinished? () => router.push('/dashboard/guardian/vaccinations'):undefined}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3">
                  <Syringe className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Vaccinations</h3>
                <p className="text-sm text-gray-500 mt-1">{stats?.vaccinationDue || 0} due</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Children List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="h-5 w-5 text-blue-600" />
                    My Children ({children.length})
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Children under your guardianship</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/dashboard/guardian/children')}
                >
                  View All
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {children.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                    <Baby className="h-10 w-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Children Assigned</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Children will appear here once a clinician enrolls them and invites you to their care team.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={isUnfinished? () => router.push('/dashboard/guardian/invitations'):undefined}>
                      Check Invitations
                    </Button>
                    <Button onClick={() => router.push('/help')}>
                      Learn More
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {children.map((child) => (
                    <div 
                      key={child.id}
                      className="group hover:bg-gray-50 p-4 rounded-xl border border-gray-200 transition-all cursor-pointer"
                      onClick={() => handleViewChild(child.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          {child.photoUrl ? (
                            <img
                              src={child.photoUrl}
                              alt={child.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                              <span className="text-2xl text-blue-700 font-bold">
                                {child.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className={cn(
                            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white",
                            child.growthStatus === 'normal' ? 'bg-green-500' :
                            child.growthStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          )} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {child.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-600">
                                  {AppServices.calculateAgeString(child.dob)}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-600">
                                  MR#{child.medicalRecordNumber}
                                </span>
                              </div>
                            </div>
                            <Badge variant={
                              child.growthStatus === 'normal' ? 'success' :
                              child.growthStatus === 'warning' ? 'warning' : 'destructive'
                            }>
                              {child.growthStatus}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Last Checkup</p>
                              <p className="text-sm font-medium">
                                {child.lastCheckup ? AppServices.formatDate(child.lastCheckup) : 'Never'}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Clinicians</p>
                              <p className="text-sm font-medium">{child.clinicianIds.length}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Status</p>
                              <p className={cn(
                                "text-sm font-medium",
                                child.growthStatus === 'normal' ? 'text-green-600' :
                                child.growthStatus === 'warning' ? 'text-amber-600' : 'text-red-600'
                              )}>
                                {child.growthStatus?.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={isUnfinished? (e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/guardian/children/${child.id}/growth`);
                              }:undefined}
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Growth
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={isUnfinished? (e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/guardian/children/${child.id}/records`);
                              }:undefined}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Records
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Activity & Health Summary */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-gray-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {children.length > 0 ? (
                  <>
                    {[
                      { child: children[0]?.name, activity: 'Growth measurements updated', time: '2 hours ago', icon: '📈' },
                      { child: children[0]?.name, activity: 'Vaccination reminder', time: '1 day ago', icon: '💉' },
                      { child: children[0]?.name, activity: 'Appointment confirmed', time: '3 days ago', icon: '📅' },
                      { child: children[0]?.name, activity: 'Health report ready', time: '1 week ago', icon: '📋' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-lg">
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{activity.child} • {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Health Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4 text-red-500" />
                Health Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Active Alerts</p>
                      <p className="text-xs text-gray-600">Require attention</p>
                    </div>
                  </div>
                  <Badge variant="destructive">{stats?.healthAlerts || 0}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Syringe className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Vaccinations Due</p>
                      <p className="text-xs text-gray-600">Immunizations pending</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-white">{stats?.vaccinationDue || 0}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Up-to-date</p>
                      <p className="text-xs text-gray-600">All clear</p>
                    </div>
                  </div>
                  <Badge variant="success">{children.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Health Tip</h3>
                  <p className="text-sm text-gray-600">
                    Regular growth tracking helps identify potential health issues early.
                    Ensure your children have scheduled check-ups.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-700 mt-2">
                    Learn more
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}