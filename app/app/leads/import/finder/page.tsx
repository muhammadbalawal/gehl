"use client"

import { Suspense } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, Construction } from "lucide-react"

function LeadFinderContent() {
  const searchParams = useSearchParams()
  const campaignName = searchParams.get('campaign') || 'New Campaign'

  return <>
              <SiteHeader title="Import Leads"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              
              {/* Back button and campaign info */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/app/leads/import/method">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Choose another method
                  </Link>
                </Button>
                <div className="text-sm text-muted-foreground">
                  Campaign: <span className="font-medium text-foreground">{campaignName}</span>
                </div>
              </div>

              {/* Coming soon message */}
              <div className="flex flex-1 items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md">
                  <CardContent className="p-12 text-center">
                    <div className="space-y-6">
                      <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                        <Construction className="h-8 w-8 text-orange-600" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold">Coming Soon</h2>
                        <p className="text-muted-foreground">
                          Manual Email Entry is not available yet. Please choose a different import method for now.
                        </p>
                      </div>
                      <Button asChild>
                        <Link href="/app/leads/import/method">
                          Choose Another Method
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
  </>
}

export default function LeadFinderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LeadFinderContent />
    </Suspense>
  )
} 