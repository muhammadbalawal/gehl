"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from "@/components/ui/card";
import { SectionCards } from "@/components/section-cards"
import { Badge } from "@/components/ui/badge"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Star } from "lucide-react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';

// Set the access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const SEORankingDashboard = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string>('');

  const businesses = [
    {
      rank: 2.6,
      name: "Exclusive Salon and Spa",
      address: "58 Beladonna Boulevard",
      rating: 4.5,
      reviews: 1803
    },
    {
      rank: 5.8,
      name: "Beauty Queen Salon",
      address: "61 West Grove Street",
      rating: 3.9,
      reviews: 982
    },
    {
      rank: 9.2,
      name: "Hair Care Full Service",
      address: "123 Cakewalk Avenue",
      rating: 4.8,
      reviews: 1039,
      isYou: true
    },
    {
      rank: 11.6,
      name: "Mike's Hair & Beauty Palace",
      address: "5 St Monica Street",
      rating: 0,
      reviews: 0
    }
  ];

  const rankStats = [
    { label: "Good", value: 28.57, color: "bg-emerald-600" },
    { label: "Average", value: 38.78, color: "bg-yellow-600" },
    { label: "Poor", value: 30.61, color: "bg-orange-600" },
    { label: "Out Top 20", value: 2.04, color: "bg-red-600" },
  ];

  useEffect(() => {
    // Check if access token is available
    if (!mapboxgl.accessToken) {
      setMapError('Mapbox access token not found. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file.');
      return;
    }

    // Don't initialize map if it already exists
    if (map.current) return;
    
    // Don't initialize if container is not available
    if (!mapContainer.current) return;

    console.log('Initializing Mapbox with token:', mapboxgl.accessToken.substring(0, 20) + '...');

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-73.5673, 45.5017], // Montreal coordinates
        zoom: 11,
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapError('');
        addGridLayer(map.current);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError(`Map error: ${e.error?.message || 'Unknown error'}`);
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add markers for businesses (optional enhancement)
      businesses.forEach((business, index) => {
        // You can add markers here if you have coordinates for the businesses
        // For now, we'll skip this since we don't have lat/lng data
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(`Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const addGridLayer = (map: mapboxgl.Map | null) => {
    if (!map) return;

    const center = map.getCenter();
    const gridSize = 5;
    const latitudeSpacing = 0.03;
    const longitudeCorrection = 1 / Math.cos(center.lat * (Math.PI / 180));
    const longitudeSpacing = latitudeSpacing * longitudeCorrection;
    const features: GeoJSON.Feature<GeoJSON.Point>[] = [];

    const startLon = center.lng - (Math.floor(gridSize / 2) * longitudeSpacing);
    const startLat = center.lat + (Math.floor(gridSize / 2) * latitudeSpacing);

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const rank = Math.floor(Math.random() * 25) + 1;
            const longitude = startLon + j * longitudeSpacing;
            const latitude = startLat - i * latitudeSpacing;

            features.push({
                type: 'Feature',
                properties: { rank },
                geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                },
            });
        }
    }

    const geoJsonData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features,
    };

    if (map.getSource('grid-source')) {
        (map.getSource('grid-source') as mapboxgl.GeoJSONSource).setData(geoJsonData);
    } else {
        map.addSource('grid-source', {
            type: 'geojson',
            data: geoJsonData,
        });
    }

    if (!map.getLayer('grid-circles')) {
        map.addLayer({
            id: 'grid-circles',
            type: 'circle',
            source: 'grid-source',
            paint: {
                'circle-radius': 24,
                'circle-color': [
                    'case',
                    ['>', ['get', 'rank'], 20], '#e0e0e0',
                    ['>=', ['get', 'rank'], 13], '#ef4444',
                    ['>=', ['get', 'rank'], 6], '#f59e0b',
                    '#22c55e',
                ],
                'circle-stroke-width': 3,
                'circle-stroke-color': [
                    'case',
                    ['>', ['get', 'rank'], 20], '#bdbdbd',
                    ['>=', ['get', 'rank'], 13], '#b91c1c',
                    ['>=', ['get', 'rank'], 6], '#b45309',
                    '#15803d',
                ],
            },
        });
    }
    
    if (!map.getLayer('grid-labels')) {
        map.addLayer({
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
                'text-size': 12,
                'text-allow-overlap': true,
                'text-ignore-placement': true,
            },
            paint: {
                'text-color': [
                    'case',
                    ['>', ['get', 'rank'], 20], '#000000',
                    '#FFFFFF',
                ],
            },
        });
    }
  };

  return (
    <div>
      <Card>
        <CardHeader className="text-center">
          <h2 className="text-lg font-bold">SEO Ranking Dashboard</h2>
        </CardHeader>
        <CardContent>
          {/* Side-by-side layout */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Avg. Rank card */}
            <Card className="w-full md:w-1/2">
              <CardHeader>
                <div className="flex justify-between mb-2">
                  <CardDescription>Avg. Rank</CardDescription>
                  <Badge variant="outline">
                    <IconTrendingUp className="mr-1" />
                    +12.5%
                  </Badge>
                </div>

                <CardTitle className="w-full text-center text-9xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  8.22
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Rank decomposition card */}
            <Card className="w-full md:w-1/2">
              <CardHeader>
                <CardTitle className="text-sm">Rank decomposition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {rankStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-24">{stat.label}</span>
                    <span className="w-15 text-center">{stat.value}%</span>
                    <div className="flex-1 bg-gray-200 h-4 rounded">
                      <div
                        className={`h-4 rounded ${stat.color}`}
                        style={{ width: `${stat.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex w-full h-[600px] gap-4">
            {/* Business listings */}
            <div className="flex flex-col w-1/3 h-full overflow-y-auto custom-scrollbar">
            
              {businesses.map((biz, index) => (
                <Card key={index} className={`mb-2 ${biz.isYou ? "bg-gray-800 text-white" : ""}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          biz.isYou ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"
                        }`}>
                          {biz.rank}
                        </span>
                        <span className="text-sm">{biz.name}</span>
                      </div>
                      {biz.isYou && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                          You
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-1 text-xs">
                    <div>{biz.address}</div>
                    <div className="flex items-center gap-1">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < Math.floor(biz.rating) ? "currentColor" : "none"}
                            stroke="currentColor"
                          />
                        ))}
                      </div>
                      <span className="text-xs">{biz.rating.toFixed(1)}</span>
                      <span className={`text-xs ${biz.isYou ? "text-gray-300" : "text-gray-500"}`}>
                        ({biz.reviews.toLocaleString()})
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Map container */}
            <div className="w-2/3 h-full relative">
              {mapError ? (
                <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-red-600 font-medium mb-2">Map Error</p>
                    <p className="text-sm text-gray-600 max-w-md">{mapError}</p>
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
                  className="w-full h-full rounded-lg"
                  style={{
                    minHeight: '400px',
                  }}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEORankingDashboard;