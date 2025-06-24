"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SearchIcon, 
  FilterIcon, 
  ArrowUpDownIcon,
  DownloadIcon,
  PlusIcon,
  CalendarIcon,
  ListIcon,
  UserIcon,
  ClockIcon
} from "lucide-react"

// Sample data for business activities
const businessData = [
  { 
    date: 7, 
    type: "call", 
    label: "Follow up call", 
    client: "Sarah Chen",
    company: "TechStart Inc",
    time: "10:00 AM",
    count: 1 
  },
  { 
    date: 7, 
    type: "meeting", 
    label: "Demo meeting", 
    client: "Michael Rodriguez",
    company: "Growth Dynamics",
    time: "2:30 PM",
    count: 1 
  },
  { 
    date: 13, 
    type: "invoice", 
    label: "Invoice sending", 
    client: "Emily Thompson",
    company: "Scale Solutions",
    time: "9:00 AM",
    count: 1 
  },
  { 
    date: 20, 
    type: "call", 
    label: "Discovery call", 
    client: "David Kim",
    company: "InnovateLab",
    time: "11:30 AM",
    count: 1 
  },
  { 
    date: 20, 
    type: "meeting", 
    label: "Proposal review", 
    client: "Lisa Anderson",
    company: "NextGen Corp",
    time: "3:00 PM",
    count: 1 
  },
  { 
    date: 21, 
    type: "followup", 
    label: "Contract follow-up", 
    client: "James Wilson",
    company: "FutureWorks LLC",
    time: "10:30 AM",
    count: 1 
  },
  { 
    date: 22, 
    type: "call", 
    label: "Closing call", 
    client: "Maria Garcia",
    company: "Accelerate Partners",
    time: "1:00 PM",
    count: 1 
  },
  { 
    date: 28, 
    type: "meeting", 
    label: "Strategy meeting", 
    client: "Robert Taylor",
    company: "Transform Industries",
    time: "9:30 AM",
    count: 1 
  },
  { 
    date: 30, 
    type: "invoice", 
    label: "Payment follow-up", 
    client: "Anna Williams",
    company: "Innovation Labs",
    time: "2:00 PM",
    count: 1 
  },
]

const activityColors = {
  call: "text-green-400 bg-green-500/10 border-green-500/20",
  meeting: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  invoice: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  followup: "text-purple-400 bg-purple-500/10 border-purple-500/20"
}

const activityIcons = {
  call: "📞",
  meeting: "🤝", 
  invoice: "💰",
  followup: "📋"
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function Page() {
  const [currentDate, setCurrentDate] = useState(new Date()) // Today's date
  const [selectedDate, setSelectedDate] = useState<Date | null>(null) // Selected date state
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
  
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const today = new Date()
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear()
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7  // Convert Sunday=0 to Monday=0
  const daysInMonth = lastDayOfMonth.getDate()
  
  // Get previous month's last days
  const prevMonth = new Date(currentYear, currentMonth, 0)
  const prevMonthDays = prevMonth.getDate()
  
  // Create calendar grid
  const calendarDays = []
  
  // Previous month days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    calendarDays.push({
      date: prevMonthDays - i,
      isCurrentMonth: false,
      isPrevMonth: true
    })
  }
  
  // Current month days
  for (let date = 1; date <= daysInMonth; date++) {
    calendarDays.push({
      date,
      isCurrentMonth: true,
      isPrevMonth: false
    })
  }
  
  // Next month days
  const remainingCells = 42 - calendarDays.length // 6 weeks * 7 days
  for (let date = 1; date <= remainingCells; date++) {
    calendarDays.push({
      date,
      isCurrentMonth: false,
      isPrevMonth: false
    })
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1)
    } else {
      newDate.setMonth(currentMonth + 1)
    }
    setCurrentDate(newDate)
  }
  
  const getActivitiesForDate = (date: number) => {
    return businessData.filter(activity => activity.date === date)
  }

  const handleDateClick = (date: number, isCurrentMonth: boolean) => {
    if (isCurrentMonth) {
      const newSelectedDate = new Date(currentYear, currentMonth, date)
      setSelectedDate(newSelectedDate)
    }
  }

  return <>
      {/* Enhanced Header */}
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
              <h1 className="text-base font-medium">Calendar</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9 w-64"
                />
              </div>
              
              {/* Filter */}
              <Button variant="outline" size="sm">
                <FilterIcon className="h-4 w-4" />
                Filter
              </Button>
              
              {/* Sort */}
              <Button variant="outline" size="sm">
                <ArrowUpDownIcon className="h-4 w-4" />
                Sort
              </Button>
              
              {/* Export CSV */}
              <Button variant="outline" size="sm">
                <DownloadIcon className="h-4 w-4" />
                Export CSV
              </Button>
              
              {/* Add new */}
              <Button size="sm">
                <PlusIcon className="h-4 w-4" />
                Add new
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content - Uses remaining height after header */}
        <div 
          className="flex flex-col px-4 lg:px-6 py-3 gap-3"
          style={{ height: "calc(100vh - var(--header-height) - 16px)" }}
        >
          {/* Calendar Controls */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    Today, {currentDate.getDate()} {monthNames[currentMonth]} {currentYear}
                  </h2>
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-md">
                <Button 
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="rounded-r-none"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Grid - Takes remaining space */}
          <div className="bg-card rounded-xl border shadow-sm flex-1 flex flex-col overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b bg-muted/50 shrink-0">
              {dayNames.map((day) => (
                <div key={day} className="p-3 text-sm font-medium text-muted-foreground text-center">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 p-1 bg-muted/20 flex-1">
              {calendarDays.map((day, index) => {
                const activities = day.isCurrentMonth ? getActivitiesForDate(day.date) : []
                const isToday = day.isCurrentMonth && isCurrentMonth && day.date === today.getDate()
                const isSelected = selectedDate && day.isCurrentMonth && 
                  day.date === selectedDate.getDate() && 
                  currentMonth === selectedDate.getMonth() && 
                  currentYear === selectedDate.getFullYear()
                
                // Only highlight selected date, or fall back to today/first of month if nothing selected
                const isHighlighted = isSelected || 
                  (!selectedDate && day.isCurrentMonth && (!isCurrentMonth && day.date === 1 || isToday))
                
                return (
                  <div 
                    key={index} 
                    onClick={() => handleDateClick(day.date, day.isCurrentMonth)}
                    className={`p-2 rounded-lg bg-card border transition-colors flex flex-col cursor-pointer ${
                      !day.isCurrentMonth 
                        ? 'opacity-50 text-muted-foreground bg-muted/30' 
                        : isHighlighted 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 shrink-0 ${
                      isHighlighted ? 'text-primary font-semibold' : ''
                    }`}>
                      {day.date}
                    </div>
                    
                    {/* Business activity indicators */}
                    <div className="space-y-1 flex-1 overflow-hidden">
                      {activities.map((activity, activityIndex) => (
                        <div 
                          key={activityIndex}
                          className={`p-1.5 rounded-md border text-xs ${
                            activityColors[activity.type as keyof typeof activityColors]
                          }`}
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <div className="flex size-4 items-center justify-center rounded-full bg-current/10">
                              <UserIcon className="size-2.5 text-current" />
                            </div>
                            <span className="font-medium truncate text-[10px]">{activity.client}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] opacity-80">
                            <span className="text-[8px]">{activityIcons[activity.type as keyof typeof activityIcons]}</span>
                            <span className="truncate">{activity.label}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] opacity-70">
                            <ClockIcon className="size-2.5" />
                            <span className="truncate">{activity.time}</span>
                          </div>
                          <div className="text-[9px] opacity-60 truncate">
                            {activity.company}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
  </>
}