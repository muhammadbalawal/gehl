import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const serverUrl = 'https://server-wb.onrender.com';
  
  try {
    console.log('🔍 Testing server connectivity to:', serverUrl);
    
    const response = await fetch(serverUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'gehl-test-client'
      }
    });
    
    console.log('📡 Server response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      serverUrl,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Server connectivity test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      serverUrl,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 