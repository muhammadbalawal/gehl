"use client";

import React, { useEffect, useRef, useState } from "react";
import { Device } from '@twilio/voice-sdk';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, PhoneOff, Clock, User, Mic, MicOff } from "lucide-react";

interface TranscriptMessage {
  transcript: string;
  confidence: number;
  speaker?: number;
  timestamp: number;
  isInterim?: boolean;
}

export default function CallCard() {
  const deviceRef = useRef<Device | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [callSid, setCallSid] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<TranscriptMessage[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);

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
      device.on('connect', (call) => {
        console.log('Call connected:', call.parameters.CallSid);
        setCallSid(call.parameters.CallSid);
        setIsCalling(true);
        connectToTranscription(call.parameters.CallSid);
      });
      device.on('disconnect', () => {
        console.log('Call disconnected');
        setIsCalling(false);
        setCallSid(null);
        disconnectFromTranscription();
      });
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

  const connectToTranscription = (sid: string) => {
    const websocketUrl = 'wss://server-wb.onrender.com';
    const ws = new WebSocket(`${websocketUrl}/audio-stream?callSid=${sid}`);
    
    ws.onopen = () => {
      console.log('🔌 Connected to transcription service');
      setIsTranscribing(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'transcript' || data.type === 'interim') {
          const message: TranscriptMessage = {
            ...data.data,
            isInterim: data.type === 'interim'
          };
          
          setLiveTranscript(prev => {
            if (data.type === 'interim') {
              // Replace the last interim message or add new one
              const filtered = prev.filter(msg => !msg.isInterim);
              return [...filtered, message];
            } else {
              // Add final transcript and remove interim
              const filtered = prev.filter(msg => !msg.isInterim);
              return [...filtered, message];
            }
          });
        }
      } catch (error) {
        console.error('Error parsing transcript message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsTranscribing(false);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsTranscribing(false);
    };

    wsRef.current = ws;
  };

  const disconnectFromTranscription = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsTranscribing(false);
    setLiveTranscript([]);
  };

  const formatTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const callClient = () => {
    deviceRef.current?.connect();
  };

  const hangUp = () => {
    deviceRef.current?.disconnectAll();
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      minute: '2-digit', 
      second: '2-digit' 
    });
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

        {/* Live Transcription Status */}
        {isCalling && (
          <div className="flex items-center justify-center space-x-2 text-sm">
            {isTranscribing ? (
              <>
                <Mic className="h-4 w-4 text-green-400 animate-pulse" />
                <span className="text-green-400">Live Transcription Active</span>
              </>
            ) : (
              <>
                <MicOff className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-500">Transcription Connecting...</span>
              </>
            )}
          </div>
        )}

        {/* Live Transcription Interface */}
        {isCalling && liveTranscript.length > 0 && (
          <>
            <Separator className="bg-zinc-700" />
            
            <div className="space-y-2 -mb-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-zinc-300">Live Transcription</h4>
                <Badge variant="outline" className="border-zinc-600 text-zinc-400 text-xs">
                  {liveTranscript.length} messages
                </Badge>
              </div>

              {/* Live Transcript Messages */}
              <div className="h-52 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {liveTranscript.map((message, index) => (
                  <div key={index} className="group">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8 bg-zinc-700 border border-zinc-600 flex-shrink-0">
                        <AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs">
                          {message.speaker !== undefined ? `S${message.speaker}` : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-zinc-300">
                            {message.speaker !== undefined ? `Speaker ${message.speaker}` : 'Unknown'}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {formatTimestamp(message.timestamp)}
                          </span>
                          {message.isInterim && (
                            <Badge variant="outline" className="border-yellow-600 text-yellow-400 text-xs">
                              Interim
                            </Badge>
                          )}
                        </div>
                        <div className={`backdrop-blur-sm rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] text-sm shadow-sm border ${
                          message.isInterim 
                            ? 'bg-yellow-900/20 text-yellow-200 border-yellow-600/30' 
                            : 'bg-zinc-700/80 text-zinc-100 border-zinc-600/30'
                        }`}>
                          {message.transcript}
                          {message.isInterim && (
                            <span className="inline-block w-2 h-4 bg-yellow-400 ml-1 animate-pulse"></span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </div>
                      </div>
                    </div>
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