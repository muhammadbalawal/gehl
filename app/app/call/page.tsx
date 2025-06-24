import AgentCall from "@/components/agent-call"
import { SiteHeader } from "@/components/site-header";


export default function DashboardCallPage() {
  return <>
      <SiteHeader title="Call" />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Call</h1>
        <AgentCall />
      </div>
    </>
}