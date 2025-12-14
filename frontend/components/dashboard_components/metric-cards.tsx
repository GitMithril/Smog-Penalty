import { Card } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MetricCardsProps {
  sza?: number | null;
  pm25?: number | null;
  onReloadSza?: () => void;
  onReloadPm25?: () => void;
  isLoadingSza?: boolean;
  isLoadingPm25?: boolean;
}

export function MetricCards({ 
  sza = null, 
  pm25 = null, 
  onReloadSza = () => {}, 
  onReloadPm25 = () => {}, 
  isLoadingSza = false, 
  isLoadingPm25 = false 
}: MetricCardsProps) {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinutes = now.getMinutes()

  const cards = [
    {
      label: "Current Hour",
      value: `${currentHour}:${currentMinutes.toString().padStart(2, "0")}`,
      unit: "",
      color: "#3b82f6", // blue
      hasReload: false,
    },
    {
      label: "Current Solar Zenith Angle",
      value: sza !== null ? sza.toFixed(1) : "--",
      unit: "degrees",
      color: "#a855f7", // purple
      hasReload: true,
      onReload: onReloadSza,
      isLoading: isLoadingSza
    },
    {
      label: "Current PM2.5 Reading",
      value: pm25 !== null ? pm25.toFixed(1) : "--",
      unit: "µg/m³",
      color: "#eab308", // yellow
      hasReload: true,
      onReload: onReloadPm25,
      isLoading: isLoadingPm25
    },
  ]

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Current System Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <Card key={index} className="bg-black/50 backdrop-blur-md border-white/10 p-6 relative">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <p className="text-sm text-[#b3b3b3]">{card.label}</p>
                {card.hasReload && (
                  <Button 
                    variant="ghost" 
                    className="h-6 w-6 text-white/50 hover:text-white"
                    onClick={card.onReload}
                    disabled={card.isLoading}
                  >
                    <RefreshCw className={`h-3 w-3 ${card.isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                )}
              </div>
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
