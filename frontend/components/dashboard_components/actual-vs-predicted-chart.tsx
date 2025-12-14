"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDaysInMonth } from "date-fns"
import { cn } from "@/lib/utils"
import { RefreshCw } from "lucide-react"

type ViewMode = "yearly" | "monthly" | "daily"

export function ActualVsPredictedChart() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("yearly")
  
  const [selectedYear, setSelectedYear] = useState<string>("2024")
  const [selectedMonth, setSelectedMonth] = useState<string>("1") // 1-12
  const [selectedDay, setSelectedDay] = useState<string>("1") // 1-31

  const fetchData = async () => {
    setIsLoading(true)
    try {
      let startStr = ""
      let endStr = ""
      let interval = "hour"

      if (viewMode === "yearly") {
        startStr = `${selectedYear}-01-01`
        endStr = `${selectedYear}-12-31`
        interval = "month"
      } else if (viewMode === "monthly") {
        const lastDay = getDaysInMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1))
        startStr = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`
        endStr = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${lastDay}`
        interval = "day"
      } else if (viewMode === "daily") {
        startStr = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${selectedDay.padStart(2, '0')}`
        endStr = `${selectedYear}-${selectedMonth.padStart(2, '0')}-${selectedDay.padStart(2, '0')}`
        interval = "hour"
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/analytics/history?start_date=${startStr}&end_date=${endStr}&interval=${interval}`)
      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }
      
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching historical data:", error)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [viewMode, selectedYear, selectedMonth, selectedDay])

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const daysInMonth = getDaysInMonth(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1))
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString()
  }))

  return (
    <Card className="bg-black/50 backdrop-blur-md border-white/10 p-6">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg mb-1">Historical AC Power</h3>
            <p className="text-sm text-[#b3b3b3]">
              {viewMode === "yearly" && `Average Monthly Power - ${selectedYear}`}
              {viewMode === "monthly" && `Average Daily Power - ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
              {viewMode === "daily" && `Hourly Power - ${selectedDay} ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
            </p>
          </div>
          
          <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-white/10">
            {(["yearly", "monthly", "daily"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all capitalize",
                  viewMode === mode 
                    ? "bg-[#3b82f6] text-white shadow-sm" 
                    : "text-[#b3b3b3] hover:text-white hover:bg-white/5"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[80px] h-8 text-xs bg-[#1a1a1a] border-white/20 text-white">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/20 text-white">
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>

          {(viewMode === "monthly" || viewMode === "daily") && (
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[100px] h-8 text-xs bg-[#1a1a1a] border-white/20 text-white">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/20 text-white h-[200px]">
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {viewMode === "daily" && (
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-[60px] h-8 text-xs bg-[#1a1a1a] border-white/20 text-white">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/20 text-white h-[200px]">
                {days.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button 
            variant="ghost" 
            onClick={fetchData} 
            disabled={isLoading}
            className="h-8 w-8 text-white hover:bg-white/10 ml-auto"
          >
            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="h-[400px] w-full">
        {isLoading && data.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-[#b3b3b3]">
                Loading data...
            </div>
        ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.6)" 
                    tick={{ fill: "#b3b3b3", fontSize: 10 }} 
                    interval={0}
                />
                <YAxis
                    stroke="rgba(255,255,255,0.6)"
                    tick={{ fill: "#b3b3b3", fontSize: 12 }}
                    label={{ value: "AC Power (W/m²)", angle: -90, position: "insideLeft", fill: "#b3b3b3" }}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#ffffff",
                    }}
                />
                <Bar
                    dataKey="power"
                    fill="#5ec1ffff"
                    name="AC Power/m²"
                    radius={[4, 4, 0, 0]}
                    opacity={0.9}
                />
            </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="h-full w-full flex items-center justify-center text-[#b3b3b3]">
                No data available for selected period
            </div>
        )}
      </div>
    </Card>
  )
}
