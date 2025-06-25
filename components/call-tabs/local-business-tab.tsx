'use client'

import { Card } from "@/components/ui/card"
import { useRef, useEffect } from "react"
import mapboxgl from "mapbox-gl"
import 'mapbox-gl/dist/mapbox-gl.css'

// Set the access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

interface LocalBusinessTabProps {
  isTransitioning: boolean
  animateRanks: boolean
  animateLocalBusiness: boolean
  locationCardHeight: number
  gridData: number[]
  activeTab: string
  onGridDataUpdate: (data: number[]) => void
}

export function LocalBusinessTab({ 
  isTransitioning, 
  animateRanks, 
  animateLocalBusiness, 
  locationCardHeight, 
  gridData,
  activeTab,
  onGridDataUpdate
}: LocalBusinessTabProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const mapError = useRef<string>('')

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

    onGridDataUpdate(ranks)

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

  useEffect(() => {
    // Only initialize map when local business tab is active
    if (activeTab !== "local-business") return
    
    // Check if access token is available
    if (!mapboxgl.accessToken) {
      mapError.current = 'Mapbox access token not found. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file.'
      return
    }

    // Don't initialize map if it already exists
    if (map.current) return

    if (!mapContainer.current) {
      mapError.current = 'Map container not found'
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
        mapError.current = ''
        
        // Add the 5x5 grid of points
        if (map.current) {
          addGridLayer(map.current)
        }
      })

      map.current.on('error', (e) => {
        console.error('Map error:', e)
        mapError.current = `Map error: ${e.error?.message || 'Unknown error'}`
      })

    } catch (error) {
      console.error('Error initializing map:', error)
      mapError.current = `Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [activeTab])

  return (
    <div className={`h-full flex gap-4 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
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
      {mapError.current ? (
        <div className="w-[60%] h-full rounded-lg border flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <p className="text-red-600 mb-2">Map Error:</p>
            <p className="text-sm text-gray-600">{mapError.current}</p>
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
  )
} 