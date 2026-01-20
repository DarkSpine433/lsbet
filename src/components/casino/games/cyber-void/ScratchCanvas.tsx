'use client'

import React, { useRef, useEffect, useState } from 'react'

interface ScratchCanvasProps {
  width: number
  height: number
  coverColor?: string
  brushSize?: number
  onReveal?: () => void
  isRevealedProp?: boolean
  threshold?: number
}

export const ScratchCanvas = ({
  width,
  height,
  coverColor = '#0f172a',
  brushSize = 40,
  onReveal,
  isRevealedProp = false,
  threshold = 70,
}: ScratchCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isFullyRevealed, setIsFullyRevealed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Tło zdrapki
    ctx.fillStyle = coverColor
    ctx.fillRect(0, 0, width, height)

    // Tekstura zdrapki (szum)
    ctx.fillStyle = '#1e293b'
    for (let i = 0; i < 800; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2)
    }

    setIsFullyRevealed(false)
  }, [width, height, coverColor])

  useEffect(() => {
    if (isRevealedProp && !isFullyRevealed) {
      revealEverything()
    }
  }, [isRevealedProp])

  const revealEverything = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    setIsFullyRevealed(true)
  }

  const scratch = (x: number, y: number) => {
    if (isFullyRevealed) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, brushSize, 0, 2 * Math.PI)
    ctx.fill()

    checkReveal()
  }

  const checkReveal = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data
    let transparent = 0

    // Co 32 piksel dla optymalizacji
    for (let i = 3; i < pixels.length; i += 32) {
      if (pixels[i] < 128) transparent++
    }

    const percent = (transparent / (pixels.length / 32)) * 100
    if (percent > threshold && !isFullyRevealed) {
      revealEverything()
      if (onReveal) onReveal()
    }
  }

  const handleInput = (e: any) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top
    scratch(x, y)
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`absolute inset-0 cursor-crosshair touch-none transition-opacity duration-500 ${isFullyRevealed ? 'opacity-0' : 'opacity-100'}`}
      onMouseDown={() => setIsDrawing(true)}
      onMouseUp={() => setIsDrawing(false)}
      onMouseMove={(e) => isDrawing && handleInput(e)}
      onTouchStart={() => setIsDrawing(true)}
      onTouchEnd={() => setIsDrawing(false)}
      onTouchMove={(e) => isDrawing && handleInput(e)}
    />
  )
}
