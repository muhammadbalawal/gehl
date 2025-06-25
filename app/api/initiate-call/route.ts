import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const to = body.to || '+15145703486';
    
    console.log('Initiating call to:', to);
    
    // Make a request to your TwiML endpoint to actually initiate the call
    // This will trigger Twilio to make the call
    const twimlResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://gehl.vercel.app'}/api/twiml`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `To=${encodeURIComponent(to)}`
    });
    
    if (!twimlResponse.ok) {
      throw new Error(`TwiML request failed: ${twimlResponse.status}`);
    }
    
    // Generate a placeholder callSid for the frontend
    // The actual callSid will come from the websocket server
    const callSid = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return NextResponse.json({
      success: true,
      callSid: callSid,
      message: 'Call initiated successfully'
    });
    
  } catch (error) {
    console.error('Error initiating call:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to initiate call'
    }, {
      status: 500
    });
  }
} 