"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

// Generate data showing exponential decay of power with PM2.5
const generateData = () => {
  const data = []
  for (let pm25 = 0; pm25 <= 150; pm25 += 5) {
    const power = 700 * Math.exp(-pm25 / 100)
    data.push({
      pm25,
      power: Number.parseFloat(power.toFixed(1)),
    })
  }
  return data
}

const data = generateData()
const currentPM25 = 42.7

export function PM25ImpactChart() {
  return (
    <Card className="bg-[#121212] border-white/10 p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-1">Impact of PM2.5 on Solar Power Output</h3>
        <p className="text-sm text-[#b3b3b3]">Sensitivity analysis showing degradation under high pollution</p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="pm25"
            stroke="rgba(255,255,255,0.6)"
            tick={{ fill: "#b3b3b3", fontSize: 12 }}
            label={{ value: "PM2.5 (µg/m³)", position: "insideBottom", offset: -5, fill: "#b3b3b3" }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.6)"
            tick={{ fill: "#b3b3b3", fontSize: 12 }}
            label={{ value: "Predicted AC Power (W/m²)", angle: -90, position: "insideLeft", fill: "#b3b3b3" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#ffffff",
            }}
          />
          <ReferenceLine
            x={currentPM25}
            stroke="rgba(255,255,255,0.8)"
            strokeDasharray="3 3"
            label={{
              value: "Current PM2.5",
              position: "top",
              fill: "#ffffff",
              fontSize: 12,
            }}
          />
          <Line type="monotone" dataKey="power" stroke="#eab308" strokeWidth={3} dot={false} opacity={0.85} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-[#b3b3b3] mt-4 italic">
        Power output asymptotically approaches zero due to aerosol scattering and absorption.
      </p>
    </Card>
  )
}
