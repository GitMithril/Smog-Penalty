"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Generate mock data for 7 days with hourly readings during daylight
const generateData = () => {
  const data = []
  const days = 7
  const hoursPerDay = 24

  for (let day = 0; day < days; day++) {
    for (let hour = 0; hour < hoursPerDay; hour++) {
      if (hour >= 6 && hour <= 18) {
        const timeLabel = `D${day + 1} ${hour}:00`
        const basePower = 400 + Math.sin(((hour - 6) / 12) * Math.PI) * 300
        const noise = (Math.random() - 0.5) * 50
        const actual = Math.max(0, basePower + noise)
        const predicted = Math.max(0, basePower + noise * 0.7)

        data.push({
          time: timeLabel,
          actual: Number.parseFloat(actual.toFixed(1)),
          predicted: Number.parseFloat(predicted.toFixed(1)),
        })
      }
    }
  }

  return data
}

const data = generateData()

export function ActualVsPredictedChart() {
  return (
    <Card className="bg-black/50 backdrop-blur-md border-white/10 p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-1">Actual vs Predicted AC Power</h3>
        <p className="text-sm text-[#b3b3b3]">Recent temporal performance (last 7 days)</p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" tick={{ fill: "#b3b3b3", fontSize: 10 }} interval={20} />
          <YAxis
            stroke="rgba(255,255,255,0.6)"
            tick={{ fill: "#b3b3b3", fontSize: 12 }}
            label={{ value: "AC Power (W/m²)", angle: -90, position: "insideLeft", fill: "#b3b3b3" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#ffffff",
            }}
          />
          <Legend wrapperStyle={{ color: "#b3b3b3" }} iconType="line" />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#22c55e"
            name="Actual Power"
            strokeWidth={2}
            dot={false}
            opacity={0.85}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#3b82f6"
            strokeDasharray="5 5"
            name="Predicted Power"
            strokeWidth={2}
            dot={false}
            opacity={0.85}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
