import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const to = formData.get('To') as string;
    const from = formData.get('From') as string;

    console.log('Call Status Webhook:', {
      callSid,
      callStatus,
      to,
      from
    });

    // Here you could store the callSid in a database or emit it via WebSocket
    // For now, we'll just log it
    if (callStatus === 'initiated' || callStatus === 'ringing') {
      console.log('New call initiated with SID:', callSid);
      // You could emit this to your frontend via WebSocket
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in call status webhook:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 