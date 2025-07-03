'use client'

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lead } from "./types"

interface OverviewTabProps {
  currentLead: Lead
  isTransitioning: boolean
  animateOverview: boolean
  reviewsCardHeight: number
}

export function OverviewTab({ currentLead, isTransitioning, animateOverview, reviewsCardHeight }: OverviewTabProps) {
  return (
    <div className={`h-full flex gap-4 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
      {/* Left Card: General Information */}
      <div className="w-1/2 h-full">
        <Card className={`h-full p-6 overflow-auto transition-all duration-700 ease-out ${animateOverview ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <img src={currentLead.logo} alt="Dentist Logo" className="w-28 h-28 rounded-full object-cover border-4 border-gray-600 shadow-lg" />
              <div className="absolute -bottom-2 -right-2 bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{currentLead.shortName}</h3>
            <p className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">{currentLead.category}</p>
            <div className="flex items-center mt-3">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i}>{i < Math.floor(currentLead.rating) ? '★' : '☆'}</span>
                ))}
              </div>
              <span className="text-gray-400 text-sm ml-2">({currentLead.rating}/5)</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white">📝</span>
              </div>
              <span className="w-1/3 text-gray-400 text-sm">Reviews</span>
              <span className="text-white font-semibold">{currentLead.totalReviews.toLocaleString()}</span>
            </div>
            <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white">🕒</span>
              </div>
              <span className="w-1/3 text-gray-400 text-sm">Hours</span>
              <span className="text-white font-semibold">{currentLead.hours}</span>
            </div>
            <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white">📞</span>
              </div>
              <span className="w-1/3 text-gray-400 text-sm">Phone</span>
              <span className="text-white font-semibold">{currentLead.phone}</span>
            </div>
            <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white">📧</span>
              </div>
              <span className="w-1/3 text-gray-400 text-sm">Email</span>
              <span className="text-white font-semibold text-sm">{currentLead.email}</span>
            </div>
            <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white">📍</span>
              </div>
              <span className="w-1/3 text-gray-400 text-sm">Address</span>
              <span className="text-white font-semibold text-sm">{currentLead.address}</span>
            </div>
            <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white">🌐</span>
              </div>
              <span className="w-1/3 text-gray-400 text-sm">Website</span>
              <a href="#" className="text-white hover:text-gray-300 transition-colors font-semibold">{currentLead.website}</a>
            </div>
            <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white">📸</span>
              </div>
              <span className="w-1/3 text-gray-400 text-sm">Photos</span>
              <span className="text-white font-semibold">{currentLead.photos}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column */}
      <div className="w-1/2 h-full flex flex-col gap-4">
        {/* Top Right Card: Recent Reviews */}
        <div>
          <Card className={`p-6 transition-all duration-700 ease-out delay-200 ${animateOverview ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ height: `${reviewsCardHeight}px` }}>
            <h3 className="text-lg font-semibold mb-4 text-white">Recent Reviews</h3>
            <ScrollArea className="h-[calc(100%-3rem)]">
              <div className="space-y-4 pr-4">
                {currentLead.gmbData?.recent_reviews && currentLead.gmbData.recent_reviews.length > 0 ? (
                  // Show real GMB reviews
                  currentLead.gmbData.recent_reviews.map((review: any, index: number) => (
                    <div key={index} className="border-b border-gray-700 pb-3">
                      <div className="flex items-center mb-1">
                        <span className="font-semibold text-white">{review.author || 'Anonymous'}</span>
                        <div className="flex text-yellow-400 ml-3">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i}>{i < (review.rating || 0) ? '★' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">"{review.text || 'No review text available.'}"</p>
                      {review.date && (
                        <p className="text-xs text-gray-500 mt-1">{review.date}</p>
                      )}
                    </div>
                  ))
                ) : (
                  // Fallback to sample reviews if no GMB data
                  <>
                    <div className="border-b border-gray-700 pb-3">
                      <div className="flex items-center mb-1">
                        <span className="font-semibold text-white">Sample Review</span>
                        <div className="flex text-yellow-400 ml-3">★★★★☆</div>
                      </div>
                      <p className="text-sm text-gray-300">"No recent reviews available from Google My Business data yet."</p>
                    </div>
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">GMB reviews will appear here once scraped</p>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Bottom Right Card: Key Metrics */}
        <div className="h-[30%]">
          <Card className={`h-full p-4 transition-all duration-700 ease-out delay-400 ${animateOverview ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h3 className="text-lg font-semibold mb-3 text-white text-center">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-2">
                <span className="text-2xl font-bold text-white">{currentLead.monthlyVisitors.toLocaleString()}</span>
                <span className="text-xs text-gray-400 text-center">Monthly Visitors</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-2">
                <span className="text-2xl font-bold text-white">{currentLead.rating}</span>
                <span className="text-xs text-gray-400 text-center">Avg Rating</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-2">
                <span className="text-2xl font-bold text-white">{currentLead.totalReviews.toLocaleString()}</span>
                <span className="text-xs text-gray-400 text-center">Total Reviews</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-2">
                <span className="text-2xl font-bold text-white">{currentLead.photos}</span>
                <span className="text-xs text-gray-400 text-center">Photos</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 