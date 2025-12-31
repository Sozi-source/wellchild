"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import * as AppServices from '@/app/services/app.services';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Baby,
  Calendar,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

type FormData = {
  name: string;
  dob: string;
  sex: 'male' | 'female' | 'other';
  medicalRecordNumber?: string;
  birthWeight?: number;
  birthLength?: number;
  gestationalAge?: number;
  bloodType?: string;
  notes?: string;
};

export default function RegisterPatientPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdChild, setCreatedChild] = useState<{ childId: string; medicalRecordNumber: string } | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    dob: '',
    sex: 'male',
    medicalRecordNumber: '',
    birthWeight: undefined,
    birthLength: undefined,
    gestationalAge: 40,
    bloodType: 'unknown',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      setError('You must be logged in to register a patient');
      return;
    }

    if (!formData.name || !formData.dob || !formData.sex) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const childData = {
        name: formData.name.trim(),
        dob: formData.dob,
        sex: formData.sex,
        birthWeight: formData.birthWeight,
        birthLength: formData.birthLength,
        gestationalAge: formData.gestationalAge,
        bloodType: formData.bloodType as any,
        notes: formData.notes,
        medicalRecordNumber: formData.medicalRecordNumber || undefined,
        // These are optional based on your ChildRegistrationData type
        allergies: [],
        conditions: [],
        emergencyContacts: [],
        photoUrl: ''
      };

      // Get creator information - make sure userProfile has the required fields
      const creator = {
        id: userProfile.uid || userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role
      };

      // Use the correct method name from AppServices
      const result = await AppServices.registerChild(childData, creator.id);

      setCreatedChild(result.data || null);
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        if (result.data?.childId) {
          router.push(`/dashboard/healthcare/patient/${result.data.childId}/invite`);
        }
      }, 2000);

    } catch (err: any) {
      console.error('Error registering patient:', err);
      setError(err.message || 'Failed to register patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === '' ? undefined : parseFloat(value) 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSexChange = (value: 'male' | 'female' | 'other') => {
    setFormData(prev => ({ ...prev, sex: value }));
  };

  const handleBloodTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, bloodType: value }));
  };

  const today = new Date().toISOString().split('T')[0];

  // Calculate age for preview
  const calculateAgePreview = (dobString: string): string => {
    if (!dobString) return '';
    
    try {
      const birthDate = new Date(dobString);
      const ageInMonths = AppServices.calculateAgeInMonths(birthDate);
      return AppServices.calculateAgeString(birthDate);
    } catch (error) {
      return 'Invalid date format';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/dashboard/healthcare"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <Baby className="h-8 w-8 mr-3 text-blue-600" />
            Register New Patient
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the patient's details to create their medical record
          </p>
        </div>

        {/* Success Message */}
        {success && createdChild && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-800">Patient Registered Successfully!</h3>
                <p className="text-green-700 mt-1">
                  <strong>Medical Record Number:</strong> {createdChild.medicalRecordNumber}
                </p>
                <p className="text-green-700 mt-1">
                  Patient has been added to your care. Redirecting to invitation page...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Full Name *
                </span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter patient's full name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading || success}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Date of Birth *
                  </span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  max={today}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading || success}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use format: YYYY-MM-DD
                </p>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sex"
                      value="male"
                      checked={formData.sex === 'male'}
                      onChange={() => handleSexChange('male')}
                      className="h-4 w-4 text-blue-600"
                      disabled={loading || success}
                    />
                    <span className="ml-2">Male</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sex"
                      value="female"
                      checked={formData.sex === 'female'}
                      onChange={() => handleSexChange('female')}
                      className="h-4 w-4 text-blue-600"
                      disabled={loading || success}
                    />
                    <span className="ml-2">Female</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sex"
                      value="other"
                      checked={formData.sex === 'other'}
                      onChange={() => handleSexChange('other')}
                      className="h-4 w-4 text-blue-600"
                      disabled={loading || success}
                    />
                    <span className="ml-2">Other</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Birth Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Birth Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Weight (kg)
                </label>
                <input
                  type="number"
                  name="birthWeight"
                  value={formData.birthWeight || ''}
                  onChange={handleChange}
                  placeholder="e.g., 3.5"
                  step="0.1"
                  min="0.5"
                  max="10"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || success}
                />
              </div>

              {/* Birth Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Length (cm)
                </label>
                <input
                  type="number"
                  name="birthLength"
                  value={formData.birthLength || ''}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  step="0.1"
                  min="30"
                  max="70"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || success}
                />
              </div>

              {/* Gestational Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gestational Age (weeks)
                </label>
                <input
                  type="number"
                  name="gestationalAge"
                  value={formData.gestationalAge || 40}
                  onChange={handleChange}
                  step="1"
                  min="20"
                  max="45"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Blood Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Type
              </label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={(e) => handleBloodTypeChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || success}
              >
                <option value="unknown">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any important notes about the patient"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || success}
                maxLength={500}
              />
            </div>

            {/* Age Preview */}
            {formData.dob && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Age Preview</h4>
                <p className="text-blue-700">
                  {calculateAgePreview(formData.dob)}
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-6 border-t">
              <div className="flex justify-end space-x-4">
                <Link
                  href="/dashboard/healthcare"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {success ? 'Registered!' : 'Register Patient'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Next Steps */}
        {!success && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold mb-4">What happens next?</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <span>A unique Medical Record Number will be generated</span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <span>Patient will be added to your care list</span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <span>You'll be redirected to invite parents/guardians</span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <span>Parents can accept invitations to access the child's records</span>
              </li>
              <li className="flex items-start">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <span>You can add medical records and track growth</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}