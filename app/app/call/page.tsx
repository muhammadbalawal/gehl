'use client'

import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Phone, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Tag } from "lucide-react"
import { ChatTranscript } from "@/components/chat-transcript"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { OverviewTab } from "@/components/call-tabs/overview-tab"
import { LocalBusinessTab } from "@/components/call-tabs/local-business-tab"
import { SocialMediaTab } from "@/components/call-tabs/social-media-tab"
import { WebsiteTab } from "@/components/call-tabs/website-tab"
import { Lead } from "@/components/call-tabs/types"
import { Device } from '@twilio/voice-sdk'
import { supabase } from "@/lib/supabaseClient"
import { useCallSid } from '@/hooks/useCallSid';

interface Message {
  role: 'agent' | 'user';
  name: string;
  message: string;
  timestamp: string;
  id: number; // Database ID for better deduplication
}

interface TranscriptRow {
  id: number;
  call_sid: string;
  speaker: string;
  transcript: string;
  timestamp: string;
}

// Lead data
const leadsData: Lead[] = [
  {
    id: 1,
    name: "Robert Biskup Dentiste West Island Dentist",
    shortName: "Robert Biskup Dentiste",
    logo: "/dentist_logo.png",
    category: "Dental Clinic",
    rating: 4.2,
    totalReviews: 1039,
    hours: "9:00 AM - 5:00 PM",
    phone: "(514) 123-4567",
    email: "contact@biskupdentiste.com",
    address: "123 Cakewalk Avenue, Montreal, QC",
    website: "biskupdentiste.com",
    photos: 23,
    monthlyVisitors: 1300,
    facebook: {
      name: "Robert Biskup Dentiste West Island Dentist",
      url: "facebook.com/robertbiskupdentiste",
      followers: 1247,
      lastPost: "3 days ago",
      runningAds: true,
      images: ["/facebook1.jpg", "/facebook2.jpg", "/facebook3.jpg"]
    },
    instagram: {
      name: "Robert Biskup",
      handle: "@robertbiskup",
      followers: 892,
      lastPost: "1 week ago",
      runningAds: false,
      images: ["/instagram1.jpg", "/instagram2.jpg", "/instagram3.jpg"]
    },
    google: {
      name: "Robert Biskup Dentiste West Island Dentist",
      url: "business.google.com/robertbiskupdentiste",
      lastPost: "2 weeks ago",
      runningAds: true,
      images: ["/google1.png"]
    },
    websiteImage: "/dentist_website.png"
  },
  {
    id: 2,
    name: "Dentists Of South West One",
    shortName: "Dentists Of South West One",
    logo: "/second_dentist_logo.png",
    category: "Dental Clinic",
    rating: 3.8,
    totalReviews: 587,
    hours: "8:00 AM - 6:00 PM",
    phone: "(514) 987-6543",
    email: "info@southwestone.com",
    address: "456 Wellington Street, Montreal, QC",
    website: "southwestone.com",
    photos: 15,
    monthlyVisitors: 950,
    facebook: {
      name: "Clinique dentaire et d'implantologie South West One",
      url: "facebook.com/southwestone",
      followers: 892,
      lastPost: "1 week ago",
      runningAds: false,
      images: ["/second_facebook1.jpg", "/second_facebook2.jpg", "/second_facebook3.jpg"]
    },
    instagram: null, // No Instagram page
    google: {
      name: "Dentists Of South West One",
      url: "business.google.com/southwestone",
      lastPost: "1 week ago",
      runningAds: true,
      images: ["/second_google1.png"]
    },
    websiteImage: "/second_dentist_website.png"
  }
]

export default function DashboardCallPage() {
  const [callState, setCallState] = useState<"idle" | "calling" | "in-call" | "post-call">("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [time, setTime] = useState(0)
  const [activeTab, setActiveTab] = useState("lead-overview")


// Twilio device
  const deviceRef = useRef<Device | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [localCallSid, setLocalCallSid] = useState<string | null>(null);
  
  // Use the useCallSid hook to get call SID from WebSocket server
  const callSid = useCallSid();
  
  // Determine which call SID to use for transcripts
  const activeCallSid = localCallSid || callSid;

  // Debug logging for call SID tracking
  useEffect(() => {
    console.log('🔍 Call SID Debug Info:', {
      localCallSid,
      webSocketCallSid: callSid,
      activeCallSid,
      callState
    });
  }, [localCallSid, callSid, activeCallSid, callState]);

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


  // Twilio device setup
  useEffect(() => {
    const init = async () => {
      const res = await fetch('/api/token');
      const { token } = await res.json();
      const device = new Device(token);
      deviceRef.current = device;

      device.on('ready', () => console.log('Ready to call'));
      device.on('error', (err) => console.error('Twilio error:', err));
      device.on('connect', (call) => {
        console.log('Call connected:', call.parameters.CallSid);
        setLocalCallSid(call.parameters.CallSid);
        setCallState("in-call");
      });
      device.on('disconnect', () => {
        console.log('Call disconnected');
        setCallState("post-call");
        setLocalCallSid(null);
      });
    };

    init();
  }, []);




  const [gridData, setGridData] = useState<number[]>([])
  const [locationCardHeight, setLocationCardHeight] = useState(450)
  const [websiteCardHeight, setWebsiteCardHeight] = useState(600)
  const [reviewsCardHeight, setReviewsCardHeight] = useState(450)
  const [callInterfaceHeight, setCallInterfaceHeight] = useState(500)
  const [animateRanks, setAnimateRanks] = useState(false)
  const [animateSocial, setAnimateSocial] = useState(false)
  const [animateLocalBusiness, setAnimateLocalBusiness] = useState(false)
  const [animateWebsite, setAnimateWebsite] = useState(false)
  const [animateOverview, setAnimateOverview] = useState(false)

  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([])
  const [isLoadingTranscripts, setIsLoadingTranscripts] = useState(false)
  const [isLoadingNewTranscripts, setIsLoadingNewTranscripts] = useState(false)
  const [isPollingMode, setIsPollingMode] = useState(false)
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false)
  const [lastPollTime, setLastPollTime] = useState<number>(0)

  // Popover states
  const [callbackDate, setCallbackDate] = useState<Date>()
  const [reminderDate, setReminderDate] = useState<Date>()
  const [status, setStatus] = useState<string>("")
  const [callbackOpen, setCallbackOpen] = useState(false)
  const [reminderOpen, setReminderOpen] = useState(false)

  // Lead navigation
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const currentLead = leadsData[currentLeadIndex]

  const handleNext = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentLeadIndex((prev) => (prev + 1) % leadsData.length)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 300)
  }

  const handleBack = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentLeadIndex((prev) => (prev - 1 + leadsData.length) % leadsData.length)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 300)
  }

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

      // Call interface card: Use all available height minus space for top buttons (3 buttons ~120px) and bottom buttons (~60px)
      const callInterfaceAvailable = availableHeight - 60 // Space for top and bottom buttons + margins
      setCallInterfaceHeight(Math.max(400, callInterfaceAvailable)) // Minimum 400px
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

  // Function to convert database transcript to Message format
  const convertTranscriptToMessage = (transcript: TranscriptRow): Message => {
    // Map speaker to role and name
    // CALLER = You (the agent), CALLEE = The customer being called
    const isAgent = transcript.speaker === 'CALLER'
    
    return {
      role: isAgent ? 'agent' : 'user',
      name: isAgent ? 'Sarah Miller' : currentLead.name.split(' ')[0] || 'Customer',
      message: transcript.transcript,
      timestamp: transcript.timestamp,
      id: transcript.id
    }
  }

  // Load existing transcripts for the current call
  const loadExistingTranscripts = async (currentCallSid: string) => {
    if (!currentCallSid) return

    setIsLoadingTranscripts(true)
    try {
      console.log('Loading transcripts for call SID:', currentCallSid)
      
      // Test Supabase connection first
      const { data: testData, error: testError } = await supabase
        .from('transcriptions')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError)
        return
      }
      
      console.log('✅ Supabase connection test successful')
      
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*')
        .eq('call_sid', currentCallSid)
        .order('timestamp', { ascending: true })

      if (error) {
        console.error('Error loading transcripts:', error)
        return
      }

      if (data) {
        console.log('Loaded transcripts:', data.length, 'messages')
        const messages = data.map(convertTranscriptToMessage)
        setDisplayedMessages(messages)
      }
    } catch (error) {
      console.error('Error loading transcripts:', error)
    } finally {
      setIsLoadingTranscripts(false)
    }
  }

  // Load only new transcripts (for polling mode)
  const loadNewTranscripts = async (currentCallSid: string) => {
    if (!currentCallSid) return

    // Prevent polling too frequently (minimum 3 seconds between polls)
    const now = Date.now();
    if (now - lastPollTime < 3000) {
      console.log('⏰ Skipping poll - too soon since last poll');
      return;
    }
    setLastPollTime(now);

    setIsLoadingNewTranscripts(true);
    try {
      console.log('🔄 Polling for new transcripts...')
      
      // Get the latest timestamp from existing messages
      const latestId = displayedMessages.length > 0 
        ? displayedMessages[displayedMessages.length - 1].id 
        : null;
      
      console.log('📅 Latest message ID from existing messages:', latestId);
      
      let query = supabase
        .from('transcriptions')
        .select('*')
        .eq('call_sid', currentCallSid)
        .order('id', { ascending: true }); // Use ID for ordering
      
      // If we have existing messages, only get newer ones
      if (latestId) {
        query = query.gt('id', latestId);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error loading new transcripts:', error)
        return
      }

      if (data && data.length > 0) {
        console.log('Found new transcripts:', data.length, 'messages')
        console.log('New transcript IDs:', data.map(t => t.id));
        
        const newMessages = data.map(convertTranscriptToMessage)
        
        // Additional deduplication check
        setDisplayedMessages(prev => {
          const existingIds = new Set(prev.map(msg => msg.id));
          const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
          
          if (uniqueNewMessages.length !== newMessages.length) {
            console.log(`🔄 Filtered out ${newMessages.length - uniqueNewMessages.length} duplicate messages`);
          }
          
          return [...prev, ...uniqueNewMessages];
        });
        
      } else {
        console.log('No new transcripts found');
      }
    } catch (error) {
      console.error('Error loading new transcripts:', error)
    } finally {
      setIsLoadingNewTranscripts(false);
    }
  }

  // Set up realtime subscription for new transcripts
  useEffect(() => {
    if (callState === "in-call" && activeCallSid) {
      console.log('🎯 Setting up transcript subscription for call SID:', activeCallSid);
      
      // Load existing transcripts first
      loadExistingTranscripts(activeCallSid)

      // Set up realtime subscription with error handling
      let subscription: any = null;
      let retryCount = 0;
      const maxRetries = 5; // Increased retries
      let pollInterval: NodeJS.Timeout | null = null;

      const setupSubscription = () => {
        try {
          console.log(`📡 Attempting to set up Supabase realtime subscription (attempt ${retryCount + 1}/${maxRetries})`);
          
          subscription = supabase
            .channel('transcriptions')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'transcriptions',
                filter: `call_sid=eq.${activeCallSid}`
              },
              (payload) => {
                console.log('New transcript received:', payload)
                try {
                  const newTranscript = payload.new as TranscriptRow
                  const newMessage = convertTranscriptToMessage(newTranscript)
                  setDisplayedMessages(prev => [...prev, newMessage])
                } catch (error) {
                  console.error('Error processing new transcript:', error)
                }
              }
            )
            .subscribe((status) => {
              console.log('📡 Supabase subscription status:', status)
              if (status === 'SUBSCRIBED') {
                console.log('✅ Successfully subscribed to transcriptions for call:', activeCallSid)
                setIsSubscriptionActive(true)
                retryCount = 0; // Reset retry count on success
              } else if (status === 'CHANNEL_ERROR') {
                console.error('❌ Error subscribing to transcriptions channel')
                setIsSubscriptionActive(false)
                retryCount++;
                
                if (retryCount < maxRetries) {
                  console.log(`🔄 Retrying subscription in 3 seconds... (${retryCount}/${maxRetries})`)
                  setTimeout(() => {
                    if (subscription) {
                      supabase.removeChannel(subscription)
                    }
                    setupSubscription();
                  }, 3000); // Increased delay
                } else {
                  console.warn('⚠️ Max retries reached, falling back to polling mode')
                  setIsSubscriptionActive(false)
                  setIsPollingMode(true)
                  // Fall back to polling every 5 seconds
                  pollInterval = setInterval(() => {
                    if (callState === "in-call" && activeCallSid) {
                      loadNewTranscripts(activeCallSid);
                    } else {
                      if (pollInterval) clearInterval(pollInterval);
                    }
                  }, 5000);
                }
              } else if (status === 'TIMED_OUT') {
                console.error('⏰ Subscription timed out')
                setIsSubscriptionActive(false)
              } else if (status === 'CLOSED') {
                console.log('🔴 Subscription closed')
                setIsSubscriptionActive(false)
              } else {
                console.log('ℹ️ Subscription status:', status)
              }
            })
        } catch (error) {
          console.error('❌ Error setting up subscription:', error)
        }
      };

      // Add a small delay before setting up subscription to allow initial load to complete
      setTimeout(() => {
        setupSubscription();
      }, 1000);

      return () => {
        console.log('🧹 Cleaning up transcript subscription')
        if (subscription) {
          supabase.removeChannel(subscription)
        }
        if (pollInterval) {
          clearInterval(pollInterval)
        }
      }
    } else if (callState !== "in-call") {
      // Clear messages and errors when not in call
      console.log('📭 Clearing transcripts - not in call')
      setDisplayedMessages([])
      setIsPollingMode(false)
      setIsSubscriptionActive(false)
    }
  }, [callState, activeCallSid])



  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  const handleCallNow = () => {
    setCallState("calling")
    // After 3 seconds, transition to in-call state
    setTimeout(() => {
      setCallState("in-call")
    }, 3000)

    // Connect the Twilio device
    deviceRef.current?.connect();
  }

  const handleHangUp = () => {
    setCallState("post-call")

    // Disconnect the Twilio device
    deviceRef.current?.disconnectAll();
  }

  const handleNewCall = () => {
    setTime(0)
    setCallState("idle")
  }

  // Manual refresh function for transcripts
  const refreshTranscripts = async () => {
    if (activeCallSid) {
      console.log('🔄 Manually refreshing transcripts...');
      if (isPollingMode && displayedMessages.length > 0) {
        // If in polling mode and we have messages, only load new ones
        await loadNewTranscripts(activeCallSid);
      } else {
        // Otherwise load all transcripts (for initial load or when no messages exist)
        await loadExistingTranscripts(activeCallSid);
      }
    }
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
        <h1 className={`mb-4 text-2xl font-bold transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {currentLead.name}
        </h1>

        <Tabs defaultValue="lead-overview" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
          <TabsList className="w-fit mb-4">
            <TabsTrigger value="lead-overview">Overview</TabsTrigger>
            <TabsTrigger value="local-business">Local Business</TabsTrigger>
            <TabsTrigger value="social-media">Social Media</TabsTrigger>
            <TabsTrigger value="website">Website</TabsTrigger>
          </TabsList>

          <TabsContent value="lead-overview" className="flex-1">
            <OverviewTab
              currentLead={currentLead}
              isTransitioning={isTransitioning}
              animateOverview={animateOverview}
              reviewsCardHeight={reviewsCardHeight}
            />
          </TabsContent>

          <TabsContent value="local-business" className="flex-1">
            <LocalBusinessTab
              isTransitioning={isTransitioning}
              animateRanks={animateRanks}
              animateLocalBusiness={animateLocalBusiness}
              locationCardHeight={locationCardHeight}
              gridData={gridData}
              activeTab={activeTab}
              onGridDataUpdate={setGridData}
            />
          </TabsContent>

          <TabsContent value="social-media" className="flex-1">
            <SocialMediaTab
              currentLead={currentLead}
              isTransitioning={isTransitioning}
              animateSocial={animateSocial}
            />
          </TabsContent>

          <TabsContent value="website" className="flex-1">
            <WebsiteTab
              currentLead={currentLead}
              isTransitioning={isTransitioning}
              animateWebsite={animateWebsite}
              websiteCardHeight={websiteCardHeight}
            />
          </TabsContent>
        </Tabs>
      </div>
      <div className="w-[30%] flex flex-col">
        <div className="flex flex-col gap-2 mb-4">
          <Popover open={callbackOpen} onOpenChange={setCallbackOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {callbackDate ? format(callbackDate, "PPP") : "Schedule Callback"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={callbackDate}
                onSelect={(date) => {
                  setCallbackDate(date)
                  setCallbackOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover open={reminderOpen} onOpenChange={setReminderOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                {reminderDate ? format(reminderDate, "PPP") : "Set Reminder"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={reminderDate}
                onSelect={(date) => {
                  setReminderDate(date)
                  setReminderOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full h-8 justify-center">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <SelectValue placeholder="Add Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hot Lead">Hot Lead</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="New Lead">New Lead</SelectItem>
              <SelectItem value="Cold Lead">Cold Lead</SelectItem>
              <SelectItem value="Not Interested">Not Interested</SelectItem>
              <SelectItem value="no status">No Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="mb-4 flex flex-col relative overflow-hidden" style={{ height: `${callInterfaceHeight}px` }}>
          {callState === "idle" ? (
            <div
              key="idle"
              className="flex flex-col px-6 h-full transition-all duration-500 ease-in-out transform"
            >
              <Button
                onClick={handleCallNow}
                className="w-full h-16 text-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mb-6 mt-6"
              >
                <Phone className="h-6 w-6" />
                Call Now
              </Button>

              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-gray-500 text-sm">None so far</p>
              </div>
            </div>
          ) : callState === "calling" ? (
            <div
              key="calling"
              className="flex flex-col items-center justify-center h-full transition-all duration-500 ease-in-out transform animate-in fade-in"
            >
              <div className="mb-4">
                <Phone className="h-12 w-12 text-blue-500 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Calling...</h3>
              <p className="text-gray-500 text-sm">{currentLead.phone}</p>
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

              <div className="flex flex-col justify-end transition-all duration-300 ease-in-out overflow-hidden" style={{ height: `${callInterfaceHeight - 120}px` }}>
                {isLoadingTranscripts ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Loading transcripts...</p>
                    </div>
                  </div>
                ) : displayedMessages.length > 0 ? (
                  // Show messages if we have any
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-hidden">
                      <ChatTranscript
                        messages={displayedMessages}
                      />
                    </div>
                    {isLoadingNewTranscripts && (
                      <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 text-xs text-blue-600 flex items-center gap-2">
                        <div className="animate-spin h-3 w-3 border-b border-blue-600 rounded-full"></div>
                        Checking for new messages...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Mic className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Waiting for conversation to start...</p>
                      {isPollingMode && (
                        <p className="text-xs text-blue-500 mt-1">🔄 Polling for new transcripts</p>
                      )}
                    </div>
                  </div>
                )}
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
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 flex items-center justify-center gap-2" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button className="flex-1 flex items-center justify-center gap-2" onClick={handleNext}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </>
}