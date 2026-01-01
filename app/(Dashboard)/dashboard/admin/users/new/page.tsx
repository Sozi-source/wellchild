'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserProfile } from '@/app/services/app.services';
import type * as AppTypes from '@/app/types/app.types';

// Create a type that matches what createUserProfile actually expects
// Based on the service function: Omit<AppTypes.UserProfile, 'id' | 'createdAt' | 'updatedAt'>
type UserCreateData = Omit<AppTypes.UserProfile, 'id' | 'createdAt' | 'updatedAt'>;

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);
      
      // Generate a UID (in production, create Firebase Auth user first)
      const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
   
      // These will be set by the service with serverTimestamp()
      const userData: UserCreateData = {
        uid,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        clinicName: formData.clinicName || undefined,
        specialization: formData.specialization || undefined,
        licenseNumber: formData.licenseNumber || undefined,
        npiNumber: formData.npiNumber || undefined,
        credentials: [],
        isActive: formData.isActive !== false,
        isVerified: formData.isVerified === true,
        timezone: formData.timezone || 'UTC',
        language: formData.language || 'en',
        patients: [],
        profilePicture: undefined,
        notificationPreferences: {
          email: true,
          push: true,
          sms: false,
          appointmentReminders: true,
          healthAlerts: true
        }
        // DO NOT include: createdAt, updatedAt, lastLogin
        // The service will handle these with serverTimestamp()
      };

      console.log('Creating user with data:', userData);
      await createUserProfile(userData);
      
      alert('User created successfully');
      router.push('/dashboard/admin/users');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating user:', error);
      alert(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
        <p className="text-gray-600 mt-2">
          Add a new guardian, clinician, or admin to the system
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <UserForm 
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}