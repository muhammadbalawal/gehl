import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('transcriptions')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Supabase connection test failed:', testError);
      return NextResponse.json({
        success: false,
        error: testError.message,
        type: 'connection_error',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    console.log('✅ Supabase connection test successful');
    
    // Test realtime subscription (this will fail if realtime is not enabled)
    try {
      const channel = supabase
        .channel('test-channel')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'transcriptions'
        }, () => {})
        .subscribe((status) => {
          console.log('📡 Test subscription status:', status);
        });
      
      // Clean up test subscription
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 1000);
      
      return NextResponse.json({
        success: true,
        connection: 'OK',
        realtime: 'Testing...',
        timestamp: new Date().toISOString()
      });
      
    } catch (realtimeError) {
      console.warn('⚠️ Realtime test failed:', realtimeError);
      return NextResponse.json({
        success: true,
        connection: 'OK',
        realtime: 'Failed - feature may not be enabled',
        realtimeError: realtimeError instanceof Error ? realtimeError.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 