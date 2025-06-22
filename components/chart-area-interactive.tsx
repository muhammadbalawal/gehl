"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "Interactive analytics charts"

// Revenue data
const revenueData = [
  { date: "2024-04-01", revenue: 8500 },
  { date: "2024-04-02", revenue: 9200 },
  { date: "2024-04-03", revenue: 7800 },
  { date: "2024-04-04", revenue: 11200 },
  { date: "2024-04-05", revenue: 10500 },
  { date: "2024-04-06", revenue: 12800 },
  { date: "2024-04-07", revenue: 9600 },
  { date: "2024-04-08", revenue: 13200 },
  { date: "2024-04-09", revenue: 8900 },
  { date: "2024-04-10", revenue: 10800 },
  { date: "2024-04-11", revenue: 14500 },
  { date: "2024-04-12", revenue: 11900 },
  { date: "2024-04-13", revenue: 15200 },
  { date: "2024-04-14", revenue: 10300 },
  { date: "2024-04-15", revenue: 9800 },
  { date: "2024-04-16", revenue: 11600 },
  { date: "2024-04-17", revenue: 16800 },
  { date: "2024-04-18", revenue: 14200 },
  { date: "2024-04-19", revenue: 12100 },
  { date: "2024-04-20", revenue: 9500 },
  { date: "2024-04-21", revenue: 10900 },
  { date: "2024-04-22", revenue: 11800 },
  { date: "2024-04-23", revenue: 13400 },
  { date: "2024-04-24", revenue: 15600 },
  { date: "2024-04-25", revenue: 12700 },
  { date: "2024-04-26", revenue: 8800 },
  { date: "2024-04-27", revenue: 17200 },
  { date: "2024-04-28", revenue: 11300 },
  { date: "2024-04-29", revenue: 14800 },
  { date: "2024-04-30", revenue: 16900 },
]

// Calls data
const callsData = [
  { date: "2024-04-01", calls: 45 },
  { date: "2024-04-02", calls: 52 },
  { date: "2024-04-03", calls: 38 },
  { date: "2024-04-04", calls: 61 },
  { date: "2024-04-05", calls: 58 },
  { date: "2024-04-06", calls: 67 },
  { date: "2024-04-07", calls: 42 },
  { date: "2024-04-08", calls: 73 },
  { date: "2024-04-09", calls: 35 },
  { date: "2024-04-10", calls: 56 },
  { date: "2024-04-11", calls: 69 },
  { date: "2024-04-12", calls: 48 },
  { date: "2024-04-13", calls: 75 },
  { date: "2024-04-14", calls: 44 },
  { date: "2024-04-15", calls: 39 },
  { date: "2024-04-16", calls: 51 },
  { date: "2024-04-17", calls: 82 },
  { date: "2024-04-18", calls: 66 },
  { date: "2024-04-19", calls: 53 },
  { date: "2024-04-20", calls: 37 },
  { date: "2024-04-21", calls: 49 },
  { date: "2024-04-22", calls: 55 },
  { date: "2024-04-23", calls: 63 },
  { date: "2024-04-24", calls: 71 },
  { date: "2024-04-25", calls: 57 },
  { date: "2024-04-26", calls: 33 },
  { date: "2024-04-27", calls: 78 },
  { date: "2024-04-28", calls: 46 },
  { date: "2024-04-29", calls: 68 },
  { date: "2024-04-30", calls: 79 },
]

// Meetings data
const meetingsData = [
  { date: "2024-04-01", meetings: 8 },
  { date: "2024-04-02", meetings: 12 },
  { date: "2024-04-03", meetings: 6 },
  { date: "2024-04-04", meetings: 15 },
  { date: "2024-04-05", meetings: 13 },
  { date: "2024-04-06", meetings: 18 },
  { date: "2024-04-07", meetings: 9 },
  { date: "2024-04-08", meetings: 21 },
  { date: "2024-04-09", meetings: 5 },
  { date: "2024-04-10", meetings: 14 },
  { date: "2024-04-11", meetings: 19 },
  { date: "2024-04-12", meetings: 11 },
  { date: "2024-04-13", meetings: 22 },
  { date: "2024-04-14", meetings: 7 },
  { date: "2024-04-15", meetings: 10 },
  { date: "2024-04-16", meetings: 16 },
  { date: "2024-04-17", meetings: 24 },
  { date: "2024-04-18", meetings: 17 },
  { date: "2024-04-19", meetings: 13 },
  { date: "2024-04-20", meetings: 8 },
  { date: "2024-04-21", meetings: 12 },
  { date: "2024-04-22", meetings: 15 },
  { date: "2024-04-23", meetings: 18 },
  { date: "2024-04-24", meetings: 20 },
  { date: "2024-04-25", meetings: 14 },
  { date: "2024-04-26", meetings: 6 },
  { date: "2024-04-27", meetings: 23 },
  { date: "2024-04-28", meetings: 11 },
  { date: "2024-04-29", meetings: 19 },
  { date: "2024-04-30", meetings: 25 },
]

// Deals data
const dealsData = [
  { date: "2024-04-01", deals: 2 },
  { date: "2024-04-02", deals: 3 },
  { date: "2024-04-03", deals: 1 },
  { date: "2024-04-04", deals: 4 },
  { date: "2024-04-05", deals: 3 },
  { date: "2024-04-06", deals: 5 },
  { date: "2024-04-07", deals: 2 },
  { date: "2024-04-08", deals: 6 },
  { date: "2024-04-09", deals: 1 },
  { date: "2024-04-10", deals: 3 },
  { date: "2024-04-11", deals: 5 },
  { date: "2024-04-12", deals: 2 },
  { date: "2024-04-13", deals: 6 },
  { date: "2024-04-14", deals: 1 },
  { date: "2024-04-15", deals: 2 },
  { date: "2024-04-16", deals: 4 },
  { date: "2024-04-17", deals: 7 },
  { date: "2024-04-18", deals: 5 },
  { date: "2024-04-19", deals: 3 },
  { date: "2024-04-20", deals: 2 },
  { date: "2024-04-21", deals: 3 },
  { date: "2024-04-22", deals: 4 },
  { date: "2024-04-23", deals: 5 },
  { date: "2024-04-24", deals: 6 },
  { date: "2024-04-25", deals: 4 },
  { date: "2024-04-26", deals: 1 },
  { date: "2024-04-27", deals: 7 },
  { date: "2024-04-28", deals: 3 },
  { date: "2024-04-29", deals: 5 },
  { date: "2024-04-30", deals: 8 },
]

const chartConfigs = {
  revenue: {
    revenue: {
      label: "Revenue",
      color: "var(--primary)",
    },
  } satisfies ChartConfig,
  calls: {
    calls: {
      label: "Calls",
      color: "var(--primary)",
    },
  } satisfies ChartConfig,
  meetings: {
    meetings: {
      label: "Meetings",
      color: "var(--primary)",
    },
  } satisfies ChartConfig,
  deals: {
    deals: {
      label: "Deals",
      color: "var(--primary)",
    },
  } satisfies ChartConfig,
}

function ChartTab({
  title,
  description,
  data,
  dataKey,
  config,
  formatValue,
}: {
  title: string
  description: string
  data: any[]
  dataKey: string
  config: ChartConfig
  formatValue?: (value: number) => string
}) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = data.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-04-30")
    let daysToSubtract = 30
    if (timeRange === "7d") {
      daysToSubtract = 7
    } else if (timeRange === "14d") {
      daysToSubtract = 14
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">{description}</span>
          <span className="@[540px]/card:hidden">{description.split(' ').slice(0, 3).join(' ')}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="14d">Last 14 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="14d" className="rounded-lg">
                Last 14 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={config}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id={`fill${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={`var(--color-${dataKey})`}
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor={`var(--color-${dataKey})`}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  formatter={(value) => formatValue ? formatValue(value as number) : value}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey={dataKey}
              type="natural"
              fill={`url(#fill${dataKey})`}
              stroke={`var(--color-${dataKey})`}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ChartAreaInteractive() {
  return (
    <Tabs
      defaultValue="revenue"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between">
        <Label htmlFor="chart-selector" className="sr-only">
          Chart
        </Label>
        <Select defaultValue="revenue">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="chart-selector"
          >
            <SelectValue placeholder="Select a chart" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="calls">Calls Made</SelectItem>
            <SelectItem value="meetings">Meetings Booked</SelectItem>
            <SelectItem value="deals">Deals Closed</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="hidden @4xl/main:flex">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="calls">Calls Made</TabsTrigger>
          <TabsTrigger value="meetings">Meetings Booked</TabsTrigger>
          <TabsTrigger value="deals">Deals Closed</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent
        value="revenue"
        className="flex flex-col"
      >
        <ChartTab
          title="Revenue Analytics"
          description="Daily revenue tracking over time"
          data={revenueData}
          dataKey="revenue"
          config={chartConfigs.revenue}
          formatValue={(value) => `$${value.toLocaleString()}`}
        />
      </TabsContent>
      <TabsContent
        value="calls"
        className="flex flex-col"
      >
        <ChartTab
          title="Call Activity"
          description="Number of calls made daily"
          data={callsData}
          dataKey="calls"
          config={chartConfigs.calls}
        />
      </TabsContent>
      <TabsContent
        value="meetings"
        className="flex flex-col"
      >
        <ChartTab
          title="Meeting Performance"
          description="Meetings booked per day"
          data={meetingsData}
          dataKey="meetings"
          config={chartConfigs.meetings}
        />
      </TabsContent>
      <TabsContent
        value="deals"
        className="flex flex-col"
      >
        <ChartTab
          title="Deal Closure"
          description="Deals closed daily"
          data={dealsData}
          dataKey="deals"
          config={chartConfigs.deals}
        />
      </TabsContent>
    </Tabs>
  )
}
