import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const to = body.to || '+15145703486';
    
    console.log('Initiating call to:', to);
    
    // Check if we have the required environment variables
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!twilioAccountSid || !twilioAuthToken) {
      console.log('Twilio credentials not configured, returning mock response');
      // Return a mock response for testing
      const mockCallSid = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return NextResponse.json({
        success: true,
        callSid: mockCallSid,
        message: 'Mock call initiated (Twilio credentials not configured)'
      });
    }
    
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+19786503903';
    
    // Create the TwiML URL that includes the streaming configuration
    const twimlUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://gehl.vercel.app'}/api/twiml`;
    
    // Make the call using Twilio's REST API
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: twilioPhoneNumber,
        Url: twimlUrl,
        StatusCallback: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://gehl.vercel.app'}/api/call-status`,
        StatusCallbackEvent: 'initiated ringing answered completed'
      }).toString()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twilio API error:', response.status, errorText);
      return NextResponse.json({
        success: false,
        error: `Twilio API error: ${response.status}`
      }, {
        status: 500
      });
    }
    
    const callData = await response.json();
    console.log('Call initiated via Twilio API:', callData);
    
    return NextResponse.json({
      success: true,
      callSid: callData.sid,
      message: 'Call initiated successfully'
    });
    
  } catch (error) {
    console.error('Error initiating call:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate call'
    }, {
      status: 500
    });
  }
} 