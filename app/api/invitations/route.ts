import { NextRequest, NextResponse } from 'next/server';
import { AppService } from '@/app/services/app.services';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const result = await AppService.createInvitation({
      childId: data.childId,
      guardianEmail: data.guardianEmail,
      providerId: data.providerId,
      providerName: data.providerName,
      providerEmail: data.providerEmail,
      customMessage: data.customMessage,
      expiresInDays: data.expiresInDays,
      childName: data.childName,
    });

    return NextResponse.json({ 
      success: true, 
      invitationId: result.invitationId,
      invitationCode: result.invitationCode 
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send invitation' },
      { status: 500 }
    );
  }
}