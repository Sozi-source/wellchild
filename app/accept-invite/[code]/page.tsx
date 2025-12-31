"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { DatabaseService } from '@/app/lib/firebase/db.service';
import Link from 'next/link';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  UserPlus,
  Baby,
  Mail,
  Calendar,
  Shield
} from 'lucide-react';

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile, signUp, signIn } = useAuth();
  
  const invitationCode = params.code as string;
  
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  
  // For new user registration
  const [isNewUser, setIsNewUser] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  useEffect(() => {
    if (invitationCode) {
      loadInvitation();
    }
  }, [invitationCode]);

  useEffect(() => {
    if (user && invitation) {
      // User is logged in, check if they can accept
      handleAccept();
    }
  }, [user, invitation]);

  const loadInvitation = async () => {
    try {
      const invitationData = await DatabaseService.getInvitation(invitationCode);
      
      if (!invitationData) {
        setError('Invalid or expired invitation');
        setIsExpired(true);
        setLoading(false);
        return;
      }
      
      // Check if expired
      if (new Date(invitationData.expiresAt) < new Date()) {
        setError('This invitation has expired');
        setIsExpired(true);
        setInvitation(invitationData);
        setLoading(false);
        return;
      }
      
      setInvitation(invitationData);
      setError('');
    } catch (err: any) {
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user || !invitation || processing) return;
    
    try {
      setProcessing(true);
      setError('');
      
      await DatabaseService.acceptInvitation(
        invitation.id,
        user.uid,
        userProfile?.name || formData.name
      );
      
      // Redirect to parent dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard/parent');
      }, 3000);
      
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setProcessing(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }
    
    try {
      setProcessing(true);
      setError('');
      await signIn(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      setProcessing(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setProcessing(true);
      setError('');
      await signUp(formData.email, formData.password, formData.name, 'parent');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setProcessing(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            <Shield className="h-8 w-8 inline-block mr-2 text-blue-600 align-middle" />
            Accept Invitation
          </h1>
          <p className="text-gray-600 mt-2">
            Join your child's health monitoring portal
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Expired Invitation */}
        {isExpired && invitation && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start">
              <Clock className="h-6 w-6 text-yellow-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-800">Invitation Expired</h3>
                <p className="text-yellow-700 mt-1">
                  This invitation expired on {formatDate(invitation.expiresAt)}.
                  Please contact {invitation.providerName} for a new invitation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Invitation Details */}
        {invitation && !isExpired && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <div className="text-center mb-6">
              <UserPlus className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold mb-2">
                You're invited to access {invitation.childName}'s health records
              </h2>
              <p className="text-gray-600">
                Sent by {invitation.providerName}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Baby className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium">Child Details</h3>
                </div>
                <p className="text-lg font-bold">{invitation.childName}</p>
                <p className="text-sm text-gray-600">
                  Invitation sent to: {invitation.guardianEmail}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium">Invitation Details</h3>
                </div>
                <p className="text-sm">
                  Expires: {formatDate(invitation.expiresAt)}
                </p>
                {invitation.customMessage && (
                  <p className="text-sm text-gray-600 mt-2">
                    "{invitation.customMessage}"
                  </p>
                )}
              </div>
            </div>

            {/* Auth Forms */}
            {!user ? (
              <div>
                {!isNewUser ? (
                  // Sign In Form
                  <div>
                    <h3 className="font-bold mb-4 text-center">Sign In to Accept</h3>
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div>
                        <input
                          type="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {processing ? 'Signing In...' : 'Sign In & Accept'}
                      </button>
                    </form>
                    <p className="text-center mt-4 text-gray-600">
                      Don't have an account?{' '}
                      <button
                        onClick={() => setIsNewUser(true)}
                        className="text-blue-600 hover:underline"
                      >
                        Register here
                      </button>
                    </p>
                  </div>
                ) : (
                  // Sign Up Form
                  <div>
                    <h3 className="font-bold mb-4 text-center">Create Account</h3>
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          placeholder="Phone Number (Optional)"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {processing ? 'Creating Account...' : 'Create Account & Accept'}
                      </button>
                    </form>
                    <p className="text-center mt-4 text-gray-600">
                      Already have an account?{' '}
                      <button
                        onClick={() => setIsNewUser(false)}
                        className="text-blue-600 hover:underline"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Already logged in
              <div className="text-center">
                <div className="mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                </div>
                <p className="text-gray-600 mb-4">
                  You're logged in as {userProfile?.name}
                </p>
                <button
                  onClick={handleAccept}
                  disabled={processing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {processing ? 'Accepting...' : 'Accept Invitation'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Terms & Privacy */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-600">
          <p>
            By accepting this invitation, you agree to our{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            {' '}and{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>.
          </p>
          <p className="mt-2">
            This portal is designed to help you track your child's health progress.
          </p>
        </div>
      </div>
    </div>
  );
}