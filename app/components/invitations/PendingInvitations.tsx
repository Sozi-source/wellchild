'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/app/lib/firebase/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import InvitationStatusBadge from './InvitationStatusBadge';
import { Mail, Baby, Calendar, Clock, User, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Invitation {
  id: string;
  childId: string;
  childName: string;
  guardianEmail: string;
  invitationCode: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
  acceptedAt?: Date;
  customMessage?: string;
}

interface PendingInvitationsProps {
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export default function PendingInvitations({ 
  limit = 5, 
  showHeader = true,
  compact = false 
}: PendingInvitationsProps) {
  const { userProfile } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile?.uid) return;

    setLoading(true);
    
    // Subscribe to invitations for this healthcare provider
    const invitationsQuery = query(
      collection(db, 'invitations'),
      where('providerId', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(invitationsQuery, 
      (snapshot) => {
        try {
          const invitationList: Invitation[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            invitationList.push({
              id: doc.id,
              childId: data.childId,
              childName: data.childName,
              guardianEmail: data.guardianEmail,
              invitationCode: data.invitationCode,
              status: data.status || 'pending',
              createdAt: data.createdAt?.toDate() || new Date(),
              expiresAt: data.expiresAt?.toDate(),
              acceptedAt: data.acceptedAt?.toDate(),
              customMessage: data.customMessage,
            });
          });

          // Apply limit if specified
          const limitedList = limit ? invitationList.slice(0, limit) : invitationList;
          setInvitations(limitedList);
          setError(null);
        } catch (err) {
          console.error('Error processing invitations:', err);
          setError('Failed to load invitations');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Firestore error:', err);
        setError('Failed to connect to server');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userProfile?.uid, limit]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(date);
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border p-4">
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-600" />
              Recent Invitations
            </h3>
            {invitations.length > 0 && (
              <Link 
                href="/dashboard/invitations" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all
              </Link>
            )}
          </div>
        )}
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">{error}</div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-4">
            <Mail className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No invitations sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium truncate">{inv.childName}</div>
                  <InvitationStatusBadge status={inv.status} size="sm" />
                </div>
                <div className="text-sm text-gray-600 truncate">{inv.guardianEmail}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Sent {formatTimeAgo(inv.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border">
      {showHeader && (
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pending Invitations</h2>
              <p className="text-gray-600 text-sm mt-1">
                Invitations sent to parents and guardians
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-2 w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Error loading invitations</div>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-700 font-medium mb-2">No invitations yet</h3>
            <p className="text-gray-500">
              Start sending invitations to parents to access children's health records.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((inv) => (
              <div key={inv.id} className="border rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <Baby className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{inv.childName}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Mail className="h-4 w-4 mr-1" />
                        {inv.guardianEmail}
                      </div>
                    </div>
                  </div>
                  <InvitationStatusBadge status={inv.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Sent: {formatDate(inv.createdAt)}</span>
                  </div>
                  {inv.expiresAt && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Expires: {formatDate(inv.expiresAt)}</span>
                    </div>
                  )}
                </div>
                
                {inv.customMessage && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700 italic">"{inv.customMessage}"</p>
                  </div>
                )}
                
                {inv.status === 'pending' && (
                  <div className="mt-3 text-xs text-amber-600 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Awaiting acceptance
                  </div>
                )}
                
                {inv.status === 'accepted' && inv.acceptedAt && (
                  <div className="mt-3 text-xs text-green-600">
                    Accepted on {formatDate(inv.acceptedAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {invitations.length > 0 && (
          <div className="mt-6 text-center">
            <Link
              href="/dashboard/invitations"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View all invitations →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}