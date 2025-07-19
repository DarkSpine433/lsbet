"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2 } from "lucide-react"

interface ConnectionStatusProps {
  status: "connected" | "connecting" | "disconnected"
  lastUpdate?: Date | null
}

export function ConnectionStatus({ status, lastUpdate }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          icon: Wifi,
          text: "Live",
          variant: "default" as const,
          className: "bg-green-500 hover:bg-green-600 text-white",
        }
      case "connecting":
        return {
          icon: Loader2,
          text: "Connecting",
          variant: "secondary" as const,
          className: "bg-yellow-500 hover:bg-yellow-600 text-white",
        }
      case "disconnected":
        return {
          icon: WifiOff,
          text: "Offline",
          variant: "destructive" as const,
          className: "bg-red-500 hover:bg-red-600 text-white",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={config.variant} className={`flex items-center space-x-1 ${config.className}`}>
        <Icon className={`h-3 w-3 ${status === "connecting" ? "animate-spin" : ""}`} />
        <span>{config.text}</span>
      </Badge>
      {lastUpdate && status === "connected" && (
        <span className="text-xs text-slate-500">Last update: {lastUpdate.toLocaleTimeString()}</span>
      )}
    </div>
  )
}
