import { NextRequest, NextResponse } from 'next/server';

function generateTwiMLWithRecording(to: string, callerId: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="wss://server-wb.onrender.com" track="outbound_track" />
  </Start>
  <Start>
    <Stream url="wss://server-wb.onrender.com" track="inbound_track" />
  </Start>
  <Dial 
    callerId="${callerId}"
  >
    <Number>${to}</Number>
  </Dial>
</Response>`;
}

export async function POST(request: NextRequest) {
  const to = '+15145703486';
  const callerId = '+19786503903';

  const xml = generateTwiMLWithRecording(to, callerId);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}