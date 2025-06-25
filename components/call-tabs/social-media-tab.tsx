'use client'

import { Card } from "@/components/ui/card"
import { FaFacebook, FaInstagram, FaGoogle } from "react-icons/fa"
import { Lead } from "./types"

interface SocialMediaTabProps {
  currentLead: Lead
  isTransitioning: boolean
  animateSocial: boolean
}

export function SocialMediaTab({ currentLead, isTransitioning, animateSocial }: SocialMediaTabProps) {
  return (
    <div className={`h-full flex gap-4 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
      <Card className={`flex-1 p-4 overflow-auto transition-all duration-700 ease-out ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className={`flex items-center gap-2 mb-4 transition-all duration-500 ease-out ${animateSocial ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
          <FaFacebook className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-white">Facebook</h3>
        </div>
        <div className="space-y-3">
          <div className={`transition-all duration-600 ease-out delay-200 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="text-lg text-white font-bold">{currentLead.facebook.name}</div>
            <div className="text-sm text-blue-400">{currentLead.facebook.url}</div>
          </div>
          <div className={`space-y-2 transition-all duration-600 ease-out delay-400 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-400">Followers</div>
              <div className="text-lg font-bold text-white">{currentLead.facebook.followers.toLocaleString()}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-400">Last Post</div>
              <div className="text-lg font-bold text-white">{currentLead.facebook.lastPost}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-400">Running Ads</div>
              <div className={`text-lg font-bold ${currentLead.facebook.runningAds ? 'text-green-400' : 'text-red-400'}`}>
                {currentLead.facebook.runningAds ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
          <div className={`space-y-2 transition-all duration-700 ease-out delay-600 ${animateSocial ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="h-64">
              <img src={currentLead.facebook.images[0]} alt="Facebook post" className="w-full h-full object-cover rounded" />
            </div>
            <div className="flex gap-2 h-26">
              <img src={currentLead.facebook.images[1]} alt="Facebook post" className="flex-1 object-cover rounded" />
              <img src={currentLead.facebook.images[2]} alt="Facebook post" className="flex-1 object-cover rounded" />
            </div>
          </div>
        </div>
      </Card>
      <Card className={`flex-1 p-4 overflow-auto transition-all duration-700 ease-out delay-100 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className={`flex items-center gap-2 mb-4 transition-all duration-500 ease-out delay-100 ${animateSocial ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
          <FaInstagram className="w-6 h-6 text-pink-500" />
          <h3 className="text-lg font-semibold text-white">Instagram</h3>
        </div>
        {currentLead.instagram ? (
          <div className="space-y-3">
            <div className={`transition-all duration-600 ease-out delay-300 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="text-lg text-white font-bold">{currentLead.instagram.name}</div>
              <div className="text-sm text-pink-400">{currentLead.instagram.handle}</div>
            </div>
            <div className={`space-y-2 transition-all duration-600 ease-out delay-500 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400">Followers</div>
                <div className="text-lg font-bold text-white">{currentLead.instagram.followers.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400">Last Post</div>
                <div className="text-lg font-bold text-white">{currentLead.instagram.lastPost}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400">Running Ads</div>
                <div className={`text-lg font-bold ${currentLead.instagram.runningAds ? 'text-green-400' : 'text-red-400'}`}>
                  {currentLead.instagram.runningAds ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
            <div className={`space-y-2 transition-all duration-700 ease-out delay-700 ${animateSocial ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="h-64">
                <img src={currentLead.instagram.images[0]} alt="Instagram post" className="w-full h-full object-cover rounded" />
              </div>
              <div className="flex gap-2 h-32">
                <img src={currentLead.instagram.images[1]} alt="Instagram post" className="flex-1 object-cover rounded" />
                <img src={currentLead.instagram.images[2]} alt="Instagram post" className="flex-1 object-cover rounded" />
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex items-center justify-center h-full transition-all duration-600 ease-out delay-300 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">No Instagram Page</div>
              <div className="text-gray-500 text-sm">This business doesn't have an Instagram presence</div>
            </div>
          </div>
        )}
      </Card>
      <Card className={`flex-1 p-4 overflow-auto transition-all duration-700 ease-out delay-200 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className={`flex items-center gap-2 mb-4 transition-all duration-500 ease-out delay-200 ${animateSocial ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
          <FaGoogle className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-white">Google</h3>
        </div>
        <div className="space-y-3">
          <div className={`transition-all duration-600 ease-out delay-400 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="text-lg text-white font-bold">{currentLead.google.name}</div>
            <div className="text-sm text-blue-400">{currentLead.google.url}</div>
          </div>
          <div className={`space-y-2 transition-all duration-600 ease-out delay-600 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-400">Last Post</div>
              <div className="text-lg font-bold text-white">{currentLead.google.lastPost}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-400">Running Ads</div>
              <div className={`text-lg font-bold ${currentLead.google.runningAds ? 'text-green-400' : 'text-red-400'}`}>
                {currentLead.google.runningAds ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
          <div className={`space-y-2 transition-all duration-700 ease-out delay-800 ${animateSocial ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="h-64">
              <img src={currentLead.google.images[0]} alt="Google Business post" className="w-full h-full object-cover rounded" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 