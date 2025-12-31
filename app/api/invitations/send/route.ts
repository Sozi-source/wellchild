import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyIdToken } from '@/app/lib/firebase/admin'
import { Timestamp } from 'firebase-admin/firestore';

// POST /api/invitations/send - Send invitation
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { childId, guardianEmail, customMessage, expiresInDays = 7 } = body;
    
    // Validate input
    if (!childId || !guardianEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: childId and guardianEmail' },
        { status: 400 }
      );
    }
    
    // Get user data
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'healthcare') {
      return NextResponse.json(
        { error: 'Only healthcare providers can send invitations' },
        { status: 403 }
      );
    }
    
    // Get child data
    const childDoc = await adminDb.collection('children').doc(childId).get();
    if (!childDoc.exists) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }
    
    const childData = childDoc.data();
    
    // Check if user is provider for this child
    if (!childData?.providers?.includes(decodedToken.uid)) {
      return NextResponse.json(
        { error: 'You are not authorized to invite parents for this child' },
        { status: 403 }
      );
    }
    
    // Check if invitation already exists
    const existingInvitation = await adminDb.collection('invitations')
      .where('childId', '==', childId)
      .where('guardianEmail', '==', guardianEmail.toLowerCase())
      .where('status', '==', 'pending')
      .limit(1)
      .get();
    
    if (!existingInvitation.empty) {
      return NextResponse.json(
        { 
          error: 'Invitation already sent',
          invitationId: existingInvitation.docs[0].id 
        },
        { status: 409 }
      );
    }
    
    // Generate invitation code
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      return Array.from({ length: 8 }, () => 
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    };
    
    const invitationCode = generateCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    // Create invitation document
    const invitationData = {
      childId,
      childName: childData.name,
      guardianEmail: guardianEmail.toLowerCase(),
      providerId: decodedToken.uid,
      providerName: userData.name || 'Healthcare Provider',
      providerEmail: decodedToken.email || userData.email,
      status: 'pending',
      invitationCode,
      invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite/${invitationCode}`,
      customMessage: customMessage || '',
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const invitationRef = await adminDb.collection('invitations').add(invitationData);
    
    // Here you would typically send an email
    // For now, we'll log it
    console.log(`Invitation created for ${guardianEmail}: ${invitationData.invitationLink}`);
    
    return NextResponse.json({
      success: true,
      invitationId: invitationRef.id,
      invitationLink: invitationData.invitationLink,
      invitationCode,
      expiresAt: invitationData.expiresAt.toDate(),
      message: `Invitation sent to ${guardianEmail}`
    });
    
  } catch (error: any) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation', details: error.message },
      { status: 500 }
    );
  }
}