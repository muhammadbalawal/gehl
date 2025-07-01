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
import { supabase } from "@/lib/supabaseClient"

export default function ImportPage() {
  const [campaignName, setCampaignName] = useState("")
  const router = useRouter()

  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignName.trim()) return

    setIsCreating(true)
    setError("")

    try {
      // Get the authenticated user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        throw new Error('You must be logged in to create a campaign')
      }
      const user_id = session.user.id

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: campaignName.trim(),
          user_id: user_id
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create campaign')
      }

      // Store campaign data and navigate to method selection
      const campaign = result.campaign
      router.push(`/app/leads/import/method?campaign=${encodeURIComponent(campaignName)}&campaignId=${campaign.id}`)
    } catch (err) {
      console.error('Error creating campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setIsCreating(false)
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
                          disabled={isCreating}
                        />
                        {error && (
                          <p className="text-sm text-red-600 mt-2">{error}</p>
                        )}
                      </div>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full"
                        disabled={!campaignName.trim() || isCreating}
                      >
                        {isCreating ? 'Creating...' : 'Continue'}
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