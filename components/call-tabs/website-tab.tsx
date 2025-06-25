'use client'

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import dynamic from "next/dynamic"

// Dynamic import for GaugeComponent to avoid SSR issues
const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false })

import { Lead } from "./types"

interface WebsiteTabProps {
  currentLead: Lead
  isTransitioning: boolean
  animateWebsite: boolean
  websiteCardHeight: number
}

export function WebsiteTab({ currentLead, isTransitioning, animateWebsite, websiteCardHeight }: WebsiteTabProps) {
  return (
    <div className={`h-full flex gap-4 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
      <div className="w-[40%] flex flex-col gap-4">
        <Card className={`h-[40%] p-4 overflow-auto flex flex-col transition-all duration-700 ease-out ${animateWebsite ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h3 className="text-lg font-semibold mb-2 text-white">Page Speed</h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-24">
              <GaugeComponent
                type="semicircle"
                value={62}
                minValue={0}
                maxValue={100}
                marginInPercent={{ top: 0.05, bottom: 0.05, left: 0.15, right: 0.15 }}
                arc={{
                  width: 0.15,
                  padding: 0.005,
                  cornerRadius: 1,
                  subArcs: [
                    {
                      limit: 40,
                      color: '#ef4444',
                    },
                    {
                      limit: 70,
                      color: '#f59e0b',
                    },
                    {
                      color: '#22c55e',
                    }
                  ]
                }}
                pointer={{
                  type: "arrow",
                  color: '#ffffff',
                  length: 0.75,
                  width: 10,
                }}
                labels={{
                  valueLabel: { 
                    formatTextValue: () => '2.3s',
                    style: {fontSize: '32px', fill: '#ffffff', textShadow: 'none', fontWeight: 'bold'}
                  },
                  tickLabels: {
                    hideMinMax: true,
                    ticks: []
                  }
                }}
              />
            </div>
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-500">Technology:</span>
              <span className="font-medium text-white">WordPress</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-500">Mobile Friendly:</span>
              <span className="font-medium text-green-500">Yes</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">SSL Certificate:</span>
              <span className="font-medium text-green-500">Yes</span>
            </div>
          </div>
        </Card>
        <Card className={`h-[50%] p-4 overflow-auto transition-all duration-700 ease-out delay-200 ${animateWebsite ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className={`flex gap-4 mb-4 transition-all duration-600 ease-out delay-400 ${animateWebsite ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="flex-1 bg-red-900/20 border-2 border-red-500 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-400">12</div>
              <div className="text-xs text-red-300">Errors</div>
            </div>
            <div className="flex-1 bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">8</div>
              <div className="text-xs text-yellow-300">Warnings</div>
            </div>
            <div className="flex-1 bg-blue-900/20 border-2 border-blue-500 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">23</div>
              <div className="text-xs text-blue-300">Notices</div>
            </div>
          </div>
          <div className={`transition-all duration-600 ease-out delay-600 ${animateWebsite ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <h4 className="text-sm font-semibold text-white mb-2">Top Issues:</h4>
            <div className="space-y-1">
              <div className="flex justify-between items-center border-b border-gray-600 pb-1">
                <span className="text-xs text-gray-400 font-medium">Type of Issues</span>
                <span className="text-xs text-gray-400 font-medium">Number</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-gray-300">Incorrect pages found in sitemap.xml</span>
                <span className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded">errors</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-gray-300">Pages not found - 404</span>
                <span className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded">errors</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-gray-300">Duplicate content</span>
                <span className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">warns</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-gray-300">Missing title tags</span>
                <span className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded">errors</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-gray-300">Duplicate title tags</span>
                <span className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded">errors</span>
              </div>
            </div>
          </div>
        </Card>
        <Card className={`h-[10%] p-4 overflow-auto flex items-center justify-center transition-all duration-700 ease-out delay-400 ${animateWebsite ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className={`flex gap-6 text-center transition-all duration-600 ease-out delay-800 ${animateWebsite ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-400">Live Chat</span>
              <span className="text-red-400 text-sm font-medium">✗</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-400">Online Booking</span>
              <span className="text-green-400 text-sm font-medium">✓</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-400">Online Shop</span>
              <span className="text-red-400 text-sm font-medium">✗</span>
            </div>
          </div>
        </Card>
      </div>
      <div className="w-[60%]">
        <Card className={`p-4 transition-all duration-700 ease-out delay-600 ${animateWebsite ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ height: `${websiteCardHeight}px` }}>
          <ScrollArea className="h-full w-full">
            <img 
              src={currentLead.websiteImage} 
              alt="Dentist Website"
              className="w-full"
            />
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
} 