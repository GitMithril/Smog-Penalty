"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useRef } from "react"
import { LocationSelector } from "./location-selector"
import { TimeSeriesChart } from "./time-series-chart"
import { Upload, CalendarIcon, X, FileText } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import { useToast } from "@/hooks/use-toast"

interface PredictionSimulatorProps {
  onPredict: (
    values: {
      pm25: number
      pm25_2?: number
      pm25LastHour?: number
      powerLastHour?: number
      powerFactorLastHour?: number
      allskyKt?: number
      sza?: number
      t2m?: number
      t2mLastHour?: number
      ws10m?: number
      hour?: number
      month?: number
      surfaceIrradiance?: number
      latitude?: number | null
      longitude?: number | null
    },
    isLocationMode: boolean,
    isPenaltyMode: boolean,
  ) => void
  timeSeriesData: Array<{ time: string; power: number }>
  isLoading?: boolean
}

export function PredictionSimulator({ onPredict, timeSeriesData, isLoading = false }: PredictionSimulatorProps) {
  const { toast } = useToast()
  const [isLocationMode, setIsLocationMode] = useState(false)
  const [isPenaltyMode, setIsPenaltyMode] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 5, 15)) // June 15, 2025

  const [pm25, setPm25] = useState(0)
  const [pm25_2, setPm25_2] = useState(0)
  const [pm25LastHour, setPm25LastHour] = useState(0)
  const [powerLastHour, setPowerLastHour] = useState(0)
  const [powerFactorLastHour, setPowerFactorLastHour] = useState(0)

  const [allskyKt, setAllskyKt] = useState(0)
  const [sza, setSza] = useState(0)
  const [t2m, setT2m] = useState(0)
  const [t2mLastHour, setT2mLastHour] = useState(0)
  const [ws10m, setWs10m] = useState(0)
  const [hour, setHour] = useState(0)
  const [month, setMonth] = useState(1)
  const [surfaceIrradiance, setSurfaceIrradiance] = useState(0)

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isBatchLoading, setIsBatchLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePredict = () => {
    console.log("Run Prediction clicked", { isLocationMode, isPenaltyMode, uploadedFile })
    
    if (uploadedFile) {
      handleBatchPrediction()
      return
    }

    if (isLocationMode) {
      if (latitude === null || longitude === null) {
        toast({
          title: "Location required",
          description: "Please select a location on the map or enter coordinates.",
          variant: "destructive",
        })
        return
      }

      onPredict(
        {
          pm25,
          pm25_2: isPenaltyMode ? pm25_2 : undefined,
          pm25LastHour,
          powerLastHour,
          powerFactorLastHour,
          hour,
          month,
          latitude,
          longitude,
        },
        true,
        isPenaltyMode,
      )
    } else {
      onPredict(
        {
          pm25,
          pm25_2: isPenaltyMode ? pm25_2 : undefined,
          pm25LastHour,
          powerLastHour,
          allskyKt,
          sza,
          t2m,
          t2mLastHour,
          ws10m,
          hour,
          month,
          surfaceIrradiance,
          powerFactorLastHour,
          latitude,
          longitude,
        },
        false,
        isPenaltyMode,
      )
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
    toast({
      title: "File Uploaded",
      description: `Ready to process ${file.name}`,
    })
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleBatchPrediction = async () => {
    if (!uploadedFile) return

    setIsBatchLoading(true)
    const formData = new FormData()
    formData.append("file", uploadedFile)

    try {
      const response = await fetch("http://127.0.0.1:8000/api/predict/batch", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Batch prediction failed: ${errorText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `predictions_${uploadedFile.name}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Batch Prediction Complete",
        description: "Predictions downloaded successfully.",
      })
    } catch (error) {
      console.error("Batch prediction error:", error)
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsBatchLoading(false)
    }
  }

  const handleLocationSelect = (lat: number, lon: number) => {
    setLatitude(lat)
    setLongitude(lon)
  }

  return (
    <Card className="bg-black/50 backdrop-blur-md border-white/10 p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg mb-1">What-If Prediction Simulator</h3>
          <p className="text-sm text-[#b3b3b3]">
            Adjust environmental and atmospheric conditions to estimate solar power output.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Manual/Location Toggle */}
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-medium transition-colors ${!isLocationMode ? "text-white" : "text-[#b3b3b3]"}`}
            >
              Manual
            </span>
            <button
              onClick={() => setIsLocationMode(!isLocationMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#121212] ${
                isLocationMode ? "bg-[#3b82f6]" : "bg-[#2a2a2a]"
              }`}
              role="switch"
              aria-checked={isLocationMode}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isLocationMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${isLocationMode ? "text-white" : "text-[#b3b3b3]"}`}
            >
              Location
            </span>
          </div>

          {/* Single/Penalty Toggle */}
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-medium transition-colors ${!isPenaltyMode ? "text-white" : "text-[#b3b3b3]"}`}
            >
              Single
            </span>
            <button
              onClick={() => setIsPenaltyMode(!isPenaltyMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 focus:ring-offset-[#121212] ${
                isPenaltyMode ? "bg-[#22c55e]" : "bg-[#2a2a2a]"
              }`}
              role="switch"
              aria-checked={isPenaltyMode}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPenaltyMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${isPenaltyMode ? "text-white" : "text-[#b3b3b3]"}`}
            >
              Penalty
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Label className="text-[#b3b3b3] mb-2 block">Upload CSV Data (Optional)</Label>
        <div
          onClick={() => !uploadedFile && fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors relative",
            uploadedFile 
              ? "border-[#22c55e] bg-[#22c55e]/10 cursor-default" 
              : "border-white/20 cursor-pointer hover:border-[#3b82f6]"
          )}
        >
          {uploadedFile ? (
            <div className="flex flex-col items-center justify-center">
              <FileText className="mx-auto h-8 w-8 text-[#22c55e] mb-2" />
              <p className="text-sm text-white font-medium">{uploadedFile.name}</p>
              <p className="text-xs text-[#b3b3b3] mt-1">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
              <Button
                variant="ghost"
                className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/10"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-[#b3b3b3] mb-2" />
              <p className="text-sm text-[#b3b3b3]">Click to upload or drag and drop</p>
              <p className="text-xs text-[#666] mt-1">CSV file with time series data</p>
            </>
          )}
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      <div className="space-y-8">
        {isLocationMode ? (
          <>
            <LocationSelector onLocationSelect={handleLocationSelect} latitude={latitude} longitude={longitude} />

            <div>
              <h4 className="font-medium text-sm mb-4 text-white">Temporal Context</h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[#b3b3b3]">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-[#1a1a1a] border-white/20 text-white hover:bg-[#2a2a2a] hover:text-white",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-white/20 text-white">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => {
                          if (newDate) {
                            setDate(newDate)
                            setMonth(newDate.getMonth() + 1)
                          }
                        }}
                        initialFocus
                        disabled={(date) =>
                          date > new Date(2025, 10, 23) || date < new Date(2020, 0, 1)
                        }
                        className="bg-[#1a1a1a] text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="hour-loc" className="text-[#b3b3b3]">
                      Hour of Day
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={hour}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          if (val >= 8 && val <= 16) setHour(val)
                        }}
                        className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                        step="1"
                        min="8"
                        max="16"
                      />
                      <span className="text-sm text-[#b3b3b3]">:00</span>
                    </div>
                  </div>
                  <Slider
                    id="hour-loc"
                    min={8}
                    max={16}
                    step={1}
                    value={[hour]}
                    onValueChange={(value) => setHour(value[0])}
                    className="[&_[role=slider]]:bg-[#3b82f6] [&_[role=slider]]:border-[#3b82f6] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-4 text-white">Sensor Data</h4>
              <div className="space-y-6">
                {isPenaltyMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-4">
                        <Label htmlFor="pm25-1" className="text-[#b3b3b3]">
                          PM2.5 (Scenario 1)
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={pm25}
                            onChange={(e) => setPm25(Number(e.target.value))}
                            className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                            step="0.1"
                            min="0"
                            max="150"
                          />
                          <span className="text-sm text-[#b3b3b3]">µg/m³</span>
                        </div>
                      </div>
                      <Slider
                        id="pm25-1"
                        min={0}
                        max={150}
                        step={0.1}
                        value={[pm25]}
                        onValueChange={(value) => setPm25(value[0])}
                        className="[&_[role=slider]]:bg-[#a6a6a6] [&_[role=slider]]:border-[#a6a6a6] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-4">
                        <Label htmlFor="pm25-2" className="text-[#b3b3b3]">
                          PM2.5 (Scenario 2)
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={pm25_2}
                            onChange={(e) => setPm25_2(Number(e.target.value))}
                            className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                            step="0.1"
                            min="0"
                            max="150"
                          />
                          <span className="text-sm text-[#b3b3b3]">µg/m³</span>
                        </div>
                      </div>
                      <Slider
                        id="pm25-2"
                        min={0}
                        max={150}
                        step={0.1}
                        value={[pm25_2]}
                        onValueChange={(value) => setPm25_2(value[0])}
                        className="[&_[role=slider]]:bg-[#ef4444] [&_[role=slider]]:border-[#ef4444] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center gap-4">
                      <Label htmlFor="pm25-loc" className="text-[#b3b3b3]">
                        PM2.5
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={pm25}
                          onChange={(e) => setPm25(Number(e.target.value))}
                          className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                          step="0.1"
                          min="0"
                          max="150"
                        />
                        <span className="text-sm text-[#b3b3b3]">µg/m³</span>
                      </div>
                    </div>
                    <Slider
                      id="pm25-loc"
                      min={0}
                      max={150}
                      step={0.1}
                      value={[pm25]}
                      onValueChange={(value) => setPm25(value[0])}
                      className="[&_[role=slider]]:bg-[#a6a6a6] [&_[role=slider]]:border-[#a6a6a6] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="pm25-last" className="text-[#b3b3b3]">
                      PM2.5 (Last Hour)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={pm25LastHour}
                        onChange={(e) => setPm25LastHour(Number(e.target.value))}
                        className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                        step="0.1"
                        min="0"
                        max="150"
                      />
                      <span className="text-sm text-[#b3b3b3]">µg/m³</span>
                    </div>
                  </div>
                  <Slider
                    id="pm25-last"
                    min={0}
                    max={150}
                    step={0.1}
                    value={[pm25LastHour]}
                    onValueChange={(value) => setPm25LastHour(value[0])}
                    className="[&_[role=slider]]:bg-[#a6a6a6] [&_[role=slider]]:border-[#a6a6a6] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="power-last" className="text-[#b3b3b3]">
                      Power Generated (Last Hour)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={powerLastHour}
                        onChange={(e) => setPowerLastHour(Number(e.target.value))}
                        className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                        step="0.1"
                        min="0"
                        max="800"
                      />
                      <span className="text-sm text-[#b3b3b3]">kW</span>
                    </div>
                  </div>
                  <Slider
                    id="power-last"
                    min={0}
                    max={800}
                    step={0.1}
                    value={[powerLastHour]}
                    onValueChange={(value) => setPowerLastHour(value[0])}
                    className="[&_[role=slider]]:bg-[#22c55e] [&_[role=slider]]:border-[#22c55e] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="power-factor-loc" className="text-[#b3b3b3]">
                      Power Factor (Last Hour)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={powerFactorLastHour}
                        onChange={(e) => setPowerFactorLastHour(Number(e.target.value))}
                        className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                        step="0.01"
                        min="0"
                        max="1"
                      />
                    </div>
                  </div>
                  <Slider
                    id="power-factor-loc"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[powerFactorLastHour]}
                    onValueChange={(value) => setPowerFactorLastHour(value[0])}
                    className="[&_[role=slider]]:bg-[#3b82f6] [&_[role=slider]]:border-[#3b82f6] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <h4 className="font-medium text-sm mb-4 text-white">Atmospheric Conditions</h4>
              <div className="space-y-6">
                {isPenaltyMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-4">
                        <Label htmlFor="pm25-manual-1" className="text-[#b3b3b3]">
                          PM2.5 (Scenario 1)
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={pm25}
                            onChange={(e) => setPm25(Number(e.target.value))}
                            className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                            step="0.1"
                            min="0"
                            max="150"
                          />
                          <span className="text-sm text-[#b3b3b3]">µg/m³</span>
                        </div>
                      </div>
                      <Slider
                        id="pm25-manual-1"
                        min={0}
                        max={150}
                        step={0.1}
                        value={[pm25]}
                        onValueChange={(value) => setPm25(value[0])}
                        className="[&_[role=slider]]:bg-[#a6a6a6] [&_[role=slider]]:border-[#a6a6a6] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-4">
                        <Label htmlFor="pm25-manual-2" className="text-[#b3b3b3]">
                          PM2.5 (Scenario 2)
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={pm25_2}
                            onChange={(e) => setPm25_2(Number(e.target.value))}
                            className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                            step="0.1"
                            min="0"
                            max="150"
                          />
                          <span className="text-sm text-[#b3b3b3]">µg/m³</span>
                        </div>
                      </div>
                      <Slider
                        id="pm25-manual-2"
                        min={0}
                        max={150}
                        step={0.1}
                        value={[pm25_2]}
                        onValueChange={(value) => setPm25_2(value[0])}
                        className="[&_[role=slider]]:bg-[#ef4444] [&_[role=slider]]:border-[#ef4444] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center gap-4">
                      <Label htmlFor="pm25" className="text-[#b3b3b3]">
                        PM2.5
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={pm25}
                          onChange={(e) => setPm25(Number(e.target.value))}
                          className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                          step="0.1"
                          min="0"
                          max="150"
                        />
                        <span className="text-sm text-[#b3b3b3]">µg/m³</span>
                      </div>
                    </div>
                    <Slider
                      id="pm25"
                      min={0}
                      max={150}
                      step={0.1}
                      value={[pm25]}
                      onValueChange={(value) => setPm25(value[0])}
                      className="[&_[role=slider]]:bg-[#a6a6a6] [&_[role=slider]]:border-[#a6a6a6] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="pm25-last-manual" className="text-[#b3b3b3]">
                      PM2.5 (Last Hour)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={pm25LastHour}
                        onChange={(e) => setPm25LastHour(Number(e.target.value))}
                        className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                        step="0.1"
                        min="0"
                        max="150"
                      />
                      <span className="text-sm text-[#b3b3b3]">µg/m³</span>
                    </div>
                  </div>
                  <Slider
                    id="pm25-last-manual"
                    min={0}
                    max={150}
                    step={0.1}
                    value={[pm25LastHour]}
                    onValueChange={(value) => setPm25LastHour(value[0])}
                    className="[&_[role=slider]]:bg-[#a6a6a6] [&_[role=slider]]:border-[#a6a6a6] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="power-last-manual" className="text-[#b3b3b3]">
                      Power Generated (Last Hour)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={powerLastHour}
                        onChange={(e) => setPowerLastHour(Number(e.target.value))}
                        className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                        step="0.1"
                        min="0"
                        max="800"
                      />
                      <span className="text-sm text-[#b3b3b3]">W/m²</span>
                    </div>
                  </div>
                  <Slider
                    id="power-last-manual"
                    min={0}
                    max={50}
                    step={0.1}
                    value={[powerLastHour]}
                    onValueChange={(value) => setPowerLastHour(value[0])}
                    className="[&_[role=slider]]:bg-[#22c55e] [&_[role=slider]]:border-[#22c55e] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="allsky" className="text-[#b3b3b3]">
                      All-Sky Clearness Index (Kt)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={allskyKt}
                        onChange={(e) => setAllskyKt(Number(e.target.value))}
                        className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                        step="0.01"
                        min="0"
                        max="1"
                      />
                    </div>
                  </div>
                  <Slider
                    id="allsky"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[allskyKt]}
                    onValueChange={(value) => setAllskyKt(value[0])}
                    className="[&_[role=slider]]:bg-[#3b82f6] [&_[role=slider]]:border-[#3b82f6] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="sza" className="text-[#b3b3b3]">
                      Solar Zenith Angle
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={sza}
                        onChange={(e) => setSza(Number(e.target.value))}
                        className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                        step="0.1"
                        min="0"
                        max="90"
                      />
                      <span className="text-sm text-[#b3b3b3]">°</span>
                    </div>
                  </div>
                  <Slider
                    id="sza"
                    min={0}
                    max={90}
                    step={0.1}
                    value={[sza]}
                    onValueChange={(value) => setSza(value[0])}
                    className="[&_[role=slider]]:bg-[#a6a6a6] [&_[role=slider]]:border-[#a6a6a6] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="t2m" className="text-[#b3b3b3]">
                      Temperature at 2m
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={t2m}
                        onChange={(e) => setT2m(Number(e.target.value))}
                        className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                        step="0.1"
                        min="-20"
                        max="50"
                      />
                      <span className="text-sm text-[#b3b3b3]">°C</span>
                    </div>
                  </div>
                  <Slider
                    id="t2m"
                    min={-20}
                    max={50}
                    step={0.1}
                    value={[t2m]}
                    onValueChange={(value) => setT2m(value[0])}
                    className="[&_[role=slider]]:bg-[#ef4444] [&_[role=slider]]:border-[#ef4444] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="t2m-last" className="text-[#b3b3b3]">
                      Temperature at 2m (Last Hour)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={t2mLastHour}
                        onChange={(e) => setT2mLastHour(Number(e.target.value))}
                        className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                        step="0.1"
                        min="-20"
                        max="50"
                      />
                      <span className="text-sm text-[#b3b3b3]">°C</span>
                    </div>
                  </div>
                  <Slider
                    id="t2m-last"
                    min={-20}
                    max={50}
                    step={0.1}
                    value={[t2mLastHour]}
                    onValueChange={(value) => setT2mLastHour(value[0])}
                    className="[&_[role=slider]]:bg-[#ef4444] [&_[role=slider]]:border-[#ef4444] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="ws10m" className="text-[#b3b3b3]">
                      Wind Speed at 10m
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={ws10m}
                        onChange={(e) => setWs10m(Number(e.target.value))}
                        className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                        step="0.1"
                        min="0"
                        max="20"
                      />
                      <span className="text-sm text-[#b3b3b3]">m/s</span>
                    </div>
                  </div>
                  <Slider
                    id="ws10m"
                    min={0}
                    max={20}
                    step={0.1}
                    value={[ws10m]}
                    onValueChange={(value) => setWs10m(value[0])}
                    className="[&_[role=slider]]:bg-[#22c55e] [&_[role=slider]]:border-[#22c55e] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="power-factor" className="text-[#b3b3b3]">
                      Power Factor (Last Hour)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={powerFactorLastHour}
                        onChange={(e) => setPowerFactorLastHour(Number(e.target.value))}
                        className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                        step="0.01"
                        min="0"
                        max="1"
                      />
                    </div>
                  </div>
                  <Slider
                    id="power-factor"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[powerFactorLastHour]}
                    onValueChange={(value) => setPowerFactorLastHour(value[0])}
                    className="[&_[role=slider]]:bg-[#3b82f6] [&_[role=slider]]:border-[#3b82f6] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-4">
                    <Label htmlFor="surface-irradiance" className="text-[#b3b3b3]">
                      Surface Downwards Irradiance
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={surfaceIrradiance}
                        onChange={(e) => setSurfaceIrradiance(Number(e.target.value))}
                        className="w-20 h-8 bg-[#1a1a1a] border-white/20 text-white text-sm text-right"
                        step="1"
                        min="0"
                        max="1200"
                      />
                      <span className="text-sm text-[#b3b3b3]">W/m²</span>
                    </div>
                  </div>
                  <Slider
                    id="surface-irradiance"
                    min={0}
                    max={1200}
                    step={1}
                    value={[surfaceIrradiance]}
                    onValueChange={(value) => setSurfaceIrradiance(value[0])}
                    className="[&_[role=slider]]:bg-[#a6a6a6] [&_[role=slider]]:border-[#a6a6a6] [&_[data-slot=slider-range]]:bg-[#a6a6a6]"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-4 text-white">Temporal Context</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hour" className="text-[#b3b3b3]">
                    Hour of Day
                  </Label>
                  <Select value={hour.toString()} onValueChange={(value) => setHour(Number.parseInt(value))}>
                    <SelectTrigger id="hour" className="bg-[#1a1a1a] border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/20">
                      {Array.from({ length: 9 }, (_, i) => i + 8).map((h) => (
                        <SelectItem key={h} value={h.toString()}>
                          {h.toString().padStart(2, "0")}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month" className="text-[#b3b3b3]">
                    Month
                  </Label>
                  <Select value={month.toString()} onValueChange={(value) => setMonth(Number.parseInt(value))}>
                    <SelectTrigger id="month" className="bg-[#1a1a1a] border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/20">
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((m, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Button 
        onClick={handlePredict} 
        disabled={isLoading || isBatchLoading}
        className="w-full mt-6 bg-[#3b82f6] hover:bg-[#2563eb] text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isBatchLoading ? "Processing CSV..." : isLoading ? "Running Prediction..." : uploadedFile ? "Run Batch Prediction" : "Run Prediction"}
      </Button>

      <TimeSeriesChart data={timeSeriesData} />
    </Card>
  )
}
