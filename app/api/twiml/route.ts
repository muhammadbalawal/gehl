import { NextRequest, NextResponse } from 'next/server';

function generateTwiMLWithLiveStreaming(to: string, callerId: string) {
  const websocketUrl = 'wss://server-wb.onrender.com';
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="${websocketUrl}/audio-stream?callSid={{CallSid}}" track="both_tracks" />
  </Start>
  <Dial 
    callerId="${callerId}"
    record="record-from-answer-dual"
    recordingStatusCallback="${process.env.NEXT_PUBLIC_BASE_URL}/api/recording-complete"
    recordingStatusCallbackEvent="completed"
    timeout="30"
  >
    <Number>${to}</Number>
  </Dial>
</Response>`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const to = formData.get('To') as string || '+15145703486';
    
    // Use the validated Twilio phone number from environment variables
    const validatedCallerId = process.env.TWILIO_PHONE_NUMBER;
    const callerId = formData.get('From') as string || validatedCallerId;
    const callSid = formData.get('CallSid') as string;

    console.log(`📞 Generating TwiML for call: ${callSid}`);
    console.log(`📱 To: ${to}, From: ${callerId}`);

    // Validate that we have a proper caller ID
    if (!callerId || !validatedCallerId) {
      throw new Error('No validated caller ID available');
    }

    const xml = generateTwiMLWithLiveStreaming(to, callerId);

    console.log(`📋 Generated TwiML with live streaming for ${to}`);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('❌ Error generating TwiML:', error);
    
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