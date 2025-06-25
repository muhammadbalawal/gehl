import { NextRequest, NextResponse } from 'next/server';

function generateTwiMLWithRecording(to: string, callerId: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="wss://server-wb.onrender.com" track="both_tracks" />
  </Start>
  <Dial 
    callerId="${callerId}"
    record="record-from-answer-dual"
    recordingStatusCallback="${process.env.NEXT_PUBLIC_BASE_URL}/api/recording-complete"
    recordingStatusCallbackEvent="completed"
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