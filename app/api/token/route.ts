import { NextResponse } from 'next/server';
import { jwt } from 'twilio';

const { AccessToken } = jwt;
const { VoiceGrant } = AccessToken;

export async function GET(request: Request) {
  const identity = 'agent'; 
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_API_KEY!,
    process.env.TWILIO_API_SECRET!,
    { identity }
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWIML_APP_SID!,
    incomingAllow: false,
  });

  token.addGrant(voiceGrant);

  return NextResponse.json({ token: token.toJwt() });
}