"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { ChevronLeft, ChevronRight, Users, Building2, MapPin } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Opportunity, Branch } from "@/lib/data"

const OPPORTUNITIES_PER_PAGE = 6

const loadMapbox = async () => {
  if (typeof window === "undefined") return null
  try {
    const mapboxgl = await import("mapbox-gl")
    return mapboxgl.default
  } catch (error) {
    console.error("Failed to load Mapbox:", error)
    return null
  }
}

export default function SimpleMapView({
  opportunities,
  branches,
  selectedBranch,
}: {
  opportunities: Opportunity[]
  branches: Branch[]
  selectedBranch: Branch | null
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  const paginatedOpportunities = useMemo(() => {
    const startIndex = (currentPage - 1) * OPPORTUNITIES_PER_PAGE
    return opportunities.slice(startIndex, startIndex + OPPORTUNITIES_PER_PAGE)
  }, [opportunities, currentPage])

  const totalPages = Math.ceil(opportunities.length / OPPORTUNITIES_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
    setSelectedOpportunity(null)
  }, [opportunities])

  return (
    <div className="flex h-full bg-gray-50">
      <div className="flex-1 relative">
        <MapContainer
          opportunities={opportunities}
          paginatedOpportunities={paginatedOpportunities}
          branches={branches}
          selectedBranch={selectedBranch}
          selectedOpportunity={selectedOpportunity}
          onOpportunitySelect={setSelectedOpportunity}
          onError={setMapError}
        />

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-3 z-10 border border-white/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-electric-violet rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-midnight-indigo">{opportunities.length} Opportunities</span>
          </div>
          {selectedBranch && (
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="w-3 h-3 text-indigo-depth" />
              <span className="text-xs text-midnight-indigo/80">{selectedBranch.city}</span>
            </div>
          )}
        </div>

        {mapError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-20">
            <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-danger" />
              </div>
              <h3 className="text-lg font-semibold text-midnight-indigo mb-2">Map Unavailable</h3>
              <p className="text-sm text-gray-600 mb-4">{mapError}</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-96 bg-card border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-midnight-indigo">Opportunities</h3>
          <p className="text-sm text-midnight-indigo/70">
            Showing {paginatedOpportunities.length} of {opportunities.length}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {paginatedOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              isSelected={selectedOpportunity?.id === opportunity.id}
              onClick={() => setSelectedOpportunity(opportunity)}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <span className="text-sm font-medium text-midnight-indigo/80">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MapContainer({
  opportunities,
  paginatedOpportunities,
  branches,
  selectedBranch,
  selectedOpportunity,
  onOpportunitySelect,
  onError,
}: {
  opportunities: Opportunity[]
  paginatedOpportunities: Opportunity[]
  branches: Branch[]
  selectedBranch: Branch | null
  selectedOpportunity: Opportunity | null
  onOpportunitySelect: (opp: Opportunity) => void
  onError: (error: string) => void
}) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markers = useRef<Map<string, any>>(new Map())
  const [mapboxgl, setMapboxgl] = useState<any>(null)

  useEffect(() => {
    loadMapbox()
      .then(setMapboxgl)
      .catch((error) => {
        console.error("Failed to load Mapbox:", error)
        onError("Failed to load mapping library")
      })
  }, [onError])

  useEffect(() => {
    if (!mapboxgl || !mapContainer.current || map.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_PK
    if (!token) {
      onError("Mapbox token is missing")
      return
    }

    try {
      mapboxgl.accessToken = token
      let center: [number, number] = [24.5, -29]
      let zoom = 5

      if (selectedBranch) {
        center = [selectedBranch.longitude, selectedBranch.latitude]
        zoom = 10
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center,
        zoom,
        attributionControl: false,
      })

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

      map.current.on("error", (e: any) => {
        console.error("Map error:", e)
        onError("Map failed to load")
      })
    } catch (error) {
      console.error("Map initialization error:", error)
      onError("Failed to initialize map")
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mapboxgl, selectedBranch, onError])

  useEffect(() => {
    if (!map.current || !mapboxgl) return

    markers.current.forEach((marker) => marker.remove())
    markers.current.clear()

    const bounds = new mapboxgl.LngLatBounds()
    let hasValidCoords = false

    branches.forEach((branch) => {
      if (isValidCoordinate(branch.longitude, branch.latitude)) {
        const isSelected = selectedBranch?.code === branch.code
        const marker = createBranchMarker(branch, isSelected)
        const mapboxMarker = new mapboxgl.Marker(marker)
          .setLngLat([branch.longitude, branch.latitude])
          .addTo(map.current)
        markers.current.set(`branch-${branch.code}`, mapboxMarker)
        bounds.extend([branch.longitude, branch.latitude])
        hasValidCoords = true
      }
    })

    opportunities.forEach((opportunity) => {
      if (isValidCoordinate(opportunity.longitude, opportunity.latitude)) {
        const isInCurrentPage = paginatedOpportunities.some((p) => p.id === opportunity.id)
        const isSelected = selectedOpportunity?.id === opportunity.id
        const marker = createOpportunityMarker(opportunity, {
          isInCurrentPage,
          isSelected,
          onClick: () => onOpportunitySelect(opportunity),
        })
        const mapboxMarker = new mapboxgl.Marker(marker)
          .setLngLat([opportunity.longitude, opportunity.latitude])
          .addTo(map.current)
        markers.current.set(opportunity.id, mapboxMarker)
        bounds.extend([opportunity.longitude, opportunity.latitude])
        hasValidCoords = true
      }
    })

    // if (hasValidCoords && !bounds.isEmpty()) {
    //   map.current.fitBounds(bounds, {
    //     padding: { top: 50, bottom: 50, left: 50, right: 450 },
    //     maxZoom: 15,
    //   })
    // }
  }, [
    mapboxgl,
    opportunities,
    paginatedOpportunities,
    selectedOpportunity,
    branches,
    selectedBranch,
    onOpportunitySelect,
  ])

  // Effect to handle zooming when a branch is selected
  useEffect(() => {
    if (!map.current || !mapboxgl) return;

    if (selectedBranch && isValidCoordinate(selectedBranch.longitude, selectedBranch.latitude)) {
      map.current.flyTo({
        center: [selectedBranch.longitude, selectedBranch.latitude],
        zoom: 12,
        speed: 1.8,
        curve: 1.4,
        essential: true, // CRITICAL for accessibility
      });
    } else {
      // Fly back to national view if "All Branches" is selected
      map.current.flyTo({
        center: [24.5, -29],
        zoom: 5,
        speed: 1.8,
        essential: true,
      });
    }
  }, [selectedBranch, mapboxgl]);

  // Effect to handle zooming when an opportunity is selected from the sidebar
  useEffect(() => {
    if (!map.current || !mapboxgl || !selectedOpportunity) return;

    if (isValidCoordinate(selectedOpportunity.longitude, selectedOpportunity.latitude)) {
      map.current.flyTo({
        center: [selectedOpportunity.longitude, selectedOpportunity.latitude],
        zoom: 14,
        speed: 1.5,
        curve: 1,
        essential: true,
      });
    }
  }, [selectedOpportunity, mapboxgl]);

  return <div ref={mapContainer} className="w-full h-full" />
}

function OpportunityCard({
  opportunity,
  isSelected,
  onClick,
}: {
  opportunity: Opportunity
  isSelected: boolean
  onClick: () => void
}) {
  const penetrationRate = Math.round((opportunity.currentPenetration / opportunity.maxEmployees) * 100)

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-lg border ${
        isSelected ? "ring-2 ring-exxaro-orange shadow-xl" : "shadow-md"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-base text-midnight-indigo leading-tight">{opportunity.name}</h4>
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold ${
              penetrationRate <= 15
                ? "bg-green-100 text-green-800"
                : penetrationRate <= 30
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {penetrationRate}%
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-midnight-indigo/80 mb-3">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{opportunity.employees}</span>
          </div>
          <span className="font-medium text-indigo-depth">{opportunity.department}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span
            className={`px-2 py-1 rounded font-medium ${
              opportunity.strategicValue === "High"
                ? "bg-blue-100 text-blue-800"
                : opportunity.strategicValue === "Medium"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-gray-50 text-gray-600"
            }`}
          >
            {opportunity.strategicValue} Value
          </span>
          <span className="text-midnight-indigo/70">{opportunity.distance}km away</span>
        </div>
      </CardContent>
    </Card>
  )
}

function isValidCoordinate(lng: number, lat: number): boolean {
  return (
    typeof lng === "number" &&
    typeof lat === "number" &&
    !isNaN(lng) &&
    !isNaN(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  )
}

function createBranchMarker(branch: Branch, isSelected: boolean) {
  const element = document.createElement("div")
  element.className = `w-10 h-10 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform flex items-center justify-center ${
    isSelected ? "bg-electric-violet scale-110" : "bg-indigo-depth"
  }`
  element.innerHTML = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`
  return element
}

function createOpportunityMarker(
  opportunity: Opportunity,
  {
    isInCurrentPage,
    isSelected,
    onClick,
  }: {
    isInCurrentPage: boolean
    isSelected: boolean
    onClick: () => void
  },
) {
  const size = Math.max(24, Math.min(48, (opportunity.maxEmployees / 4000) * 48))
  const penetrationRate = Math.round((opportunity.currentPenetration / opportunity.maxEmployees) * 100)

  let bgColor = "bg-success"
  if (penetrationRate > 15) bgColor = "bg-warning"
  if (penetrationRate > 30) bgColor = "bg-danger"

  const element = document.createElement("div")
  element.className = `rounded-full border-2 border-white/80 shadow-lg cursor-pointer transition-all flex items-center justify-center ${bgColor} ${
    isSelected ? "scale-125 ring-4 ring-exxaro-orange z-10" : ""
  } ${isInCurrentPage ? "opacity-100" : "opacity-50"}`
  element.style.width = `${size}px`
  element.style.height = `${size}px`

  const displayValue =
    opportunity.maxEmployees > 999
      ? `${(opportunity.maxEmployees / 1000).toFixed(1)}k`
      : opportunity.maxEmployees.toString()

  element.innerHTML = `<div class="text-white font-bold" style="font-size: ${size > 32 ? "12px" : "10px"}">${displayValue}</div>`
  element.addEventListener("click", onClick)
  return element
}
