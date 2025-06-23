// app/api/recording/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const recordingUrl = body.get('RecordingUrl');

  if (!recordingUrl) return NextResponse.json({ error: 'No recording URL' }, { status: 400 });

  const fullUrl = `${recordingUrl}.mp3`;

  // Send to AssemblyAI for transcription
  const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      authorization: process.env.ASSEMBLYAI_API_KEY!,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ audio_url: fullUrl }),
  });

  const data = await transcriptRes.json();

  console.log('🧠 Transcript request sent:', data.id);

  return NextResponse.json({ status: 'transcription started', transcriptId: data.id });
}
