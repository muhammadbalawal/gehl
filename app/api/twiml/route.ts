import { NextRequest, NextResponse } from 'next/server';

function generateTwiML(to: string, callerId: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="wss://1c1e-2001-4958-25ea-6d01-ac77-4d4a-1b38-2b64.ngrok-free.app" />
  </Start>
  <Dial callerId="${callerId}">
    <Number>${to}</Number>
  </Dial>
</Response>`;
}


export async function POST(request: NextRequest) {
  const to = '+15145703486';
  const callerId = '+19786503903';

  const xml = generateTwiML(to, callerId);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

