"use client"

import { Card } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

interface TimeSeriesChartProps {
  data: Array<{ time: string; power: number }>
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const isEmpty = data.length === 0

  return (
    <div className="mt-6">
      <h4 className="font-medium text-sm mb-4 text-white">AC Power with Time Graph</h4>
      <Card className="bg-[#1a1a1a] border-white/10 p-4">
        {isEmpty ? (
          <div className="h-[300px] flex items-center justify-center text-[#666]">
            <div className="text-center">
              <p className="text-sm mb-1">No prediction data yet</p>
              <p className="text-xs">Run a prediction to see the time series graph</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#b3b3b3" style={{ fontSize: "12px" }} />
              <YAxis
                stroke="#b3b3b3"
                style={{ fontSize: "12px" }}
                label={{ value: "Power Per Unit Area (W/m2)", angle: -90, position: "insideLeft", fill: "#b3b3b3" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  color: "#fff",
                }}
                labelStyle={{ color: "#b3b3b3" }}
              />
              <Line type="monotone" dataKey="power" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}
