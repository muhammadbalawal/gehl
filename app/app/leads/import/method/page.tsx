"use client"

import { Suspense, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, FileText, Search, Mail, ChevronRight } from "lucide-react"
import { BlurFade } from "@/components/magicui/blur-fade"

function ImportMethodContent() {
  const searchParams = useSearchParams()
  const campaignName = searchParams.get('campaign') || 'New Campaign'
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  // Google Sheets icon component
  const GoogleSheetsIcon = () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#0F9D58"/>
      <rect x="6" y="7" width="3" height="10" fill="white"/>
      <rect x="10" y="7" width="3" height="10" fill="white"/>
      <rect x="14" y="7" width="4" height="10" fill="white"/>
      <rect x="6" y="9" width="12" height="1" fill="#0F9D58"/>
      <rect x="6" y="11" width="12" height="1" fill="#0F9D58"/>
      <rect x="6" y="13" width="12" height="1" fill="#0F9D58"/>
      <rect x="6" y="15" width="12" height="1" fill="#0F9D58"/>
    </svg>
  )

  const importMethods = [
    {
      id: 'csv',
      title: 'Upload CSV',
      description: 'Import leads from a CSV file',
      icon: FileText,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      href: `/app/leads/import/csv?campaign=${encodeURIComponent(campaignName)}`
    },
    {
      id: 'finder',
      title: 'Use Lead Finder',
      description: 'Find leads using our search tool',
      icon: Search,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      href: `/app/leads/import/finder?campaign=${encodeURIComponent(campaignName)}`
    },
    {
      id: 'manual',
      title: 'Enter Emails Manually',
      description: 'Add leads by entering email addresses',
      icon: Mail,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      href: `/app/leads/import/manual?campaign=${encodeURIComponent(campaignName)}`
    },
    {
      id: 'sheets',
      title: 'Use Google Sheets',
      description: 'Import from Google Sheets',
      icon: GoogleSheetsIcon,
      iconColor: '',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      href: `/app/leads/import/sheets?campaign=${encodeURIComponent(campaignName)}`
    }
  ]

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
  }

  const handleContinue = () => {
    if (selectedMethod) {
      const selectedMethodData = importMethods.find(m => m.id === selectedMethod)
      if (selectedMethodData) {
        window.location.href = selectedMethodData.href
      }
    }
  }

  return <>
      <SiteHeader title="Import Leads"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              
              {/* Back button and campaign info */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/app/leads/import">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Link>
                </Button>
                <div className="text-sm text-muted-foreground">
                  Campaign: <span className="font-medium text-foreground">{campaignName}</span>
                </div>
              </div>

              {/* Page title */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold">Choose Import Method</h1>
                <p className="text-muted-foreground">
                  Select how you'd like to import your leads for "{campaignName}"
                </p>
              </div>

              {/* Import method cards */}
              <div className="flex flex-1 items-center justify-center min-h-[50vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {importMethods.map((method, index) => {
                    const Icon = method.icon
                    const isSelected = selectedMethod === method.id
                    return (
                      <BlurFade 
                        key={method.id}
                        delay={0.10 + index * 0.05} 
                        inView={true}
                        direction="up"
                      >
                        <Card 
                          className={`h-full hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer group ${
                            isSelected 
                              ? 'ring-2 ring-primary shadow-md bg-primary/5' 
                              : 'hover:bg-accent/50'
                          }`}
                          onClick={() => handleMethodSelect(method.id)}
                        >
                          <CardContent className="p-6 h-full">
                            <div className="flex items-center space-x-4 h-full">
                              <div className={`p-3 rounded-lg ${method.bgColor} flex-shrink-0`}>
                                <Icon className={`h-6 w-6 ${method.iconColor}`} />
                              </div>
                              <div className="flex-1 min-h-[60px] flex flex-col justify-center">
                                <h3 className={`font-semibold text-lg transition-colors ${
                                  isSelected ? 'text-primary' : 'group-hover:text-primary'
                                }`}>
                                  {method.title}
                                </h3>
                                <p className="text-base text-muted-foreground mt-1">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </BlurFade>
                    )
                  })}
                </div>
              </div>

              {/* Continue button */}
              {selectedMethod && (
                <div className="flex justify-center">
                  <Button 
                    size="lg" 
                    onClick={handleContinue}
                    className="min-w-32"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
  </>
}

export default function ImportMethodPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImportMethodContent />
    </Suspense>
  )
} 