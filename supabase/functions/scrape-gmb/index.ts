// Supabase Edge Function for GMB Scraping
// File: supabase/functions/scrape-gmb/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapeRequest {
  lead_id: number
  gmb_link: string
  user_id: string
}

interface GmbData {
  rating?: number
  num_reviews?: number
  working_hours?: any
  address?: string
  num_photos?: number
  recent_reviews?: any[]
  monthly_visitors?: number
  category?: any[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('GMB Scraping function called')
    
    // Parse request body
    const { lead_id, gmb_link, user_id }: ScrapeRequest = await req.json()
    
    // Validate required fields
    if (!lead_id || !gmb_link || !user_id) {
      throw new Error('Missing required fields: lead_id, gmb_link, or user_id')
    }

    console.log(`Processing lead ${lead_id} with GMB link: ${gmb_link}`)

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Scrape GMB data
    console.log('Starting GMB data scraping...')
    const gmbData = await scrapeGoogleMyBusiness(gmb_link)
    
    if (!gmbData) {
      throw new Error('Failed to scrape GMB data')
    }

    console.log('GMB data scraped successfully:', gmbData)

    // Check if GMB record already exists for this lead
    const { data: existingGmb } = await supabase
      .from('gmb')
      .select('id')
      .eq('lead_id', lead_id)
      .single()

    let result
    if (existingGmb) {
      // Update existing record
      result = await supabase
        .from('gmb')
        .update({
          rating: gmbData.rating,
          num_reviews: gmbData.num_reviews,
          working_hours: gmbData.working_hours,
          address: gmbData.address,
          num_photos: gmbData.num_photos,
          recent_reviews: gmbData.recent_reviews,
          monthly_visitors: gmbData.monthly_visitors,
          category: gmbData.category,
        })
        .eq('lead_id', lead_id)
    } else {
      // Insert new record
      result = await supabase
        .from('gmb')
        .insert({
          lead_id: lead_id,
          rating: gmbData.rating,
          num_reviews: gmbData.num_reviews,
          working_hours: gmbData.working_hours,
          address: gmbData.address,
          num_photos: gmbData.num_photos,
          recent_reviews: gmbData.recent_reviews,
          monthly_visitors: gmbData.monthly_visitors,
          category: gmbData.category,
        })
    }

    if (result.error) {
      console.error('Database error:', result.error)
      throw new Error(`Database error: ${result.error.message}`)
    }

    console.log('GMB data saved to database successfully')

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'GMB data scraped and saved successfully',
        lead_id: lead_id,
        data: gmbData
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in GMB scraping function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

async function scrapeGoogleMyBusiness(gmbLink: string): Promise<GmbData | null> {
  try {
    console.log(`Processing GMB link: ${gmbLink}`)
    
    // Google Places API key - Replace YOUR_API_KEY_HERE with your actual key
    const apiKey = 'YOUR_API_KEY_HERE'
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      console.error('Please replace YOUR_API_KEY_HERE with your actual Google Places API key')
      return null
    }

    // Extract place ID from GMB link
    const placeId = await extractPlaceIdFromGmbLink(gmbLink, apiKey)
    if (!placeId) {
      console.error('Could not extract place ID from GMB link')
      return null
    }

    console.log(`Extracted place ID: ${placeId}`)

    // Get detailed place information from Google Places API
    const placeDetails = await getPlaceDetails(placeId, apiKey)
    if (!placeDetails) {
      console.error('Failed to get place details from Google Places API')
      return null
    }

    // Convert Google Places API response to our GmbData format
    const gmbData = mapPlacesToGmbData(placeDetails)
    
    console.log('GMB data successfully retrieved from Google Places API:', gmbData)
    return gmbData

  } catch (error) {
    console.error('Error getting GMB data from Google Places API:', error)
    return null
  }
}

// Google Places API Helper Functions

async function extractPlaceIdFromGmbLink(gmbLink: string, apiKey: string): Promise<string | null> {
  try {
    // Different types of GMB links we might encounter:
    // 1. https://maps.app.goo.gl/XXXXX (short link)
    // 2. https://www.google.com/maps/place/Business+Name/@lat,lng,zoom/data=XXXXX
    // 3. https://maps.google.com/place/Business+Name/@lat,lng
    // 4. Direct place_id links

    console.log(`Extracting place ID from: ${gmbLink}`)

    // Check if it's already a place_id
    const placeIdMatch = gmbLink.match(/place_id[=:]([A-Za-z0-9_-]+)/i)
    if (placeIdMatch) {
      console.log(`Found direct place_id: ${placeIdMatch[1]}`)
      return placeIdMatch[1]
    }

    // Handle short Google Maps links (goo.gl)
    if (gmbLink.includes('goo.gl') || gmbLink.includes('maps.app.goo.gl')) {
      console.log('Resolving short link...')
      const expandedUrl = await expandShortUrl(gmbLink)
      if (expandedUrl && expandedUrl !== gmbLink) {
        return extractPlaceIdFromGmbLink(expandedUrl, apiKey)
      }
    }

    // Extract business name and coordinates for Places API search
    const businessName = extractBusinessNameFromUrl(gmbLink)
    const coordinates = extractCoordinatesFromUrl(gmbLink)

    if (businessName) {
      console.log(`Searching for business: ${businessName}`)
      return await searchPlaceByName(businessName, coordinates, apiKey)
    }

    console.log('Could not extract place ID from URL')
    return null

  } catch (error) {
    console.error('Error extracting place ID:', error)
    return null
  }
}

async function expandShortUrl(shortUrl: string): Promise<string | null> {
  try {
    const response = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'follow'
    })
    return response.url
  } catch (error) {
    console.error('Error expanding short URL:', error)
    return null
  }
}

function extractBusinessNameFromUrl(url: string): string | null {
  // Extract business name from various URL patterns
  const patterns = [
    /\/place\/([^/@]+)/,
    /\/maps\/place\/([^/@]+)/,
    /q=([^&]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      const name = decodeURIComponent(match[1].replace(/\+/g, ' '))
      console.log(`Extracted business name: ${name}`)
      return name
    }
  }

  return null
}

function extractCoordinatesFromUrl(url: string): { lat: number, lng: number } | null {
  // Extract coordinates from URL like /@40.7128,-74.0060,15z
  const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1])
    const lng = parseFloat(coordMatch[2])
    console.log(`Extracted coordinates: ${lat}, ${lng}`)
    return { lat, lng }
  }
  return null
}

async function searchPlaceByName(businessName: string, coordinates: { lat: number, lng: number } | null, apiKey: string): Promise<string | null> {
  try {
    let searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(businessName)}&inputtype=textquery&fields=place_id,name&key=${apiKey}`
    
    // Add location bias if coordinates are available
    if (coordinates) {
      searchUrl += `&locationbias=circle:1000@${coordinates.lat},${coordinates.lng}`
    }

    console.log('Searching Google Places API...')
    const response = await fetch(searchUrl)
    const data = await response.json()

    if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
      const placeId = data.candidates[0].place_id
      console.log(`Found place_id via search: ${placeId}`)
      return placeId
    }

    console.log('No place found via search')
    return null

  } catch (error) {
    console.error('Error searching for place:', error)
    return null
  }
}

async function getPlaceDetails(placeId: string, apiKey: string): Promise<any | null> {
  try {
    const fields = [
      'place_id',
      'name',
      'rating',
      'user_ratings_total',
      'formatted_address',
      'opening_hours',
      'photos',
      'reviews',
      'types',
      'business_status'
    ].join(',')

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`
    
    console.log('Fetching place details from Google Places API...')
    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'OK' && data.result) {
      console.log(`Successfully retrieved details for: ${data.result.name}`)
      return data.result
    } else {
      console.error('Google Places API error:', data.status, data.error_message)
      return null
    }

  } catch (error) {
    console.error('Error fetching place details:', error)
    return null
  }
}

function mapPlacesToGmbData(placeDetails: any): GmbData {
  try {
    console.log('Mapping Google Places data to GMB format...')

    // Map opening hours
    let workingHours: any = null
    if (placeDetails.opening_hours && placeDetails.opening_hours.weekday_text) {
      workingHours = {}
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      placeDetails.opening_hours.weekday_text.forEach((dayText: string, index: number) => {
        const parts = dayText.split(': ')
        if (parts.length === 2) {
          workingHours[days[index]] = parts[1]
        }
      })
    }

    // Map recent reviews
    const recentReviews = []
    if (placeDetails.reviews && placeDetails.reviews.length > 0) {
      for (let i = 0; i < Math.min(5, placeDetails.reviews.length); i++) {
        const review = placeDetails.reviews[i]
        recentReviews.push({
          author: review.author_name || 'Anonymous',
          rating: review.rating || 0,
          text: review.text || '',
          date: new Date(review.time * 1000).toISOString().split('T')[0] // Convert timestamp to date
        })
      }
    }

    // Extract business categories
    const categories = placeDetails.types || []

    const gmbData: GmbData = {
      rating: placeDetails.rating || null,
      num_reviews: placeDetails.user_ratings_total || 0,
      working_hours: workingHours,
      address: placeDetails.formatted_address || null,
      num_photos: placeDetails.photos ? placeDetails.photos.length : 0,
      recent_reviews: recentReviews,
      monthly_visitors: undefined, // Not available in Google Places API
      category: categories
    }

    console.log('Successfully mapped GMB data')
    return gmbData

  } catch (error) {
    console.error('Error mapping place details to GMB data:', error)
    return {}
  }
} 