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
  // const to = '+15145703486';
  const to = '+15147714587';

  const callerId = '+19786503903';

  const xml = generateTwiMLWithRecording(to, callerId);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}