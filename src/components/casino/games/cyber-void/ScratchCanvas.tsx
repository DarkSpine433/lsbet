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
  coverColor = '#1e293b',
  brushSize = 40,
  onReveal,
  isRevealedProp = false,
  threshold = 70,
}: ScratchCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isVisible, setIsVisible] = useState(true)
  const isDrawingRef = useRef(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const isRevealedRef = useRef(false)
  const lastCheckRef = useRef(0)

  // Ref dla callbacka, aby uniknąć problemów z domknięciami w event listenerach
  const onRevealRef = useRef(onReveal)
  useEffect(() => {
    onRevealRef.current = onReveal
  }, [onReveal])

  // Inicjalizacja Canvas - MUSI mieć alpha: true dla destination-out
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!ctx) return

    ctx.fillStyle = coverColor
    ctx.fillRect(0, 0, width, height)

    isRevealedRef.current = false
    setIsVisible(true)
  }, [width, height, coverColor])

  useEffect(() => {
    if (isRevealedProp && !isRevealedRef.current) {
      revealInternal()
    }
  }, [isRevealedProp])

  const revealInternal = () => {
    if (isRevealedRef.current) return
    isRevealedRef.current = true

    // Zapobiegamy dalszemu rysowaniu
    isDrawingRef.current = false
    lastPosRef.current = null

    // Wywołujemy callback rodzica
    if (onRevealRef.current) {
      onRevealRef.current()
    }

    // Natychmiast usuwamy canvas z DOM (bez animacji)
    setIsVisible(false)
  }

  const scratch = (clientX: number, clientY: number) => {
    if (isRevealedRef.current || !isVisible) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const rect = canvas.getBoundingClientRect()
    // Skalowanie współrzędnych okna do rozdzielczości canvasu
    const x = ((clientX - rect.left) / rect.width) * width
    const y = ((clientY - rect.top) / rect.height) * height

    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.lineWidth = brushSize * 2.5 // Bardzo szeroki pędzel

    ctx.beginPath()
    if (lastPosRef.current) {
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
      ctx.lineTo(x, y)
    } else {
      // Jeśli to pierwszy punkt, rysujemy kółko
      ctx.arc(x, y, brushSize * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.stroke()

    lastPosRef.current = { x, y }

    // Sprawdzaj postęp podczas ruchu co 100ms
    const now = Date.now()
    if (now - lastCheckRef.current > 100) {
      checkReveal()
      lastCheckRef.current = now
    }
  }

  const checkReveal = () => {
    if (isRevealedRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data
    let transparent = 0

    // Skanujemy piksele co 512, aby sprawdzić przezroczystość (alpha channel)
    const step = 512
    for (let i = 3; i < pixels.length; i += step) {
      if (pixels[i] < 50) {
        // Jeśli kanał alfa jest bliski zero (przezroczysty)
        transparent++
      }
    }

    const totalSamples = pixels.length / step
    const percent = (transparent / totalSamples) * 100

    if (percent * 1.25 > threshold) {
      revealInternal()
    }
  }

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return

      const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX
      const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY

      scratch(clientX, clientY)
    }

    const handleEnd = () => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false
        lastPosRef.current = null
        checkReveal() // Ostatnie sprawdzenie przy puszczeniu przycisku
      }
    }

    // Globalne listenery – działają nawet jeśli myszka wyjedzie poza zdrapkę
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [width, height, brushSize, threshold, isVisible])

  if (!isVisible) return null

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 cursor-crosshair touch-none z-[50]"
      onMouseDown={(e) => {
        isDrawingRef.current = true
        scratch(e.clientX, e.clientY)
      }}
      onTouchStart={(e) => {
        isDrawingRef.current = true
        scratch(e.touches[0].clientX, e.touches[0].clientY)
      }}
    />
  )
}
