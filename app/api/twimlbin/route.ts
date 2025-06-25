import { NextRequest, NextResponse } from 'next/server';

const WEBSOCKET_URL = 'wss://server-wb.onrender.com'; // Your Deepgram/streaming server

export async function GET() {
  // Step 1: Prompt for number
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather action="${process.env.NEXT_PUBLIC_BASE_URL }/api/twimlbin" method="POST" numDigits="15" timeout="10">
    <Say>
      Please enter the phone number you want to call, including country code, then press pound.
    </Say>
  </Gather>
  <Say>You didn't provide a number. Goodbye.</Say>
</Response>`;
  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
}

export async function POST(request: NextRequest) {
  // Step 2: Dial the entered number and start streaming
  const formData = await request.formData();
  const digits = formData.get('Digits') as string | null;
  const callerId = process.env.TWILIO_PHONE_NUMBER;

  if (!digits) {
    // No number entered
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>No number entered. Goodbye.</Say>
</Response>`;
    return new NextResponse(xml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="${WEBSOCKET_URL}/audio-stream?callSid={{CallSid}}" track="both_tracks" />
  </Start>
  <Dial callerId="${callerId}">
    <Number>${digits}</Number>
  </Dial>
</Response>`;

  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
} 