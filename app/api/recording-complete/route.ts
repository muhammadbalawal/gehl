// File: app/api/recording-complete/route.ts
// SIMPLE VERSION - Just transcribe and log to console

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const recordingUrl = formData.get('RecordingUrl') as string;
    const callSid = formData.get('CallSid') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    
    console.log(`🎬 Recording completed for call: ${callSid}`);
    console.log(`📁 Recording URL: ${recordingUrl}`);
    
    // Process recording immediately
    processRecording(recordingUrl, callSid);
    
    return new NextResponse('OK', { status: 200 });
    
  } catch (error) {
    console.error('❌ Error in recording webhook:', error);
    return new NextResponse('Error', { status: 500 });
  }
}

async function processRecording(recordingUrl: string, callSid: string) {
  try {
    console.log('📥 Downloading recording...');
    
    // Download recording from Twilio
    const response = await axios.get(recordingUrl, {
      responseType: 'arraybuffer',
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID!,
        password: process.env.TWILIO_AUTH_TOKEN!
      }
    });
    
    console.log('🎙️ Transcribing with Deepgram...');
    
    // Send to Deepgram
    const transcriptResponse = await axios.post(
      'https://api.deepgram.com/v1/listen',
      response.data,
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/wav'
        },
        params: {
          model: 'nova-2',
          language: 'en-US',
          punctuate: true,
          smart_format: true,
          diarize: true
        }
      }
    );
    
    const results = transcriptResponse.data.results;
    
    if (results.channels && results.channels[0].alternatives) {
      const transcript = results.channels[0].alternatives[0];
      
      console.log('\n📝 === RECORDING TRANSCRIPT (BOTH PARTIES) ===');
      
      // Show speakers if diarization worked
      if (transcript.paragraphs && transcript.paragraphs.paragraphs) {
        transcript.paragraphs.paragraphs.forEach((paragraph: any) => {
          paragraph.sentences.forEach((sentence: any) => {
            const speaker = sentence.speaker !== undefined ? `Speaker ${sentence.speaker}` : 'Unknown';
            console.log(`[${speaker}]: ${sentence.text}`);
          });
        });
      } else {
        // Fallback without speaker separation
        console.log(`[BOTH PARTIES]: ${transcript.transcript}`);
      }
      
      console.log('===============================================\n');
    }
    
  } catch (error) {
    console.error('❌ Error processing recording:', error);
  }
}