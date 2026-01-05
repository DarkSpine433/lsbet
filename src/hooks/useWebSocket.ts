'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface LiveUpdate {
  type: 'score' | 'odds' | 'time' | 'status'
  gameId: string
  data: {
    home?: number
    away?: number
    homeOdds?: number
    drawOdds?: number
    awayOdds?: number
    time?: string
    status?: 'live' | 'upcoming' | 'halftime' | 'finished'
  }
}

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [updates, setUpdates] = useState<LiveUpdate[]>([])
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return

    setIsConnecting(true)
    setError(null)

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      setIsConnecting(false)
    }

    ws.onmessage = (event) => {
      try {
        const update: LiveUpdate = JSON.parse(event.data)
        setUpdates((prev) => [...prev, update])
        setLastUpdate(new Date())
      } catch (err) {
        setError('Failed to parse WebSocket message')
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      setIsConnecting(false)
    }

    ws.onerror = () => {
      setError('WebSocket error')
      setIsConnecting(false)
    }
  }, [url])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
    setIsConnecting(false)
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    isConnecting,
    lastUpdate,
    updates,
    error,
  }
}
