"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

interface LiveUpdateIndicatorProps {
  show: boolean
  type?: "score" | "odds" | "time" | "status"
}

export function LiveUpdateIndicator({ show, type = "score" }: LiveUpdateIndicatorProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!visible) return null

  const getUpdateText = () => {
    switch (type) {
      case "score":
        return "Score Updated"
      case "odds":
        return "Odds Changed"
      case "time":
        return "Time Updated"
      case "status":
        return "Status Changed"
      default:
        return "Updated"
    }
  }

  return (
    <Badge
      variant="secondary"
      className="absolute top-2 right-2 bg-blue-500 text-white animate-pulse flex items-center space-x-1"
    >
      <Zap className="h-3 w-3" />
      <span className="text-xs">{getUpdateText()}</span>
    </Badge>
  )
}
