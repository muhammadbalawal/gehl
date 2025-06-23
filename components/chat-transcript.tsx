import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";

const messages = [
  { from: 'agent', text: 'Hi, how can I help you today?' },
  { from: 'customer', text: 'Hey, I\'m having trouble with my account.' },
  { from: 'agent', text: 'What seems to be the problem?' },
  { from: 'customer', text: 'I can\'t log in.' },
  { from: 'agent', text: 'I see. Let me check on that for you.' },
  { from: 'customer', text: 'Thanks!' },
  { from: 'agent', text: 'It looks like your password was recently reset. Did you receive an email with a temporary password?' },
  { from: 'customer', text: 'Oh, I see it now. I missed that email.' },
  { from: 'agent', text: 'No problem! Let me know if you need anything else.' },
];

export function ChatTranscript() {
  return (
    <Card className="w-full max-w-md bg-zinc-900 text-zinc-50 border-zinc-800 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://ui.shadcn.com/avatars/01.png" alt="Sofia Davis" />
            <AvatarFallback>SD</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">Sofia Davis</p>
            <p className="text-xs text-zinc-400">m@example.com</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800">
          <Plus className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 h-80 overflow-y-auto space-y-4 scrollbar-hide">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 ${message.from === 'customer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                message.from === 'customer'
                  ? 'bg-zinc-50 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-50'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
