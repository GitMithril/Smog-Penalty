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

const UI_TRANSPARENCY = "bg-black/60 backdrop-blur-md border-white/10"

export default function SolarPowerDashboard() {
  const [predictedPower, setPredictedPower] = useState(450.2)
  const [predictedPower2, setPredictedPower2] = useState<number | undefined>(undefined)
  const [powerLoss, setPowerLoss] = useState(15.3)
  const [operationalStatus, setOperationalStatus] = useState<"optimal" | "degraded" | "severe">("optimal")
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{ time: string; power: number }>>([])
  const [isPenaltyMode, setIsPenaltyMode] = useState(false)

  const handlePrediction = (
    values: {
      pm25: number
      pm25_2?: number
      pm25LastHour?: number
      powerLastHour?: number
      powerFactorLastHour?: number
      allskyKt?: number
      sza?: number
      t2m?: number
      ws10m?: number
      hour?: number
      month?: number
      surfaceIrradiance?: number
    },
    isLocationMode: boolean,
    isPenalty: boolean,
  ) => {
    setIsPenaltyMode(isPenalty)

    const calculatePower = (pm25Value: number) => {
      let calculatedPower: number

      if (isLocationMode) {
        const pm25Impact = Math.exp(-pm25Value / 100)
        const basePower = 800
        calculatedPower = basePower * pm25Impact
      } else {
        const szaFactor = Math.cos(((values.sza || 32.4) * Math.PI) / 180)
        const ktFactor = values.allskyKt || 0.65
        const pm25Impact = Math.exp(-pm25Value / 100)
        const tempFactor = 1 - Math.abs((values.t2m || 25) - 25) / 100
        const hourFactor = (values.hour || 12) >= 8 && (values.hour || 12) <= 16 ? 1 : 0.5
        const irradianceFactor = (values.surfaceIrradiance || 800) / 800
        const powerFactorImpact = values.powerFactorLastHour || 0.95

        const basePower = 800
        calculatedPower =
          basePower * szaFactor * ktFactor * pm25Impact * tempFactor * hourFactor * irradianceFactor * powerFactorImpact
      }

      return Math.max(0, Math.min(800, calculatedPower))
    }

    const power1 = calculatePower(values.pm25)
    setPredictedPower(power1)

    if (isPenalty && values.pm25_2 !== undefined) {
      const power2 = calculatePower(values.pm25_2)
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
  }

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ShaderBackground color="#FFFFFF" opacity={0.5} />
      </div>
      
      {/* Navigation Bar */}
      <div className="relative z-20 flex items-center justify-between px-2 py-4 max-w-[1400px] mx-auto">
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
      </div>

      {/* Header */}
      <header className="relative z-10 mx-auto max-w-[1400px] px-6 mt-2">
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
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-[1400px] px-6 py-6 space-y-6">
        <MetricCards />

        <PM25ImpactChart />

        <PredictionSimulator onPredict={handlePrediction} timeSeriesData={timeSeriesData} />

        <PredictionOutput
          predictedPower={predictedPower}
          predictedPower2={predictedPower2}
          powerLoss={powerLoss}
          operationalStatus={operationalStatus}
          isPenaltyMode={isPenaltyMode}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeatureImportanceChart />
          <ActualVsPredictedChart />
        </div>
      </main>

      {/* Footer */}
      <footer className={`relative z-10 mt-12 border-t ${UI_TRANSPARENCY}`}>
        <div className="mx-auto max-w-[1400px] px-6 py-6">
          <p className="text-center text-sm text-[#b3b3b3]">
            This dashboard is for research and educational purposes. Predictions are based on trained machine learning
            models and available data.
          </p>
        </div>
      </footer>
    </div>
  )
}
