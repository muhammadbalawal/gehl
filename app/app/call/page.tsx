import AgentCall from "@/components/agent-call"
import SEORankingDashboard from "@/components/SEORankingDashboard"
import { SiteHeader } from "@/components/site-header"

export default function DashboardCallPage() {
  return <>
    
    <SiteHeader title="Call" />
    <div className="p-6">
      <div className="flex gap-6">

        <div className="w-2/3">
          <SEORankingDashboard />
        </div>

        <div className="w-1/3">
          <AgentCall />
        </div>
      </div>
    </div>
  </>
}