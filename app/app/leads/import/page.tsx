"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ImportPage() {
  const [campaignName, setCampaignName] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (campaignName.trim()) {
      // Store campaign name and navigate to method selection
      // In a real app, you'd store this in state/context/localStorage
      router.push(`/app/leads/import/method?campaign=${encodeURIComponent(campaignName)}`)
    }
  }

  return <>
      <SiteHeader title="Import Leads"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              
              {/* Back button */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/app/leads">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Leads
                  </Link>
                </Button>
              </div>

              {/* Main form */}
              <div className="flex flex-1 items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create Campaign</CardTitle>
                    <CardDescription>
                      Give your lead import campaign a name to help you track and organize your leads.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="campaign-name" className="text-base">
                          Campaign Name
                        </Label>
                        <Input
                          id="campaign-name"
                          type="text"
                          placeholder="e.g., Toronto Dentists Q1 2024"
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                          className="h-12 text-base"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full"
                        disabled={!campaignName.trim()}
                      >
                        Continue
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
  </>
} 