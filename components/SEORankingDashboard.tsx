"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from "@/components/ui/card";
import { SectionCards } from "@/components/section-cards"
import { Badge } from "@/components/ui/badge"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Star } from "lucide-react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;



const SEORankingDashboard = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

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
    if (map.current) return;
    if (!mapContainer.current) return;

    console.log('Access token:', mapboxgl.accessToken); 

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-73.5673, 45.5017],
        zoom: 10,
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) map.current.remove();
    };
  }, []);



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

          <div className="flex w-full h-full">

            <div className="flex flex-col w-1/3 h-full">
              {businesses.map((biz, index) => (
                <Card key={index} className={biz.isYou ? "bg-gray-800" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-200 text-sm px-2 py-0.5 rounded-full font-medium text-gray-800">
                          {biz.rank}
                        </span>
                        {biz.name}
                      </div>
                      {biz.isYou && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                          You
                        </span>
                      )}
                    </CardTitle>
                    <CardContent className="pt-2 space-y-1 text-sm">
                      <div>{biz.address}</div>
                      <div className="flex items-center gap-1 text-gray-800">
                        <div className="flex text-gray-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              fill={i < Math.floor(biz.rating) ? "currentColor" : "none"}
                              stroke="currentColor"
                            />
                          ))}
                        </div>
                        <span className="text-sm">{biz.rating.toFixed(1)}</span>
                        <span className="text-gray-500">
                          ({biz.reviews.toLocaleString()})
                        </span>
                      </div>
                    </CardContent>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div
              ref={mapContainer}
              className="w-2/3 h-full"
              style={{
                borderRadius: "0px",
                border: "2px solid red",
                backgroundColor: "#eee",
              }}
            />
          </div>




        </CardContent>
      </Card>


    </div>
  );
};

export default SEORankingDashboard;