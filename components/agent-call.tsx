'use client';

import { useEffect, useRef, useState } from 'react';
import { Device } from '@twilio/voice-sdk';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AgentCall() {
  const deviceRef = useRef<Device | null>(null);

  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    const init = async () => {
      const res = await fetch('/api/token');
      const { token } = await res.json();
      const device = new Device(token);
      deviceRef.current = device;

      device.on('ready', () => console.log('Ready to call'));
      device.on('error', (err) => console.error('Twilio error:', err));
    };

    init();
  }, []);

  // useEffect(() => {
  //   if (!deviceRef.current)
  //     setIsCalling(false)
  // }, []);

  const callClient = () => {
    deviceRef.current?.connect();
    setIsCalling(true)
  };

  const hangUp = () => {
    deviceRef.current?.disconnectAll();
    setIsCalling(false);
  };

  return (
    <Card className="w-80 bg-zinc-900 text-zinc-50 border-zinc-800 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col items-center space-y-2">
          <div className="text-xl font-medium">Phone Dialer</div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center space-y-6">
        <div className="w-full flex justify-center gap-4">
          {!isCalling ? (
            <Button
              onClick={callClient}
              className="bg-zinc-50 hover:bg-zinc-200 text-zinc-950"
            >
              Call
            </Button>
          ) : (
            <Button
              onClick={hangUp}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-50"
            >
              Hang Up
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

