import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue, Timestamp, verifyIdToken } from '@/app/lib/firebase/admin';


// GET /api/children/[id] - Get child details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const childId = params.id;
    
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
    
    // Get child document
    const childRef = adminDb.collection('children').doc(childId);
    const childDoc = await childRef.get();
    
    if (!childDoc.exists) {
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      );
    }
    
    const childData = childDoc.data();
    
    // Get user role from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const userRole = userData?.role || 'unknown';
    
    // Check access permissions based on role
    const guardianIds = childData?.guardianIds || [];
    const providerIds = childData?.providers || [];
    
    const hasAccess = 
      userRole === 'admin' ||
      (userRole === 'healthcare' && providerIds.includes(decodedToken.uid)) ||
      (userRole === 'parent' && guardianIds.includes(decodedToken.uid));
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden - No access to this child' },
        { status: 403 }
      );
    }
    
    // Get parent details if user is healthcare/admin
    let parents = [];
    if (userRole !== 'parent') {
      const parentPromises = guardianIds.map(async (guardianId: string) => {
        const parentDoc = await adminDb.collection('users').doc(guardianId).get();
        return parentDoc.exists ? { id: parentDoc.id, ...parentDoc.data() } : null;
      });
      
      parents = (await Promise.all(parentPromises)).filter(Boolean);
    }
    
    // Get recent medical records
    const recordsQuery = adminDb.collection('medicalRecords')
      .where('childId', '==', childId)
      .orderBy('date', 'desc')
      .limit(5);
    
    const recordsSnapshot = await recordsQuery.get();
    const recentRecords = recordsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.(),
      nextAppointment: doc.data().nextAppointment?.toDate?.(),
    }));
    
    // Prepare response
    const response = {
      id: childDoc.id,
      name: childData?.name,
      dob: childData?.dob,
      sex: childData?.sex,
      status: childData?.status || 'active',
      growthStatus: childData?.growthStatus || 'normal',
      guardianIds,
      providers: providerIds,
      medicalRecordNumber: childData?.medicalRecordNumber,
      createdAt: childData?.createdAt?.toDate?.(),
      updatedAt: childData?.updatedAt?.toDate?.(),
      // Only include sensitive data for authorized users
      ...(userRole !== 'parent' && {
        createdBy: childData?.createdBy,
        createdByEmail: childData?.createdByEmail,
        createdByName: childData?.createdByName,
      }),
      parents,
      recentRecords,
    };
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('Error fetching child:', error);
    return NextResponse.json(
      { error: 'Failed to fetch child', details: error.message },
      { status: 500 }
    );
  }
}