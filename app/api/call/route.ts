// app/api/call/route.ts

import { NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);



export async function POST(request: Request) {
    const { to, callerId } = await request.json();

    if (!to || !callerId) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        // Make outbound call to SIP URI with media stream enabled
        const call = await client.calls.create({
            to: `sip:${to}@myapp.sip.twilio.com`,  
            from: callerId,
            twiml: `<Response><Dial><Sip>
           sip:${to}@myapp.sip.twilio.com
           <Stream url="wss://your-server.example.com/media-stream" />
         </Sip></Dial></Response>`,
        });


        return NextResponse.json({ callSid: call.sid });
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
