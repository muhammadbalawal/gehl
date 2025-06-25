// hooks/useCallSid.ts
import { useState, useEffect } from 'react';

export function useCallSid() {
  const [callSid, setCallSid] = useState<string | null>(null);

  useEffect(() => {
    const fetchCallSid = async () => {
      try {
        const response = await fetch('/api/call-sid');
        const data = await response.json();
        setCallSid(data.callSid);
      } catch (error) {
        console.error('Error fetching call SID:', error);
      }
    };

    // Poll every 2 seconds for new call SID
    const interval = setInterval(fetchCallSid, 2000);
    fetchCallSid(); // Initial fetch

    return () => clearInterval(interval);
  }, []);

  return callSid;
}