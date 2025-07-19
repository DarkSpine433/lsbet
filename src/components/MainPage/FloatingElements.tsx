"use client"

import { useEffect, useState } from "react"

export function FloatingElements() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes with patriotic colors */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-red-400/20 rounded-full blur-xl animate-float-slow" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-red-400/20 to-blue-400/20 rounded-full blur-xl animate-float-medium" />
      <div className="absolute bottom-40 left-20 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-white/20 rounded-full blur-xl animate-float-fast" />
      <div className="absolute bottom-20 right-40 w-24 h-24 bg-gradient-to-br from-red-400/20 to-blue-400/20 rounded-full blur-xl animate-float-slow" />

      {/* Stars pattern for patriotic theme */}
      <div className="absolute top-32 left-1/4 w-4 h-4 bg-white/10 rounded-full animate-pulse-slow" />
      <div
        className="absolute top-64 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse-slow"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-48 left-1/3 w-2 h-2 bg-white/20 rounded-full animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      />

      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 animate-pulse-slow" />
    </div>
  )
}
