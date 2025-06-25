"use client";

import React, { useEffect, useRef, useState } from "react";
import { Device } from '@twilio/voice-sdk';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, PhoneOff, Clock, User } from "lucide-react";

export default function CallCard() {
  const deviceRef = useRef<Device | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callTime, setCallTime] = useState(0);

  const messages = [
    {
      id: 1,
      speaker: "Sofia Davis",
      email: "me@example.com",
      content: "Hi, how can I help you today?",
      isAgent: true,
      timestamp: "00:00"
    },
    {
      id: 2,
      speaker: "Customer",
      content: "Hey, I'm having trouble with my account.",
      isAgent: false,
      timestamp: "00:05"
    },
    {
      id: 3,
      speaker: "Sofia Davis",
      content: "What seems to be the problem?",
      isAgent: true,
      timestamp: "00:08"
    },
    {
      id: 4,
      speaker: "Customer",
      content: "I can't log in.",
      isAgent: false,
      timestamp: "00:12"
    }
  ];

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

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isCalling) {
      timer = setInterval(() => {
        setCallTime((prev) => prev + 1);
      }, 1000);
    } else {
      setCallTime(0);
      if (timer) clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCalling]);

  const formatTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const callClient = () => {
    deviceRef.current?.connect();
    setIsCalling(true);
  };

  const hangUp = () => {
    deviceRef.current?.disconnectAll();
    setIsCalling(false);
  };

  return (
    <Card className="w-96 text-zinc-50 border-zinc-700 shadow-2xl backdrop-blur-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 bg-zinc-700 border-2 border-zinc-600">
              <AvatarFallback className="bg-zinc-700 text-zinc-300">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-zinc-100">Customer Call</h3>
              {isCalling ? (
                <Badge variant="secondary" className="bg-green-900/50 text-green-400 border-green-700 text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-zinc-900/50 text-zinc-400 border-zinc-700 text-xs">
                  Ready
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            {isCalling ? (
              <div className="flex items-center space-x-1 text-zinc-400">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-mono">{formatTime(callTime)}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-zinc-400">
                <span className="text-sm">00:00</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 p-4">
        {/* Call Control Button */}
        <div className="flex justify-center">
          {!isCalling ? (
            <Button
              onClick={callClient}
              size="lg"
              className="bg-red-500 hover:bg-red-400 text-white w-full h-14 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              <Phone className="h-5 w-5 mr-2" />
              Start Call
            </Button>
          ) : (
            <Button
              onClick={hangUp}
              size="lg"
              variant="outline"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-50 border-zinc-600 hover:border-zinc-500 w-full h-14 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              <PhoneOff className="h-5 w-5 mr-2" />
              End Call
            </Button>
          )}
        </div>

        {/* Chat Interface */}
        {isCalling && (
          <>
            <Separator className="bg-zinc-700" />
            
            <div className="space-y-2 -mb-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-zinc-300">Live Conversation</h4>
                <Badge variant="outline" className="border-zinc-600 text-zinc-400 text-xs">
                  {messages.length} messages
                </Badge>
              </div>

              {/* Enhanced Chat Messages */}
              <div className="h-52 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {messages.map((message) => (
                  <div key={message.id} className="group">
                    {message.isAgent ? (
                      // Agent message - Left aligned
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8 bg-zinc-700 border border-zinc-600 flex-shrink-0">
                          <AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs">
                            SD
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-zinc-300">Sofia Davis</span>
                            <span className="text-xs text-zinc-500">{message.timestamp}</span>
                          </div>
                          <div className="bg-zinc-700/80 backdrop-blur-sm text-zinc-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] text-sm shadow-sm border border-zinc-600/30">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Customer message - Right aligned
                      <div className="flex items-start space-x-3 justify-end">
                        <div className="flex-1 space-y-1 flex flex-col items-end">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-zinc-500">{message.timestamp}</span>
                            <span className="text-xs font-medium text-zinc-300">Customer</span>
                          </div>
                          <div className="bg-zinc-300/90 backdrop-blur-sm text-zinc-800 rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] text-sm shadow-sm">
                            {message.content}
                          </div>
                        </div>
                        <Avatar className="h-8 w-8 bg-zinc-600 border border-zinc-500 flex-shrink-0">
                          <AvatarFallback className="bg-zinc-600 text-zinc-200 text-xs">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}