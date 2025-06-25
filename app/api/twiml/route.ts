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
    console.log('Twilio requesting TwiML');
    
    // Get the phone number from form data
    let to = '+15145703486'; // default
    
    try {
      const formData = await request.formData();
      const toParam = formData.get('To');
      if (toParam) {
        to = toParam.toString();
      }
    } catch (e) {
      console.log('Using default phone number for Twilio request');
    }
    
    const callerId = '+19786503903';
    const xml = generateTwiMLWithRecording(to, callerId);
    
    console.log('Generated TwiML for call to:', to);
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error in TwiML endpoint:', error);
    
    // Return XML error for Twilio
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>An error occurred while processing your request.</Say>
</Response>`;
    
    return new NextResponse(errorXml, {
      status: 200, // Twilio expects 200 even for errors
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}