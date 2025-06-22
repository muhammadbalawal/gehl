"use client"

import * as React from "react"
import {
  IconCalendar,
  IconClock,
  IconPhone,
  IconUser,
  IconVideo,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Sample data for scheduled calls
const scheduledCalls = [
  {
    id: 1,
    leadName: "Sarah Chen",
    company: "TechStart Inc",
    phone: "+1 (555) 123-4567",
    date: "2024-12-20",
    time: "10:00 AM",
    type: "Discovery Call",
    callType: "phone",
    status: "confirmed",
  },
  {
    id: 2,
    leadName: "Michael Rodriguez",
    company: "Growth Dynamics",
    phone: "+1 (555) 234-5678",
    date: "2024-12-20",
    time: "2:30 PM",
    type: "Demo",
    callType: "video",
    status: "confirmed",
  },
  {
    id: 3,
    leadName: "Emily Thompson",
    company: "Scale Solutions",
    phone: "+1 (555) 345-6789",
    date: "2024-12-21",
    time: "9:00 AM",
    type: "Follow-up",
    callType: "phone",
    status: "pending",
  },
  {
    id: 4,
    leadName: "David Kim",
    company: "InnovateLab",
    phone: "+1 (555) 456-7890",
    date: "2024-12-21",
    time: "11:30 AM",
    type: "Proposal Review",
    callType: "video",
    status: "confirmed",
  },
  {
    id: 5,
    leadName: "Lisa Anderson",
    company: "NextGen Corp",
    phone: "+1 (555) 567-8901",
    date: "2024-12-21",
    time: "3:00 PM",
    type: "Discovery Call",
    callType: "phone",
    status: "confirmed",
  },
  {
    id: 6,
    leadName: "James Wilson",
    company: "FutureWorks LLC",
    phone: "+1 (555) 678-9012",
    date: "2024-12-22",
    time: "10:30 AM",
    type: "Demo",
    callType: "video",
    status: "pending",
  },
  {
    id: 7,
    leadName: "Maria Garcia",
    company: "Accelerate Partners",
    phone: "+1 (555) 789-0123",
    date: "2024-12-22",
    time: "1:00 PM",
    type: "Closing Call",
    callType: "phone",
    status: "confirmed",
  },
  {
    id: 8,
    leadName: "Robert Taylor",
    company: "Transform Industries",
    phone: "+1 (555) 890-1234",
    date: "2024-12-23",
    time: "9:30 AM",
    type: "Follow-up",
    callType: "video",
    status: "confirmed",
  },
]

export function ScheduledCallsTable() {
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Scheduled Calls</h2>
          <p className="text-sm text-muted-foreground">
            Upcoming calls with your leads
          </p>
        </div>
      </div>
      
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="pl-6">Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Call Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduledCalls.map((call) => (
              <TableRow key={call.id}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                      <IconUser className="size-4 text-primary" />
                    </div>
                    <div className="font-medium">{call.leadName}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {call.company}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {call.phone}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <IconCalendar className="size-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {new Date(call.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <IconClock className="size-3" />
                        {call.time}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {call.callType === "video" ? (
                      <IconVideo className="size-4 text-blue-500" />
                    ) : (
                      <IconPhone className="size-4 text-green-500" />
                    )}
                    <span className="text-sm">{call.type}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 