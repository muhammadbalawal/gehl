import { NextRequest, NextResponse } from 'next/server';

function generateTwiMLWithRecording(to: string, callerId: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="wss://server-wb.onrender.com/inbound" track="inbound_track" />
  </Start>
  <Start>
    <Stream url="wss://server-wb.onrender.com/outbound" track="outbound_track" />
  </Start>
  <Dial 
    callerId="${callerId}"
    statusCallback="/api/call-status"
    statusCallbackEvent="initiated ringing answered completed"
  >
    <Number>${to}</Number>
  </Dial>
</Response>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const to = body.to || '+15145703486'; // Use provided number or default
    const callerId = '+19786503903';

    const xml = generateTwiMLWithRecording(to, callerId);

    // For now, we'll return a placeholder callSid
    // In a real implementation, you'd need to get the actual callSid from Twilio
    // This could be done by setting up a webhook or using Twilio's API
    const callSid = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      callSid: callSid,
      twiml: xml
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in TwiML endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate TwiML'
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}