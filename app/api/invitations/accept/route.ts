import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue, Timestamp, verifyIdToken } from '@/app/lib/firebase/admin';


// POST /api/invitations/accept - Accept an invitation
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
    const { invitationCode } = body;
    
    if (!invitationCode) {
      return NextResponse.json(
        { error: 'Missing invitation code' },
        { status: 400 }
      );
    }
    
    // Find invitation
    const invitationQuery = adminDb.collection('invitations')
      .where('invitationCode', '==', invitationCode)
      .where('status', '==', 'pending')
      .limit(1);
    
    const invitationSnapshot = await invitationQuery.get();
    
    if (invitationSnapshot.empty) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }
    
    const invitationDoc = invitationSnapshot.docs[0];
    const invitationData = invitationDoc.data();
    
    // Check if expired
    if (invitationData.expiresAt.toDate() < new Date()) {
      await adminDb.collection('invitations').doc(invitationDoc.id).update({
        status: 'expired',
        updatedAt: Timestamp.now()
      });
      
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      );
    }
    
    // Check email matches (optional security check)
    if (invitationData.guardianEmail !== decodedToken.email) {
      return NextResponse.json(
        { error: 'Email does not match invitation' },
        { status: 403 }
      );
    }
    
    // Start a transaction to ensure data consistency
    const batch = adminDb.batch();
    
    // Update invitation
    const invitationRef = adminDb.collection('invitations').doc(invitationDoc.id);
    batch.update(invitationRef, {
      status: 'accepted',
      acceptedAt: Timestamp.now(),
      acceptedBy: decodedToken.uid,
      guardianName: decodedToken.name || decodedToken.email?.split('@')[0],
      updatedAt: Timestamp.now()
    });
    
    // Add parent to child's guardians
    const childRef = adminDb.collection('children').doc(invitationData.childId);
    batch.update(childRef, {
      guardianIds: FieldValue.arrayUnion(decodedToken.uid),
      updatedAt: Timestamp.now()
    });
    
    // Add child to parent's children list
    const parentRef = adminDb.collection('users').doc(decodedToken.uid);
    batch.update(parentRef, {
      children: FieldValue.arrayUnion(invitationData.childId),
      updatedAt: Timestamp.now()
    });
    
    // Execute batch write
    await batch.commit();
    
    // Get updated child data
    const childDoc = await childRef.get();
    const childData = childDoc.data();
    
    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      child: {
        id: childDoc.id,
        name: childData?.name,
        dob: childData?.dob,
        sex: childData?.sex
      }
    });
    
  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation', details: error.message },
      { status: 500 }
    );
  }
}