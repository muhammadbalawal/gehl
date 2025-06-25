'use client'

import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import dynamic from "next/dynamic"
import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Phone } from "lucide-react"
import { FaFacebook, FaInstagram, FaGoogle } from "react-icons/fa"
import { ChatTranscript } from "@/components/chat-transcript"
import mapboxgl from "mapbox-gl"
import 'mapbox-gl/dist/mapbox-gl.css'

// Dynamic import for GaugeComponent to avoid SSR issues
const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false })

// Set the access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

export default function DashboardCallPage() {
  const [callState, setCallState] = useState<"idle" | "in-call" | "post-call">("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [time, setTime] = useState(0)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapError, setMapError] = useState<string>('')
  const [activeTab, setActiveTab] = useState("lead-overview")
  
  // Trigger overview animations when tab becomes active
  useEffect(() => {
    if (activeTab === "lead-overview") {
      setAnimateOverview(false)
      setTimeout(() => {
        setAnimateOverview(true)
      }, 100)
    } else {
      setAnimateOverview(false)
    }
  }, [activeTab])
  
  // Trigger social media animations when tab becomes active
  useEffect(() => {
    if (activeTab === "social-media") {
      setAnimateSocial(false)
      setTimeout(() => {
        setAnimateSocial(true)
      }, 100)
    } else {
      setAnimateSocial(false)
    }
  }, [activeTab])
  
  // Trigger rank animations when local business tab becomes active
  useEffect(() => {
    if (activeTab === "local-business") {
      setAnimateRanks(false)
      setAnimateLocalBusiness(false)
      setTimeout(() => {
        setAnimateRanks(true)
        setAnimateLocalBusiness(true)
      }, 100)
    } else {
      setAnimateRanks(false)
      setAnimateLocalBusiness(false)
    }
  }, [activeTab])
  
  // Trigger website animations when website tab becomes active
  useEffect(() => {
    if (activeTab === "website") {
      setAnimateWebsite(false)
      setTimeout(() => {
        setAnimateWebsite(true)
      }, 100)
    } else {
      setAnimateWebsite(false)
    }
  }, [activeTab])
  const [gridData, setGridData] = useState<number[]>([])
  const [locationCardHeight, setLocationCardHeight] = useState(450)
  const [websiteCardHeight, setWebsiteCardHeight] = useState(600)
  const [reviewsCardHeight, setReviewsCardHeight] = useState(450)
  const [animateRanks, setAnimateRanks] = useState(false)
  const [animateSocial, setAnimateSocial] = useState(false)
  const [animateLocalBusiness, setAnimateLocalBusiness] = useState(false)
  const [animateWebsite, setAnimateWebsite] = useState(false)
  const [animateOverview, setAnimateOverview] = useState(false)

  useEffect(() => {
    const updateCardHeights = () => {
      // Calculate available viewport height minus header, title, tabs, and padding
      // Approximate calculation: 100vh - 220px (header + title + tabs + padding)
      const availableHeight = window.innerHeight - 220
      
      // Location card: 70% of available height
      const seventyPercent = Math.floor(availableHeight * 0.7)
      setLocationCardHeight(Math.max(350, seventyPercent)) // Minimum 350px
      
      // Website card: 100% of available height (full height)
      const hundredPercent = availableHeight
      setWebsiteCardHeight(Math.max(400, hundredPercent)) // Minimum 400px
      
      // Reviews card: 70% of available height (same as location card)
      setReviewsCardHeight(Math.max(350, seventyPercent)) // Minimum 350px
    }

    updateCardHeights()
    window.addEventListener('resize', updateCardHeights)
    
    return () => window.removeEventListener('resize', updateCardHeights)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (callState === "in-call") {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [callState])

  useEffect(() => {
    // Only initialize map when local business tab is active
    if (activeTab !== "local-business") return
    
    // Check if access token is available
    if (!mapboxgl.accessToken) {
      setMapError('Mapbox access token not found. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file.')
      return
    }

    // Don't initialize map if it already exists
    if (map.current) return

    if (!mapContainer.current) {
      setMapError('Map container not found')
      return
    }

    console.log('Initializing Mapbox with token:', mapboxgl.accessToken ? mapboxgl.accessToken.substring(0, 20) + '...' : 'No token')

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-73.5673, 45.5017], // Montreal coordinates (Dr. Biskup's area)
        zoom: 13,
      })

      map.current.on('load', () => {
        console.log('Map loaded successfully')
        setMapError('')
        
        // Add the 5x5 grid of points
        if (map.current) {
          addGridLayer(map.current)
        }
      })

      map.current.on('error', (e) => {
        console.error('Map error:', e)
        setMapError(`Map error: ${e.error?.message || 'Unknown error'}`)
      })

    } catch (error) {
      console.error('Error initializing map:', error)
      setMapError(`Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [activeTab])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  const handleCallNow = () => {
    setCallState("in-call")
  }

  const handleHangUp = () => {
    setCallState("post-call")
  }

  const handleNewCall = () => {
    setTime(0)
    setCallState("idle")
  }

  const addGridLayer = (mapInstance: mapboxgl.Map) => {
    if (!mapInstance) return

    const center = mapInstance.getCenter()
    const gridSize = 5
    const latitudeSpacing = 0.005
    const longitudeCorrection = 1 / Math.cos(center.lat * (Math.PI / 180))
    const longitudeSpacing = latitudeSpacing * longitudeCorrection
    const features: GeoJSON.Feature<GeoJSON.Point>[] = []
    const ranks: number[] = []

    const startLon = center.lng - (Math.floor(gridSize / 2) * longitudeSpacing)
    const startLat = center.lat + (Math.floor(gridSize / 2) * latitudeSpacing)

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const rank = Math.floor(Math.random() * 25) + 1
        ranks.push(rank)
        const longitude = startLon + j * longitudeSpacing
        const latitude = startLat - i * latitudeSpacing

        features.push({
          type: 'Feature',
          properties: { rank },
          geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        })
      }
    }

    setGridData(ranks)

    const geoJsonData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: 'FeatureCollection',
      features,
    }

    if (mapInstance.getSource('grid-source')) {
      (mapInstance.getSource('grid-source') as mapboxgl.GeoJSONSource).setData(geoJsonData)
    } else {
      mapInstance.addSource('grid-source', {
        type: 'geojson',
        data: geoJsonData,
      })
    }

    if (!mapInstance.getLayer('grid-circles')) {
      mapInstance.addLayer({
        id: 'grid-circles',
        type: 'circle',
        source: 'grid-source',
        paint: {
          'circle-radius': 20,
          'circle-color': [
            'case',
            ['>', ['get', 'rank'], 20], '#e0e0e0',
            ['>=', ['get', 'rank'], 13], '#ef4444',
            ['>=', ['get', 'rank'], 6], '#f59e0b',
            '#22c55e',
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': [
            'case',
            ['>', ['get', 'rank'], 20], '#bdbdbd',
            ['>=', ['get', 'rank'], 13], '#b91c1c',
            ['>=', ['get', 'rank'], 6], '#b45309',
            '#15803d',
          ],
        },
      })
    }
    
    if (!mapInstance.getLayer('grid-labels')) {
      mapInstance.addLayer({
        id: 'grid-labels',
        type: 'symbol',
        source: 'grid-source',
        layout: {
          'text-field': [
            'case',
            ['>', ['get', 'rank'], 20], '20+',
            ['to-string', ['get', 'rank']],
          ],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 16,
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': '#000000',
        },
      })
    }
  }

  const calculateAverageRank = () => {
    if (gridData.length === 0) return 0
    const sum = gridData.reduce((acc, rank) => acc + rank, 0)
    return sum / gridData.length
  }

  const calculateRankDecomposition = () => {
    if (gridData.length === 0) return { good: 0, average: 0, poor: 0, outTop20: 0 }
    
    const total = gridData.length
    const good = gridData.filter(rank => rank <= 5).length
    const average = gridData.filter(rank => rank >= 6 && rank <= 12).length
    const poor = gridData.filter(rank => rank >= 13 && rank <= 20).length
    const outTop20 = gridData.filter(rank => rank > 20).length

    return {
      good: (good / total) * 100,
      average: (average / total) * 100,
      poor: (poor / total) * 100,
      outTop20: (outTop20 / total) * 100,
    }
  }

  return <>
    
    <SiteHeader title="Call" />
    <div className="flex flex-row gap-4 p-4 flex-1 min-h-0">
        <div className="w-[70%] flex flex-col">
          <h1 className="mb-4 text-2xl font-bold">Robert Biskup Dentiste West Island Dentist</h1>
          
          <Tabs defaultValue="lead-overview" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
            <TabsList className="w-fit mb-4">
              <TabsTrigger value="lead-overview">Overview</TabsTrigger>
              <TabsTrigger value="local-business">Local Business</TabsTrigger>
              <TabsTrigger value="social-media">Social Media</TabsTrigger>
              <TabsTrigger value="website">Website</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lead-overview" className="flex-1">
              <div className="h-full flex gap-4">
                {/* Left Card: General Information */}
                <div className="w-1/2 h-full">
                  <Card className={`h-full p-6 overflow-auto transition-all duration-700 ease-out ${animateOverview ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex flex-col items-center mb-8">
                      <div className="relative mb-4">
                        <img src="/dentist_logo.png" alt="Dentist Logo" className="w-28 h-28 rounded-full object-cover border-4 border-gray-600 shadow-lg" />
                        <div className="absolute -bottom-2 -right-2 bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">Robert Biskup Dentiste</h3>
                                              <p className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">Dental Clinic</p>
                      <div className="flex items-center mt-3">
                        <div className="flex text-yellow-400">★★★★☆</div>
                        <span className="text-gray-400 text-sm ml-2">(4.2/5)</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                                             <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                         <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                           <span className="text-white">📝</span>
                         </div>
                         <span className="w-1/3 text-gray-400 text-sm">Reviews</span>
                         <span className="text-white font-semibold">1,039</span>
                       </div>
                       <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                         <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                           <span className="text-white">🕒</span>
                         </div>
                         <span className="w-1/3 text-gray-400 text-sm">Hours</span>
                         <span className="text-white font-semibold">9:00 AM - 5:00 PM</span>
                       </div>
                       <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                         <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                           <span className="text-white">📞</span>
                         </div>
                         <span className="w-1/3 text-gray-400 text-sm">Phone</span>
                         <span className="text-white font-semibold">(514) 123-4567</span>
                       </div>
                       <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                         <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                           <span className="text-white">📧</span>
                         </div>
                         <span className="w-1/3 text-gray-400 text-sm">Email</span>
                         <span className="text-white font-semibold text-sm">contact@biskupdentiste.com</span>
                       </div>
                       <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                         <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                           <span className="text-white">📍</span>
                         </div>
                         <span className="w-1/3 text-gray-400 text-sm">Address</span>
                         <span className="text-white font-semibold text-sm">123 Cakewalk Avenue, Montreal, QC</span>
                       </div>
                       <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                         <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                           <span className="text-white">🌐</span>
                         </div>
                         <span className="w-1/3 text-gray-400 text-sm">Website</span>
                         <a href="#" className="text-white hover:text-gray-300 transition-colors font-semibold">biskupdentiste.com</a>
                       </div>
                        <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                         <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                           <span className="text-white">📸</span>
                         </div>
                         <span className="w-1/3 text-gray-400 text-sm">Photos</span>
                         <span className="text-white font-semibold">23</span>
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
                          <div className="border-b border-gray-700 pb-3">
                            <div className="flex items-center mb-1">
                              <span className="font-semibold text-white">Alice M.</span>
                              <div className="flex text-yellow-400 ml-3">★★★★★</div>
                            </div>
                            <p className="text-sm text-gray-300">"Dr. Biskup and his team are fantastic. Very professional and friendly. I highly recommend them!"</p>
                          </div>
                          <div className="border-b border-gray-700 pb-3">
                            <div className="flex items-center mb-1">
                              <span className="font-semibold text-white">John D.</span>
                              <div className="flex text-yellow-400 ml-3">★★★★☆</div>
                            </div>
                            <p className="text-sm text-gray-300">"Great experience, the clinic is clean and modern. The staff is welcoming. Only downside is the waiting time."</p>
                          </div>
                          <div className="border-b border-gray-700 pb-3">
                            <div className="flex items-center mb-1">
                              <span className="font-semibold text-white">Sarah P.</span>
                              <div className="flex text-yellow-400 ml-3">★★★★★</div>
                            </div>
                            <p className="text-sm text-gray-300">"Best dentist in the West Island. Painless procedure and very reassuring."</p>
                          </div>
                          <div className="border-b border-gray-700 pb-3">
                            <div className="flex items-center mb-1">
                              <span className="font-semibold text-white">Michael R.</span>
                              <div className="flex text-yellow-400 ml-3">★★★★★</div>
                            </div>
                            <p className="text-sm text-gray-300">"Excellent service from start to finish. Dr. Biskup explained everything clearly and the procedure was completely painless."</p>
                          </div>
                          <div className="border-b border-gray-700 pb-3">
                            <div className="flex items-center mb-1">
                              <span className="font-semibold text-white">Emma L.</span>
                              <div className="flex text-yellow-400 ml-3">★★★★☆</div>
                            </div>
                            <p className="text-sm text-gray-300">"Very satisfied with my dental cleaning. The hygienist was gentle and thorough. Appointment was on time."</p>
                          </div>
                          <div className="border-b border-gray-700 pb-3">
                            <div className="flex items-center mb-1">
                              <span className="font-semibold text-white">David K.</span>
                              <div className="flex text-yellow-400 ml-3">★★★★★</div>
                            </div>
                            <p className="text-sm text-gray-300">"Outstanding dental care! The office is spotless and the staff made me feel comfortable throughout my visit."</p>
                          </div>
                          <div>
                            <div className="flex items-center mb-1">
                              <span className="font-semibold text-white">Jennifer T.</span>
                              <div className="flex text-yellow-400 ml-3">★★★★☆</div>
                            </div>
                            <p className="text-sm text-gray-300">"Good experience overall. The location is convenient and parking is easy. Would recommend to others in the area."</p>
                          </div>
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
                          <span className="text-2xl font-bold text-white">1,300</span>
                          <span className="text-xs text-gray-400 text-center">Monthly Visitors</span>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-2">
                          <span className="text-2xl font-bold text-white">4.2</span>
                          <span className="text-xs text-gray-400 text-center">Avg Rating</span>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-2">
                          <span className="text-2xl font-bold text-white">1,039</span>
                          <span className="text-xs text-gray-400 text-center">Total Reviews</span>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-2">
                          <span className="text-2xl font-bold text-white">23</span>
                          <span className="text-xs text-gray-400 text-center">Photos</span>
                        </div>
                      </div>
              </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="local-business" className="flex-1">
              <div className="h-full flex gap-4">
                <div className="w-[40%] flex flex-col gap-4">
                  <Card className={`h-[30%] p-4 overflow-auto transition-all duration-700 ease-out ${animateLocalBusiness ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {gridData.length > 0 ? (
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-white mb-1">Avg. Rank</div>
                          <div className="text-2xl font-bold text-white">
                            {calculateAverageRank().toFixed(2)}
                            <span className="text-sm text-green-400 ml-2">+0.22</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-semibold text-white mb-3">Rank decomposition</div>
                          <div className="space-y-2">
                            {(() => {
                              const decomposition = calculateRankDecomposition()
                              return (
                                <>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-white">Good:</span>
                                    <div className="flex items-center gap-2 flex-1 ml-4">
                                      <span className="text-white font-medium">{decomposition.good.toFixed(2)}%</span>
                                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out" 
                                          style={{ width: animateRanks ? `${decomposition.good}%` : '0%' }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-white">Average:</span>
                                    <div className="flex items-center gap-2 flex-1 ml-4">
                                      <span className="text-white font-medium">{decomposition.average.toFixed(2)}%</span>
                                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-yellow-500 rounded-full transition-all duration-1000 ease-out delay-200" 
                                          style={{ width: animateRanks ? `${decomposition.average}%` : '0%' }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-white">Poor:</span>
                                    <div className="flex items-center gap-2 flex-1 ml-4">
                                      <span className="text-white font-medium">{decomposition.poor.toFixed(2)}%</span>
                                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out delay-400" 
                                          style={{ width: animateRanks ? `${decomposition.poor}%` : '0%' }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-white">Out Top 20:</span>
                                    <div className="flex items-center gap-2 flex-1 ml-4">
                                      <span className="text-white font-medium">{decomposition.outTop20.toFixed(2)}%</span>
                                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out delay-600" 
                                          style={{ width: animateRanks ? `${decomposition.outTop20}%` : '0%' }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-white text-sm">Loading ranking data...</div>
                    )}
                  </Card>
                  <Card className={`p-4 overflow-hidden transition-all duration-700 ease-out delay-200 ${animateLocalBusiness ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ height: `${locationCardHeight}px` }}>
                    <div className="h-full overflow-y-auto scrollbar-hide">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-600">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-white bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2.6</div>
                            <div>
                              <div className="text-white font-medium">Exclusive Salon and Spa</div>
                              <div className="text-gray-300 text-sm">58 Belladonna Boulevard</div>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="flex text-yellow-400">★★★★☆</div>
                                <span className="text-gray-400 text-xs">(1,803)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-600">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-white bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">5.8</div>
                            <div>
                              <div className="text-white font-medium">Beauty Queen Salon</div>
                              <div className="text-gray-300 text-sm">61 West Grove Street</div>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="flex text-yellow-400">★★★☆☆</div>
                                <span className="text-gray-400 text-xs">(982)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-blue-500 bg-blue-900/20">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-white bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">9.2</div>
                            <div>
                              <div className="text-white font-medium">Robert Biskup Dentiste</div>
                              <div className="text-gray-300 text-sm">123 Cakewalk Avenue</div>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="flex text-yellow-400">★★★★☆</div>
                                <span className="text-gray-400 text-xs">(1,039)</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            You
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-600">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-white bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">11.6</div>
                            <div>
                              <div className="text-white font-medium">Mike's Hair & Beauty Palace</div>
                              <div className="text-gray-300 text-sm">5 St Monica Street</div>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="flex text-yellow-400">★★★★☆</div>
                                <span className="text-gray-400 text-xs">(756)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-600">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-white bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">13.2</div>
                            <div>
                              <div className="text-white font-medium">West Island Dental Care</div>
                              <div className="text-gray-300 text-sm">89 Pine Ridge Road</div>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="flex text-yellow-400">★★★☆☆</div>
                                <span className="text-gray-400 text-xs">(432)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-600">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-white bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">15.7</div>
                            <div>
                              <div className="text-white font-medium">Montreal Smile Clinic</div>
                              <div className="text-gray-300 text-sm">42 Lakeshore Drive</div>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="flex text-yellow-400">★★★★☆</div>
                                <span className="text-gray-400 text-xs">(1,205)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-600">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-white bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">18.4</div>
                            <div>
                              <div className="text-white font-medium">Perfect Teeth Dental</div>
                              <div className="text-gray-300 text-sm">156 Maple Street</div>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="flex text-yellow-400">★★★☆☆</div>
                                <span className="text-gray-400 text-xs">(687)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                {mapError ? (
                  <div className="w-[60%] h-full rounded-lg border flex items-center justify-center bg-gray-100">
                    <div className="text-center p-4">
                      <p className="text-red-600 mb-2">Map Error:</p>
                      <p className="text-sm text-gray-600">{mapError}</p>
                      {!mapboxgl.accessToken && (
                        <p className="text-xs text-gray-500 mt-2">
                          Add your Mapbox token to .env.local file
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div 
                    ref={mapContainer} 
                    className="w-[60%] h-full rounded-lg border"
                    style={{ minHeight: '400px' }}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="social-media" className="flex-1">
              <div className="h-full flex gap-4">
                <Card className={`flex-1 p-4 overflow-auto transition-all duration-700 ease-out ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className={`flex items-center gap-2 mb-4 transition-all duration-500 ease-out ${animateSocial ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                    <FaFacebook className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-semibold text-white">Facebook</h3>
                  </div>
                  <div className="space-y-3">
                    <div className={`transition-all duration-600 ease-out delay-200 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <div className="text-lg text-white font-bold">Robert Biskup Dentiste West Island Dentist</div>
                      <div className="text-sm text-blue-400">facebook.com/robertbiskupdentiste</div>
                    </div>
                    <div className={`space-y-2 transition-all duration-600 ease-out delay-400 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-400">Followers</div>
                        <div className="text-lg font-bold text-white">1,247</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-400">Last Post</div>
                        <div className="text-lg font-bold text-white">3 days ago</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-400">Running Ads</div>
                        <div className="text-lg font-bold text-green-400">Yes</div>
                      </div>
                    </div>
                    <div className={`space-y-2 transition-all duration-700 ease-out delay-600 ${animateSocial ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                      <div className="h-64">
                        <img src="/facebook1.jpg" alt="Facebook post" className="w-full h-full object-cover rounded" />
                      </div>
                      <div className="flex gap-2 h-26">
                        <img src="/facebook2.jpg" alt="Facebook post" className="flex-1 object-cover rounded" />
                        <img src="/facebook3.jpg" alt="Facebook post" className="flex-1 object-cover rounded" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className={`flex-1 p-4 overflow-auto transition-all duration-700 ease-out delay-100 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className={`flex items-center gap-2 mb-4 transition-all duration-500 ease-out delay-100 ${animateSocial ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                    <FaInstagram className="w-6 h-6 text-pink-500" />
                    <h3 className="text-lg font-semibold text-white">Instagram</h3>
                  </div>
                  <div className="space-y-3">
                    <div className={`transition-all duration-600 ease-out delay-300 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <div className="text-lg text-white font-bold">Robert Biskup</div>
                      <div className="text-sm text-pink-400">@robertbiskup</div>
                    </div>
                    <div className={`space-y-2 transition-all duration-600 ease-out delay-500 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-400">Followers</div>
                        <div className="text-lg font-bold text-white">892</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-400">Last Post</div>
                        <div className="text-lg font-bold text-white">1 week ago</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-400">Running Ads</div>
                        <div className="text-lg font-bold text-red-400">No</div>
                      </div>
                    </div>
                    <div className={`space-y-2 transition-all duration-700 ease-out delay-700 ${animateSocial ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                      <div className="h-64">
                        <img src="/instagram1.jpg" alt="Instagram post" className="w-full h-full object-cover rounded" />
                      </div>
                      <div className="flex gap-2 h-32">
                        <img src="/instagram2.jpg" alt="Instagram post" className="flex-1 object-cover rounded" />
                        <img src="/instagram3.jpg" alt="Instagram post" className="flex-1 object-cover rounded" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className={`flex-1 p-4 overflow-auto transition-all duration-700 ease-out delay-200 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className={`flex items-center gap-2 mb-4 transition-all duration-500 ease-out delay-200 ${animateSocial ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                    <FaGoogle className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-semibold text-white">Google</h3>
                  </div>
                  <div className="space-y-3">
                    <div className={`transition-all duration-600 ease-out delay-400 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <div className="text-lg text-white font-bold">Robert Biskup Dentiste West Island Dentist</div>
                      <div className="text-sm text-blue-400">business.google.com/robertbiskupdentiste</div>
                    </div>
                    <div className={`space-y-2 transition-all duration-600 ease-out delay-600 ${animateSocial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-400">Last Post</div>
                        <div className="text-lg font-bold text-white">2 weeks ago</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-sm text-gray-400">Running Ads</div>
                        <div className="text-lg font-bold text-green-400">Yes</div>
                      </div>
                    </div>
                    <div className={`space-y-2 transition-all duration-700 ease-out delay-800 ${animateSocial ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                      <div className="h-64">
                        <img src="/google1.png" alt="Google Business post" className="w-full h-full object-cover rounded" />
                      </div>
                    </div>
                  </div>
              </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="website" className="flex-1">
              <div className="h-full flex gap-4">
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
                        src="/dentist_website.png" 
                        alt="Dentist Website"
                        className="w-full"
                      />
                    </ScrollArea>
              </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="w-[30%] flex flex-col">
          <Card className="flex-1 mb-4 flex flex-col relative overflow-hidden">
            {callState === "idle" ? (
              <div 
                key="idle"
                className="flex flex-col px-6 h-full transition-all duration-500 ease-in-out transform"
              >
                <Button 
                  onClick={handleCallNow}
                  className="w-full h-16 text-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mb-6"
                >
                  <Phone className="h-6 w-6" />
                  Call Now
                </Button>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Notes</h3>
                  <p className="text-gray-500 text-sm">None so far</p>
                </div>
              </div>
            ) : callState === "in-call" ? (
              <div 
                key="in-call"
                className="flex-1 flex flex-col transition-all duration-500 ease-in-out transform animate-in fade-in slide-in-from-bottom-4"
              >
                <div className="flex justify-between items-center px-6 pb-6 border-b transition-all duration-300 ease-in-out">
                  <span className="font-mono transition-all duration-300">{formatTime(time)}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      {isMuted ? (
                        <MicOff className="h-4 w-4 transition-all duration-200" />
                      ) : (
                        <Mic className="h-4 w-4 transition-all duration-200" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleHangUp}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <Phone className="h-4 w-4 transition-all duration-200" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-end transition-all duration-300 ease-in-out">
                  <ChatTranscript
                    messages={[
                      {
                        role: "agent",
                        name: "Sarah Miller",
                        message:
                          "Hi Dr. Biskup, this is Sarah from Digital Growth Solutions. I hope I'm not catching you at a bad time. I'm calling because I noticed your dental practice could benefit from improved online visibility.",
                      },
                      {
                        role: "user",
                        name: "Dr. Robert Biskup",
                        message: "Oh, um, what exactly are you offering?",
                      },
                      {
                        role: "agent",
                        name: "Sarah Miller",
                        message:
                          "We specialize in SEO services specifically for dental practices. We can help you rank higher on Google when people search for 'dentist near me' or 'teeth whitening West Island'. Are you currently doing any digital marketing?",
                      },
                      {
                        role: "user",
                        name: "Dr. Robert Biskup",
                        message: "Not really, just our basic website. How much does something like this cost?",
                      },
                      {
                        role: "agent",
                        name: "Sarah Miller",
                        message:
                          "Our dental SEO packages start at $1,200 per month, but I'd love to offer you a free website audit first. Would you be interested in seeing how your practice currently appears online?",
                      },
                      {
                        role: "user",
                        name: "Dr. Robert Biskup",
                        message: "That's quite expensive. Let me think about it and discuss with my partner.",
                      },
                    ]}
                  />
                </div>
              </div>
            ) : (
              <div 
                key="post-call"
                className="flex-1 flex flex-col px-6 pb-6 transition-all duration-500 ease-in-out transform animate-in fade-in slide-in-from-top-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                  <h3 className="text-lg font-semibold mb-2">Call Summary</h3>
                  <p className="text-sm text-gray-600 mb-2">Duration: {formatTime(time)}</p>
                  <p className="text-sm text-gray-600">Status: Completed</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCallState("idle")}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    Back to Call
                  </Button>
                </div>
                
                <div className="mb-4 flex-1">
                  <h4 className="text-md font-semibold mb-2">Notes</h4>
                  <div className="p-3 rounded-lg text-sm">
                    <p className="mb-2">• Prospect showed initial interest but concerned about price point</p>
                    <p className="mb-2">• Currently has minimal digital marketing presence</p>
                    <p className="mb-2">• Needs to consult with business partner before decision</p>
                    <p className="mb-2">• Follow up in 1 week with free audit proposal</p>
                    <p>• Consider offering entry-level package or discount for first 3 months</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
          <Button className="w-full">Next</Button>
        </div>
      </div>
  </>
}