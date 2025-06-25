// hooks/useCallSid.ts
import { useState, useEffect } from 'react';

interface CallSidResponse {
  callSid: string | null;
  timestamp: string;
  debug?: {
    wsStatus: string;
    connectionAttempts: number;
    messageCount: number;
    lastMessageTime: string | null;
  };
}

export function useCallSid() {
  const [callSid, setCallSid] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  useEffect(() => {
    console.log('🎣 useCallSid hook initialized - will poll every 2 seconds');
    
    const fetchCallSid = async () => {
      const currentFetchCount = fetchCount + 1;
      setFetchCount(currentFetchCount);
      
      console.log(`📡 [Fetch #${currentFetchCount}] Requesting call SID from /api/call-sid`);
      
      try {
        const response = await fetch('/api/call-sid');
        console.log(`✅ [Fetch #${currentFetchCount}] Response received:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data: CallSidResponse = await response.json();
        console.log(`📄 [Fetch #${currentFetchCount}] Response data:`, JSON.stringify(data, null, 2));
        
        // Log debug information if available
        if (data.debug) {
          console.log(`🔧 [Fetch #${currentFetchCount}] Server debug info:`, {
            websocketStatus: data.debug.wsStatus,
            connectionAttempts: data.debug.connectionAttempts,
            messagesReceived: data.debug.messageCount,
            lastMessage: data.debug.lastMessageTime
          });
        }
        
        // Check if call SID changed
        if (data.callSid !== callSid) {
          if (data.callSid && !callSid) {
            console.log(`🎉 [Fetch #${currentFetchCount}] NEW CALL SID DETECTED:`, data.callSid);
          } else if (!data.callSid && callSid) {
            console.log(`📞 [Fetch #${currentFetchCount}] Call SID cleared (call ended):`, callSid, '→', null);
          } else if (data.callSid && callSid) {
            console.log(`🔄 [Fetch #${currentFetchCount}] Call SID changed:`, callSid, '→', data.callSid);
          } else {
            console.log(`📭 [Fetch #${currentFetchCount}] No call SID (no active calls)`);
          }
          setCallSid(data.callSid);
        } else {
          if (data.callSid) {
            console.log(`♻️ [Fetch #${currentFetchCount}] Call SID unchanged:`, data.callSid);
          } else {
            console.log(`💤 [Fetch #${currentFetchCount}] Still no active call SID`);
          }
        }
        
      } catch (error) {
        console.error(`❌ [Fetch #${currentFetchCount}] Error fetching call SID:`, error);
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.error('🌐 Network error - check if the server is running');
        }
      }
    };

    // Poll every 2 seconds for new call SID
    console.log('⏰ Setting up call SID polling (every 2 seconds)');
    const interval = setInterval(fetchCallSid, 2000);
    
    // Initial fetch
    console.log('🚀 Performing initial call SID fetch');
    fetchCallSid();

    return () => {
      console.log('🛑 useCallSid cleanup - stopping poll interval');
      clearInterval(interval);
    };
  }, []);

  // Log call SID changes for debugging
  useEffect(() => {
    if (callSid) {
      console.log(`📱 HOOK STATE UPDATED - Active call SID: ${callSid}`);
    } else {
      console.log(`📱 HOOK STATE UPDATED - No active call SID`);
    }
  }, [callSid]);

  return callSid;
}