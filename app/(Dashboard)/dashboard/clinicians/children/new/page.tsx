// app/clinician/children/new/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleProtectedLayout from '@/app/components/layout/RoleProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Index';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Select } from '@/app/components/ui/Select';
import { Textarea } from '@/app/components/ui/Textarea';
import { Alert } from '@/app/components/ui/Alert';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { useAuth } from '@/app/context/AuthContext';
import * as AppServices from '@/app/services/app.services';
import type { PatientRegistrationData } from '@/app/types/app.types';

export default function EnrollChildPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [childData, setChildData] = useState({
    name: '',
    dob: '',
    sex: 'male' as const,
    birthWeight: '',
    birthLength: '',
    gestationalAge: '',
    bloodType: 'unknown' as const,
    medicalRecordNumber: '',
  });

  const [guardianData, setGuardianData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'parent',
  });

  const [medicalData, setMedicalData] = useState({
    allergies: '',
    conditions: '',
    notes: '',
  });

  const [sendInvitation, setSendInvitation] = useState(true);

  const handleChildDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setChildData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleGuardianDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGuardianData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleMedicalDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMedicalData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!childData.name.trim()) {
      setError('Child name is required');
      return false;
    }
    if (!childData.dob) {
      setError('Date of birth is required');
      return false;
    }
    if (!childData.birthWeight) {
      setError('Birth weight is required');
      return false;
    }
    if (!childData.birthLength) {
      setError('Birth length is required');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!guardianData.name.trim()) {
      setError('Guardian name is required');
      return false;
    }
    if (!guardianData.email.trim()) {
      setError('Guardian email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guardianData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setError('');
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      setError('');
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setError('');
  };

  const parseAllergies = (text: string) => {
    if (!text.trim()) return [];
    return text.split('\n').filter(line => line.trim()).map(line => ({
      type: line.trim(),
      severity: 'moderate' as const,
      notes: '',
      diagnosedDate: new Date().toISOString().split('T')[0],
    }));
  };

  const parseConditions = (text: string) => {
    if (!text.trim()) return [];
    return text.split('\n').filter(line => line.trim()).map(line => ({
      name: line.trim(),
      type: 'chronic' as const,
      diagnosedDate: new Date().toISOString().split('T')[0],
      status: 'active' as const,
      notes: '',
    }));
  };

  const handleSubmit = async () => {
    if (!userProfile) {
      setError('You must be logged in to enroll a child');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Prepare patient data
      const patientData: PatientRegistrationData = {
        name: childData.name.trim(),
        dob: childData.dob,
        sex: childData.sex,
        birthWeight: parseFloat(childData.birthWeight),
        birthLength: parseFloat(childData.birthLength),
        gestationalAge: parseFloat(childData.gestationalAge) || 40,
        bloodType: childData.bloodType,
        medicalRecordNumber: childData.medicalRecordNumber || undefined,
        notes: medicalData.notes,
      };

      // Register child
      const response = await AppServices.registerPatient(patientData, userProfile.uid);
      
      if (response.success) {
        setSuccess(`Child "${childData.name}" enrolled successfully! An invitation has been sent to ${guardianData.email}`);
       
        
        // Redirect to child's profile after 3 seconds
        setTimeout(() => {
          router.push(`dashboard/clinicians/children/${response.data?.patientId}`);
        }, 3000);
      } else {
        setError('Failed to enroll child. Please try again.');
      }
    } catch (error: any) {
      console.error('Error enrolling child:', error);
      setError(error.message || 'Failed to enroll child. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <RoleProtectedLayout allowedRoles={['clinician']}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </RoleProtectedLayout>
    );
  }

  return (
    <RoleProtectedLayout allowedRoles={['clinician']}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Enroll New Child</CardTitle>
            <p className="text-gray-600 mt-2">
              Register a new child patient and invite their guardian
            </p>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
              {['Child Details', 'Guardian Information', 'Medical Info'].map((stepLabel, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    index + 1 <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`text-sm font-medium ${
                    index + 1 <= step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {stepLabel}
                  </span>
                </div>
              ))}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <Alert
                variant="destructive"
                description={error}
                className="mb-6"
              />
            )}
            {success && (
              <Alert
                variant="success"
                description={success}
                className="mb-6"
              />
            )}

            {/* Step 1: Child Details */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Child Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Child's Full Name *"
                    name="name"
                    value={childData.name}
                    onChange={handleChildDataChange}
                    placeholder="Enter child's full name"
                    required
                  />
                  
                  <Input
                    label="Date of Birth *"
                    type="date"
                    name="dob"
                    value={childData.dob}
                    onChange={handleChildDataChange}
                    max={today}
                    required
                  />
                  
                  <Select
                    label="Sex *"
                    name="sex"
                    value={childData.sex}
                    onChange={handleChildDataChange}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ]}
                    required
                  />
                  
                  <Input
                    label="Medical Record Number"
                    name="medicalRecordNumber"
                    value={childData.medicalRecordNumber}
                    onChange={handleChildDataChange}
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Birth Weight (kg) *"
                    type="number"
                    name="birthWeight"
                    value={childData.birthWeight}
                    onChange={handleChildDataChange}
                    step="0.01"
                    min="0"
                    placeholder="e.g., 3.2"
                    required
                  />
                  
                  <Input
                    label="Birth Length (cm) *"
                    type="number"
                    name="birthLength"
                    value={childData.birthLength}
                    onChange={handleChildDataChange}
                    step="0.1"
                    min="0"
                    placeholder="e.g., 50.5"
                    required
                  />
                  
                  <Input
                    label="Gestational Age (weeks)"
                    type="number"
                    name="gestationalAge"
                    value={childData.gestationalAge}
                    onChange={handleChildDataChange}
                    min="20"
                    max="45"
                    placeholder="e.g., 40"
                  />
                </div>

                <Select
                  label="Blood Type"
                  name="bloodType"
                  value={childData.bloodType}
                  onChange={handleChildDataChange}
                  options={[
                    { value: 'unknown', label: 'Unknown' },
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' },
                  ]}
                />
              </div>
            )}

            {/* Step 2: Guardian Information */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Guardian Information</h3>
                <p className="text-gray-600 text-sm">
                  The guardian will receive an invitation to access their child's health records
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Guardian Name *"
                    name="name"
                    value={guardianData.name}
                    onChange={handleGuardianDataChange}
                    placeholder="Enter guardian's full name"
                    required
                  />
                  
                  <Input
                    label="Email Address *"
                    type="email"
                    name="email"
                    value={guardianData.email}
                    onChange={handleGuardianDataChange}
                    placeholder="guardian@example.com"
                    required
                  />
                  
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={guardianData.phone}
                    onChange={handleGuardianDataChange}
                    placeholder="+1 (555) 123-4567"
                  />
                  
                  <Select
                    label="Relationship to Child"
                    name="relationship"
                    value={guardianData.relationship}
                    onChange={handleGuardianDataChange}
                    options={[
                      { value: 'parent', label: 'Parent' },
                      { value: 'guardian', label: 'Legal Guardian' },
                      { value: 'grandparent', label: 'Grandparent' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendInvitation"
                      checked={sendInvitation}
                      onChange={(e) => setSendInvitation(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="sendInvitation" className="ml-2 text-sm text-gray-700">
                      Send invitation email to guardian with login instructions
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 ml-6">
                    If unchecked, you will need to manually provide the guardian with login credentials.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Medical Information */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Medical Information</h3>
                <p className="text-gray-600 text-sm">
                  Initial medical information (can be updated later)
                </p>
                
                <Textarea
                  label="Known Allergies"
                  name="allergies"
                  value={medicalData.allergies}
                  onChange={handleMedicalDataChange}
                  placeholder="Enter each allergy on a new line&#10;Example:&#10;Penicillin&#10;Peanuts&#10;Dust mites"
                  rows={4}
                  helperText="Enter one allergy per line"
                />
                
                <Textarea
                  label="Existing Medical Conditions"
                  name="conditions"
                  value={medicalData.conditions}
                  onChange={handleMedicalDataChange}
                  placeholder="Enter each condition on a new line&#10;Example:&#10;Asthma&#10;Eczema&#10;ADHD"
                  rows={4}
                  helperText="Enter one condition per line"
                />
                
                <Textarea
                  label="Additional Notes"
                  name="notes"
                  value={medicalData.notes}
                  onChange={handleMedicalDataChange}
                  placeholder="Any other important medical information..."
                  rows={3}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t">
              <div>
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                  >
                    ← Previous
                  </Button>
                )}
              </div>
              
              <div className="flex gap-4">
                {step < 3 ? (
                  <Button onClick={handleNextStep}>
                    Next Step →
                  </Button>
                ) : (
                  <Button onClick={handleSubmit}>
                    Enroll Child
                  </Button>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/clinicians/children')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleProtectedLayout>
  );
}