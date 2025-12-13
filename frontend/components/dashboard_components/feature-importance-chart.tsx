"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

const data = [
  { name: "AC Power/m² Lag-1", value: 0.342 },
  { name: "WS10M", value: 0.187 },
  { name: "SZA", value: 0.165 },
  { name: "ALLSKY_SFC_SW_DWN", value: 0.143 },
  { name: "ALLSKY_KT", value: 0.128 },
  { name: "PM25 Lag-1", value: 0.112 },
  { name: "PM25", value: 0.098 },
  { name: "T2M Lag-1", value: 0.087 },
  { name: "T2M", value: 0.076 },
  { name: "Hour_sin", value: 0.065 },
  { name: "power_factor Lag-1", value: 0.054 },
  { name: "Month_cos", value: 0.043 },
  { name: "Hour_cos", value: 0.032 },
  { name: "Month_sin", value: 0.021 },
]

export function FeatureImportanceChart() {
  return (
    <Card className="bg-black/50 backdrop-blur-md border-white/10 p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-1">Model Feature Importance</h3>
        <p className="text-sm text-[#b3b3b3]">LightGBM Feature Importance (Gain)</p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.6)" tick={{ fill: "#b3b3b3", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="rgba(255,255,255,0.6)"
            tick={{ fill: "#b3b3b3", fontSize: 11 }}
            width={150}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#ffffff",
            }}
            formatter={(value: number) => value.toFixed(3)}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${0.9 - index * 0.05})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-[#b3b3b3] mt-4 italic">
        Temporal dependency and atmospheric variables dominate solar power prediction.
      </p>
    </Card>
  )
}
