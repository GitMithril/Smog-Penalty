import { Card } from "@/components/ui/card"

export function MetricCards() {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinutes = now.getMinutes()

  const cards = [
    {
      label: "Current Hour",
      value: `${currentHour}:${currentMinutes.toString().padStart(2, "0")}`,
      unit: "",
      color: "#3b82f6", // blue
    },
    {
      label: "Current Solar Zenith Angle",
      value: "32.4",
      unit: "degrees",
      color: "#a855f7", // purple
    },
    {
      label: "Current PM2.5 Reading",
      value: "42.7",
      unit: "µg/m³",
      color: "#eab308", // yellow
    },
  ]

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Current System Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <Card key={index} className="bg-black/50 backdrop-blur-md border-white/10 p-6">
            <div className="space-y-2">
              <p className="text-sm text-[#b3b3b3]">{card.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-3xl" style={{ color: card.color }}>
                  {card.value}
                </span>
                {card.unit && <span className="text-sm text-[#b3b3b3]">{card.unit}</span>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
