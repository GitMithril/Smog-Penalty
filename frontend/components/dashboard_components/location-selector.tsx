"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from "lucide-react"
import { useState } from "react"

interface LocationSelectorProps {
  onLocationSelect: (lat: number, lon: number) => void
  latitude: number | null
  longitude: number | null
}

export function LocationSelector({ onLocationSelect, latitude, longitude }: LocationSelectorProps) {
  const [lat, setLat] = useState(latitude?.toString() || "")
  const [lon, setLon] = useState(longitude?.toString() || "")
  const [showMap, setShowMap] = useState(false)

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude
          const newLon = position.coords.longitude
          setLat(newLat.toFixed(6))
          setLon(newLon.toFixed(6))
          onLocationSelect(newLat, newLon)
        },
        (error) => {
          console.error("[v0] Error getting location:", error)
          alert("Unable to retrieve your location. Please enter coordinates manually.")
        },
      )
    } else {
      alert("Geolocation is not supported by your browser.")
    }
  }

  const handleManualUpdate = () => {
    const latNum = Number.parseFloat(lat)
    const lonNum = Number.parseFloat(lon)
    if (!isNaN(latNum) && !isNaN(lonNum)) {
      onLocationSelect(latNum, lonNum)
    }
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm text-white">Location</h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude" className="text-[#b3b3b3]">
            Latitude
          </Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            placeholder="e.g., 40.7128"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            onBlur={handleManualUpdate}
            className="bg-[#1a1a1a] border-white/20 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude" className="text-[#b3b3b3]">
            Longitude
          </Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            placeholder="e.g., -74.0060"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            onBlur={handleManualUpdate}
            className="bg-[#1a1a1a] border-white/20 text-white"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleGetCurrentLocation}
          variant="outline"
          className="flex-1 bg-[#1a1a1a] border-white/20 text-white hover:bg-[#2a2a2a]"
        >
          <Navigation className="mr-2 h-4 w-4" />
          Get Current Location
        </Button>

        <Button
          onClick={() => setShowMap(!showMap)}
          variant="outline"
          className="flex-1 bg-[#1a1a1a] border-white/20 text-white hover:bg-[#2a2a2a]"
        >
          <MapPin className="mr-2 h-4 w-4" />
          {showMap ? "Hide" : "Open"} Map
        </Button>
      </div>

      {showMap && (
        <div className="border border-white/20 rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="300"
            frameBorder="0"
            scrolling="no"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
              lon ? Number.parseFloat(lon) - 0.1 : -74.1
            },${lat ? Number.parseFloat(lat) - 0.1 : 40.6},${lon ? Number.parseFloat(lon) + 0.1 : -73.9},${
              lat ? Number.parseFloat(lat) + 0.1 : 40.8
            }&layer=mapnik&marker=${lat || 40.7128},${lon || -74.006}`}
            className="w-full"
          />
          <div className="bg-[#1a1a1a] p-2 text-xs text-[#b3b3b3] text-center">
            Click location manually in the coordinate fields above or use the current location button
          </div>
        </div>
      )}
    </div>
  )
}
