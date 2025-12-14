"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface PredictionOutputProps {
  predictedPower: number
  predictedPower2?: number // For penalty calculation mode
  powerLoss: number
  operationalStatus: "optimal" | "degraded" | "severe"
  isPenaltyMode?: boolean // To show penalty calculations
}

export function PredictionOutput({
  predictedPower,
  predictedPower2,
  powerLoss,
  operationalStatus,
  isPenaltyMode = false,
}: PredictionOutputProps) {
  const [area, setArea] = useState<number>(0.0)

  const statusConfig = {
    optimal: { color: "#22c55e", label: "Optimal" },
    degraded: { color: "#eab308", label: "Degraded" },
    severe: { color: "#ef4444", label: "Severe" },
  }

  const status = statusConfig[operationalStatus]

  const totalPower = area > 0 ? predictedPower * area / 1000 : null
  const totalPower2 = area > 0 && predictedPower2 ? predictedPower2 * area / 1000 : null
  const powerDifference = isPenaltyMode && predictedPower2 ? Math.abs(predictedPower - predictedPower2) : null

  return (
    <Card className="bg-black/50 backdrop-blur-md border-white/10 p-6">
      <h3 className="font-semibold text-lg mb-6">Prediction Result</h3>

      <div className="space-y-6">
        {isPenaltyMode && predictedPower2 !== undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-[#b3b3b3] mb-2">AC Power Output (Scenario 1)</p>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-4xl" style={{ color: "#3b82f6" }}>
                  {predictedPower.toFixed(1)}
                </span>
                <span className="text-lg text-[#b3b3b3]">W/m²</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-[#b3b3b3] mb-2">AC Power Output (Scenario 2)</p>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-4xl" style={{ color: "#ef4444" }}>
                  {predictedPower2.toFixed(1)}
                </span>
                <span className="text-lg text-[#b3b3b3]">W/m²</span>
              </div>
            </div>

            {powerDifference !== null && (
              <div className="md:col-span-2">
                <p className="text-sm text-[#b3b3b3] mb-2">Power Difference</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-3xl" style={{ color: "#eab308" }}>
                    {powerDifference.toFixed(1)}
                  </span>
                  <span className="text-lg text-[#b3b3b3]">W/m²</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-[#b3b3b3] mb-2">Predicted AC Power Output</p>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-4xl" style={{ color: "#3b82f6" }}>
                {predictedPower.toFixed(1)}
              </span>
              <span className="text-lg text-[#b3b3b3]">W/m²</span>
            </div>
          </div>
        )}

        <div className="border-t border-white/10 pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="area" className="text-[#b3b3b3]">
                Solar Farm Area (Optional)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="area"
                  type="number"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  placeholder="Enter area in m²"
                  className="bg-[#1a1a1a] border-white/20 text-white"
                  step="0.1"
                  min="0"
                />
                <span className="text-sm text-[#b3b3b3] whitespace-nowrap">m²</span>
              </div>
            </div>

            {totalPower !== null && (
              <div className="space-y-4">
                {isPenaltyMode && totalPower2 !== null ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <p className="text-sm text-[#b3b3b3] mb-2">Total Power (Scenario 1)</p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-2xl" style={{ color: "#3b82f6" }}>
                          {totalPower.toFixed(2)}
                        </span>
                        <span className="text-base text-[#b3b3b3]">W</span>
                      </div>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-lg p-4">
                      <p className="text-sm text-[#b3b3b3] mb-2">Total Power (Scenario 2)</p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-2xl" style={{ color: "#ef4444" }}>
                          {totalPower2.toFixed(2)}
                        </span>
                        <span className="text-base text-[#b3b3b3]">W</span>
                      </div>
                    </div>

                    {powerDifference !== null && (
                      <div className="md:col-span-2 bg-[#1a1a1a] rounded-lg p-4">
                        <p className="text-sm text-[#b3b3b3] mb-2">Total Power Difference</p>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-2xl" style={{ color: "#eab308" }}>
                            {(powerDifference * area).toFixed(2)}
                          </span>
                          <span className="text-base text-[#b3b3b3]">W</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <p className="text-sm text-[#b3b3b3] mb-2">Total AC Power Generated</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-3xl" style={{ color: "#22c55e" }}>
                        {totalPower.toFixed(2)}
                      </span>
                      <span className="text-lg text-[#b3b3b3]">KW</span>
                    </div>
                    <p className="text-xs text-[#666] mt-2">
                      = {predictedPower.toFixed(1)} W/m² × {area} m²
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
