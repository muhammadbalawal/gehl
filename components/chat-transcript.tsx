import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: 'agent' | 'user';
  name: string;
  message: string;
}

interface ChatTranscriptProps {
  messages: Message[];
}

export function ChatTranscript({ messages }: ChatTranscriptProps) {
  return (
    <div className="h-full w-full overflow-auto flex flex-col justify-end">
      <div className="p-4 flex flex-col gap-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 transition-all animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                message.role === "user"
                  ? "bg-zinc-50 text-zinc-950"
                  : "bg-zinc-800 text-zinc-50"
              }`}
            >
              <p className="font-semibold mb-1">{message.name}</p>
              {message.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}