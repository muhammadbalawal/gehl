// File: app/api/twiml-sip/route.ts
// This handles SIP calls with BOTH-SIDED live transcription

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const to = formData.get('To') as string;
    const from = formData.get('From') as string;
    const callSid = formData.get('CallSid') as string;
    
    console.log(`📞 SIP call request:`);
    console.log(`   To: ${to}`);
    console.log(`   From: ${from}`);
    console.log(`   CallSid: ${callSid}`);
    
    // Extract the target phone number from SIP URI
    // Format: sip:+15145703486@myapp.sip.twilio.com -> +15145703486
    let targetNumber = to;
    if (to.includes('sip:')) {
      targetNumber = to.replace('sip:', '').split('@')[0];
    }
    
    console.log(`📱 Calling: ${targetNumber}`);
    
    // Generate TwiML with SIP and Stream for BOTH-SIDED transcription
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial 
    record="record-from-answer-dual"
    recordingStatusCallback="${process.env.NEXT_PUBLIC_BASE_URL}/api/recording-complete"
    recordingStatusCallbackEvent="completed"
    timeout="30"
  >
    <Sip>
      <Stream url="wss://server-wb.onrender.com" />
      sip:${targetNumber}@myapp.sip.twilio.com
    </Sip>
  </Dial>
</Response>`;

    console.log(`📋 Generated SIP TwiML with Stream for ${targetNumber}`);

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
    
  } catch (error) {
    console.error('❌ Error in SIP TwiML route:', error);
    
    // Return safe error TwiML
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Sorry, there was an error processing your call. Please try again.</Say>
</Response>`;
    
    return new NextResponse(errorTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}