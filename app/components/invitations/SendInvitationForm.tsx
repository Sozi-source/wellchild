
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { AppService } from '@/app/services/app.services';
import { db } from '@/app/lib/firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { 
  Send, 
  Users, 
  Mail, 
  Calendar, 
  MessageSquare,
  XCircle,
  CheckCircle,
  Clock,
  Baby,
  ChevronDown
} from 'lucide-react';

interface SendInvitationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultChildId?: string;
  compact?: boolean;
}

interface Child {
  id: string;
  name: string;
  dob: string;
  sex: string;
  medicalRecordNumber: string;
  guardians?: string[];
}

export default function SendInvitationForm({ 
  onSuccess, 
  onCancel,
  defaultChildId,
  compact = false 
}: SendInvitationFormProps) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Child selector state
  const [children, setChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    childId: defaultChildId || '',
    guardianEmail: '',
    customMessage: '',
    expiresInDays: 7,
  });

  // Load healthcare provider's children
  useEffect(() => {
    const loadChildren = async () => {
      if (!userProfile || userProfile.role !== 'healthcare') {
        setLoadingChildren(false);
        return;
      }

      try {
        const childrenQuery = query(
          collection(db, 'children'),
          where('providers', 'array-contains', userProfile.uid)
        );
        
        const snapshot = await getDocs(childrenQuery);
        const childrenList: Child[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          childrenList.push({
            id: doc.id,
            name: data.name || 'Unnamed Child',
            dob: data.dob || '',
            sex: data.sex || 'other',
            medicalRecordNumber: data.medicalRecordNumber || '',
            guardians: data.guardianIds || []
          });
        });
        
        // Sort by name
        childrenList.sort((a, b) => a.name.localeCompare(b.name));
        setChildren(childrenList);
        
      } catch (err) {
        console.error('Error loading children:', err);
        setError('Failed to load children data');
      } finally {
        setLoadingChildren(false);
      }
    };

    loadChildren();
  }, [userProfile]);

  // Get selected child name
  const selectedChild = useMemo(() => {
    return children.find(child => child.id === formData.childId);
  }, [children, formData.childId]);

  // Filter children based on search
  const filteredChildren = useMemo(() => {
    if (!searchTerm) return children;
    
    const term = searchTerm.toLowerCase();
    return children.filter(child =>
      child.name.toLowerCase().includes(term) ||
      child.medicalRecordNumber.toLowerCase().includes(term)
    );
  }, [children, searchTerm]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.childId) {
      setError('Please select a child');
      return;
    }

    if (!formData.guardianEmail) {
      setError('Please enter guardian email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.guardianEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.expiresInDays < 1 || formData.expiresInDays > 30) {
      setError('Expiry must be between 1 and 30 days');
      return;
    }

    setLoading(true);

    try {
      if (!userProfile || userProfile.role !== 'healthcare') {
        throw new Error('Only healthcare providers can send invitations');
      }

      // Get child details
      const child = children.find(c => c.id === formData.childId);
      if (!child) throw new Error('Child not found');

      // Send invitation using AppService
      const result = await AppService.createInvitation({
        childId: formData.childId,
        childName: child.name,
        guardianEmail: formData.guardianEmail,
        providerId: userProfile.uid,
        providerName: userProfile.name,
        providerEmail: userProfile.email,
        customMessage: formData.customMessage || undefined,
        expiresInDays: formData.expiresInDays,
      });

      console.log('Invitation sent successfully:', result);

      // Success state
      setSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          childId: '',
          guardianEmail: '',
          customMessage: '',
          expiresInDays: 7,
        });
        setSuccess(false);
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      }, 2000);

    } catch (err: any) {
      console.error('Invitation error:', err);
      setError(err.message || 'Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  // Format date of birth
  const formatDOB = (dob: string) => {
    try {
      return new Date(dob).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Calculate age
  const calculateAge = (dob: string) => {
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      if (years > 0) {
        return `${years}y`;
      } else {
        return `${months}m`;
      }
    } catch {
      return 'Unknown';
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Send className="h-5 w-5 mr-2 text-blue-600" />
          Send Invitation
        </h3>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800">Invitation sent successfully!</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Child Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Child
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowChildDropdown(!showChildDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-white"
                >
                  <div className="flex items-center">
                    <Baby className="h-4 w-4 text-gray-400 mr-2" />
                    <span className={selectedChild ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedChild ? selectedChild.name : 'Select a child...'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {showChildDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                    <div className="p-2 border-b">
                      <input
                        type="text"
                        placeholder="Search children..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredChildren.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, childId: child.id }));
                            setShowChildDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium">{child.name}</div>
                            <div className="text-xs text-gray-500">
                              DOB: {formatDOB(child.dob)} • {calculateAge(child.dob)} old
                            </div>
                          </div>
                          {child.guardians && child.guardians.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {child.guardians.length} guardian{child.guardians.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Guardian Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.guardianEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, guardianEmail: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                  placeholder="parent@example.com"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.childId || !formData.guardianEmail}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Send Invitation</h2>
        <p className="text-gray-600 mt-1">
          Invite a parent or guardian to access a child's health records
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success ? (
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Invitation Sent!</h3>
          <p className="text-gray-600">
            An invitation has been sent to <strong>{formData.guardianEmail}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            The parent will receive an email with instructions to accept the invitation.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Child Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Child *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowChildDropdown(!showChildDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 border rounded-lg bg-white hover:border-gray-400"
              >
                <div className="flex items-center">
                  {selectedChild ? (
                    <>
                      <Baby className="h-5 w-5 text-blue-600 mr-3" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{selectedChild.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatDOB(selectedChild.dob)} • {calculateAge(selectedChild.dob)} old
                        </div>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500">Select a child...</span>
                  )}
                </div>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </button>
              
              {showChildDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowChildDropdown(false)}
                  />
                  <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-xl">
                    <div className="p-3 border-b">
                      <input
                        type="text"
                        placeholder="Search children by name or MRN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredChildren.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No children found
                        </div>
                      ) : (
                        filteredChildren.map((child) => (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, childId: child.id }));
                              setShowChildDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex justify-between items-center"
                          >
                            <div className="flex items-center">
                              <Baby className="h-4 w-4 text-gray-400 mr-3" />
                              <div>
                                <div className="font-medium text-gray-900">{child.name}</div>
                                <div className="text-sm text-gray-500">
                                  DOB: {formatDOB(child.dob)} • {calculateAge(child.dob)} old
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {child.guardians && child.guardians.length > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {child.guardians.length} guardian{child.guardians.length !== 1 ? 's' : ''}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded ${
                                child.sex === 'male' ? 'bg-blue-100 text-blue-800' : 
                                child.sex === 'female' ? 'bg-pink-100 text-pink-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {child.sex}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {loadingChildren && (
              <p className="mt-2 text-sm text-gray-500">Loading children...</p>
            )}
          </div>

          {/* Guardian Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardian Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.guardianEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, guardianEmail: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="parent@example.com"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This email will be used for account creation and login
            </p>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                value={formData.customMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a personal note for the parent..."
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-gray-500">Max 500 characters</span>
              <span className={formData.customMessage.length >= 450 ? 'text-amber-600' : 'text-gray-500'}>
                {formData.customMessage.length}/500
              </span>
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invitation Expires In *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={formData.expiresInDays}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>7 days (recommended)</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              After this period, the invitation link will no longer work
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.childId || !formData.guardianEmail}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}