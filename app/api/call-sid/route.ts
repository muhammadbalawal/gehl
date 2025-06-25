// app/api/call-sid/route.ts
import { NextRequest, NextResponse } from 'next/server';
import WebSocket from 'ws';

let currentCallSid: string | null = null;
let wsConnection: WebSocket | null = null;

function connectToWebSocket() {
  if (wsConnection?.readyState === WebSocket.OPEN) return;

  const WS_URL = 'ws://server-wb.onrender.com/frontend';
  
  wsConnection = new WebSocket(WS_URL);

  wsConnection.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'call_started' && message.callSid) {
        currentCallSid = message.callSid;
        console.log('📞 New call SID:', currentCallSid);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  wsConnection.on('close', () => {
    wsConnection = null;
    setTimeout(connectToWebSocket, 5000); // Reconnect after 5s
  });
}

// Initialize connection
connectToWebSocket();

export async function GET() {
  return NextResponse.json({ 
    callSid: currentCallSid,
    timestamp: new Date().toISOString()
  });
}