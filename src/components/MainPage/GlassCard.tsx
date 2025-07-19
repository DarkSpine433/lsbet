"use client"

import { Card } from "@/components/ui/card"
import type { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function GlassCard({ children, className = "", delay = 0 }: GlassCardProps) {
  return (
    <Card
      className={`
        backdrop-blur-lg bg-white/10 border border-white/20 
        shadow-xl hover:shadow-2xl transition-all duration-500
        hover:bg-white/20 hover:border-white/30
        transform hover:scale-105 hover:-translate-y-2
        animate-fade-in-up
        ${className}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Card>
  )
}
