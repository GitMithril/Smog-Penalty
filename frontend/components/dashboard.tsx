"use client"

import { MetricCards } from "@/components/dashboard_components/metric-cards"
import { FeatureImportanceChart } from "@/components/dashboard_components/feature-importance-chart"
import { ActualVsPredictedChart } from "@/components/dashboard_components/actual-vs-predicted-chart"
import { PM25ImpactChart } from "@/components/dashboard_components/pm25-impact-chart"
import { PredictionSimulator } from "@/components/dashboard_components/prediction-simulator"
import { PredictionOutput } from "@/components/dashboard_components/prediction-output"
import { useState } from "react"
import ShaderBackground from "@/components/backgrounds/dashboard_bg"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart2 } from "lucide-react"
import { motion } from "framer-motion"

import { useToast } from "@/hooks/use-toast"

const UI_TRANSPARENCY = "bg-black/60 backdrop-blur-md border-white/10"

export default function SolarPowerDashboard() {
  const { toast } = useToast()
  const [predictedPower, setPredictedPower] = useState(450.2)
  const [predictedPower2, setPredictedPower2] = useState<number | undefined>(undefined)
  const [powerLoss, setPowerLoss] = useState(15.3)
  const [operationalStatus, setOperationalStatus] = useState<"optimal" | "degraded" | "severe">("optimal")
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{ time: string; power: number }>>([])
  const [isPenaltyMode, setIsPenaltyMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePrediction = async (
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
    isPenalty: boolean,
  ) => {
    console.log("handlePrediction called", { values, isLocationMode, isPenalty })
    setIsPenaltyMode(isPenalty)
    setIsLoading(true)

    const fetchPrediction = async (pm25Value: number) => {
      try {
        const payload = {
          is_location_mode: isLocationMode,
          latitude: values.latitude,
          longitude: values.longitude,
          hour: values.hour || 12,
          month: values.month || 6,
          allsky_sfc_sw_dwn: values.surfaceIrradiance,
          allsky_kt: values.allskyKt,
          t2m: values.t2m,
          t2m_lag1: values.t2mLastHour || values.t2m,
          sza: values.sza,
          ws10m: values.ws10m,
          pm25: pm25Value,
          pm25_lag1: values.pm25LastHour || 0,
          ac_power_lag1: values.powerLastHour || 0,
          power_factor_lag1: values.powerFactorLastHour || 0.95
        }

        const response = await fetch('http://127.0.0.1:8000/api/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Prediction failed:', response.status, errorText)
          throw new Error(`Backend error: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        return data.predicted_power
      } catch (error) {
        console.error('Error connecting to backend:', error)
        throw error
      }
    }

    try {
      const power1 = await fetchPrediction(values.pm25)
      setPredictedPower(power1)

      if (isPenalty && values.pm25_2 !== undefined) {
        const power2 = await fetchPrediction(values.pm25_2)
        setPredictedPower2(power2)
      } else {
        setPredictedPower2(undefined)
      }

      const basePower = 800
      const lossPercent = ((basePower - power1) / basePower) * 100

      let status: "optimal" | "degraded" | "severe" = "optimal"
      if (lossPercent > 50) status = "severe"
      else if (lossPercent > 25) status = "degraded"

      setPowerLoss(lossPercent)
      setOperationalStatus(status)

      // Generate time series data (24 hours)
      const newTimeSeriesData = Array.from({ length: 24 }, (_, i) => {
        const hourFactor = i >= 6 && i <= 18 ? Math.sin(((i - 6) / 12) * Math.PI) : 0
        const noise = Math.random() * 0.1 - 0.05
        const power = power1 * hourFactor * (1 + noise)
        return {
          time: `${i}:00`,
          power: Math.max(0, power),
        }
      })
      setTimeSeriesData(newTimeSeriesData)
      
      toast({
        title: "Prediction Successful",
        description: "Solar power output has been estimated.",
      })
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ShaderBackground color="#00a7d1ff" opacity={0.6} />
      </div>
      
      {/* Navigation Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-20 flex items-center justify-between px-6 py-4 max-w-[1400px] mx-auto"
      >
        <Link href="/">
          <Button variant="outline" className={`gap-2 hover:bg-white/10 ${UI_TRANSPARENCY}`}>
            {/* <ArrowLeft className="w-4 h-4" /> */}
            Back to Home
          </Button>
        </Link>
        
        <Button variant="outline" className={`gap-2 hover:bg-white/10 ${UI_TRANSPARENCY}`}>
          <BarChart2 className="w-4 h-4" />
          Visualizations
        </Button>
      </motion.div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-[1400px] px-6 mt-2"
      >
        <div className={`px-6 py-8 rounded-3xl border ${UI_TRANSPARENCY}`}>
          <h1 className="font-semibold text-3xl text-balance leading-tight mb-2">
            Solar Power Prediction under Atmospheric & Pollution Effects
          </h1>
          <p className="text-[#b3b3b3] text-base mb-4">
            LightGBM-based forecasting using meteorological and air quality features
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-[#b3b3b3]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">Model:</span>
              <span>LightGBM Regressor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">Metrics:</span>
              <span>R², RMSE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">Data Source:</span>
              <span>NASA + Local Meteorological Stations</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-[1400px] px-6 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <MetricCards />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          <PM25ImpactChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          <PredictionSimulator onPredict={handlePrediction} timeSeriesData={timeSeriesData} isLoading={isLoading} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
        >
          <PredictionOutput
            predictedPower={predictedPower}
            predictedPower2={predictedPower2}
            powerLoss={powerLoss}
            operationalStatus={operationalStatus}
            isPenaltyMode={isPenaltyMode}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <FeatureImportanceChart />
          <ActualVsPredictedChart />
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
        className={`relative z-10 mt-12 border-t ${UI_TRANSPARENCY}`}
      >
        <div className="mx-auto max-w-[1400px] px-6 py-6">
          <p className="text-center text-sm text-[#b3b3b3]">
            This dashboard is for research and educational purposes. Predictions are based on trained machine learning
            models and available data.
          </p>
        </div>
      </motion.footer>
    </div>
  )
}
