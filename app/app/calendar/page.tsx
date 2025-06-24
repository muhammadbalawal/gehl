import { ScheduledCallsTable } from "@/components/scheduled-calls-table";

export default function DashboardCalendarPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <ScheduledCallsTable />
    </div>
  );
}