// app/api/call-sid/route.ts
import { NextRequest, NextResponse } from 'next/server';
import WebSocket from 'ws';

let currentCallSid: string | null = null;
let wsConnection: WebSocket | null = null;
let connectionAttempts = 0;
let lastMessageTime: Date | null = null;
let messageCount = 0;

function connectToWebSocket() {
  if (wsConnection?.readyState === WebSocket.OPEN) {
    console.log('🔌 WebSocket already connected to frontend endpoint');
    return;
  }

  connectionAttempts++;
  const WS_URL = 'wss://server-wb.onrender.com/frontend';
  
  console.log(`🔄 Attempting to connect to WebSocket (attempt ${connectionAttempts}): ${WS_URL}`);
  
  try {
    wsConnection = new WebSocket(WS_URL);
  } catch (error) {
    console.error('❌ Failed to create WebSocket connection:', error);
    return;
  }

  wsConnection.on('open', () => {
    console.log('✅ Successfully connected to WebSocket frontend endpoint');
    console.log('🎯 Listening for call_started messages with callSid...');
  });

  wsConnection.on('message', (data) => {
    messageCount++;
    lastMessageTime = new Date();
    
    console.log(`📨 Received WebSocket message #${messageCount} at ${lastMessageTime.toISOString()}`);
    console.log('📝 Raw message data:', data.toString());
    
    try {
      const message = JSON.parse(data.toString());
      console.log('✅ Parsed message successfully:', JSON.stringify(message, null, 2));
      
      if (message.type === 'call_started' && message.callSid) {
        const previousCallSid = currentCallSid;
        currentCallSid = message.callSid;
        
        console.log('🎉 CALL STARTED EVENT DETECTED!');
        console.log(`📞 Previous call SID: ${previousCallSid || 'none'}`);
        console.log(`📞 New call SID: ${currentCallSid}`);
        console.log('📊 This call SID will now be returned by the GET endpoint');
      } else if (message.type) {
        console.log(`ℹ️ Received message of type '${message.type}' (not a call_started event)`);
      } else {
        console.log('⚠️ Received message without type field');
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
      console.error('📝 Raw message that failed to parse:', data.toString());
    }
  });

  wsConnection.on('close', (code, reason) => {
    console.log(`🔴 WebSocket connection closed. Code: ${code}, Reason: ${reason || 'No reason provided'}`);
    console.log('⏰ Will attempt to reconnect in 5 seconds...');
    wsConnection = null;
    setTimeout(connectToWebSocket, 5000); // Reconnect after 5s
  });

  wsConnection.on('error', (error) => {
    console.error('❌ WebSocket connection error:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      name: error.name
    });
  });
}

// Initialize connection
console.log('🚀 Initializing call-sid API route...');
connectToWebSocket();

export async function GET() {
  const timestamp = new Date().toISOString();
  
  // Log connection status
  const wsStatus = wsConnection ? 
    (wsConnection.readyState === WebSocket.OPEN ? 'CONNECTED' : 
     wsConnection.readyState === WebSocket.CONNECTING ? 'CONNECTING' : 
     wsConnection.readyState === WebSocket.CLOSING ? 'CLOSING' : 'CLOSED') : 'NULL';
  
  console.log('🔍 GET /api/call-sid called');
  console.log(`📊 Current state:
    - Call SID: ${currentCallSid || 'none'}
    - WebSocket Status: ${wsStatus}
    - Connection Attempts: ${connectionAttempts}
    - Messages Received: ${messageCount}
    - Last Message: ${lastMessageTime?.toISOString() || 'none'}
    - Response Timestamp: ${timestamp}`);

  return NextResponse.json({ 
    callSid: currentCallSid,
    timestamp: timestamp,
    // Add debugging info that will be visible to frontend
    debug: {
      wsStatus,
      connectionAttempts,
      messageCount,
      lastMessageTime: lastMessageTime?.toISOString() || null
    }
  });
}