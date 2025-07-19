'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export interface LiveUpdate {
  type: 'score' | 'odds' | 'status' | 'time'
  gameId: string
  data: any
}

export interface WebSocketState {
  isConnected: boolean
  isConnecting: boolean
  lastUpdate: Date | null
  error: string | null
}

export function useWebSocket(url: string) {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    lastUpdate: null,
    error: null,
  })

  const [updates, setUpdates] = useState<LiveUpdate[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Simulate real WebSocket with realistic updates
  const simulateWebSocket = useCallback(() => {
    setState((prev) => ({ ...prev, isConnecting: true }))
    console.log('Simulating WebSocket connection...') // Add this

    // Simulate connection delay
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        lastUpdate: new Date(),
      }))
      console.log('WebSocket connected!') // Add this

      // Start sending realistic updates
      updateIntervalRef.current = setInterval(
        () => {
          const updateTypes = ['score', 'odds', 'time', 'status']
          const gameIds = ['1', '2', '3', '4']
          const randomGameId = gameIds[Math.floor(Math.random() * gameIds.length)]
          const randomType = updateTypes[
            Math.floor(Math.random() * updateTypes.length)
          ] as LiveUpdate['type']

          let updateData: any = {}

          switch (randomType) {
            case 'score':
              updateData = {
                home: Math.floor(Math.random() * 5),
                away: Math.floor(Math.random() * 5),
              }
              break
            case 'odds':
              updateData = {
                homeOdds: +(1.2 + Math.random() * 3).toFixed(2),
                drawOdds: +(2.5 + Math.random() * 2).toFixed(2),
                awayOdds: +(1.5 + Math.random() * 4).toFixed(2),
              }
              break
            case 'time':
              updateData = {
                time: `${Math.floor(Math.random() * 90)}:${Math.floor(Math.random() * 60)
                  .toString()
                  .padStart(2, '0')}`,
              }
              break
            case 'status':
              updateData = {
                status: Math.random() > 0.8 ? 'halftime' : 'live',
              }
              break
          }

          const update: LiveUpdate = {
            type: randomType,
            gameId: randomGameId,
            data: updateData,
          }

          setUpdates((prev) => [...prev.slice(-50), update]) // Keep last 50 updates
          setState((prev) => ({ ...prev, lastUpdate: new Date() }))
        },
        2000 + Math.random() * 3000,
      ) // Random interval between 2-5 seconds
    }, 1000)
  }, [])

  const connect = useCallback(() => {
    if (state.isConnected || state.isConnecting) return

    // In a real implementation, you would use:
    // wsRef.current = new WebSocket(url)
    // For demo purposes, we'll simulate the WebSocket
    simulateWebSocket()
  }, [state.isConnected, state.isConnecting, simulateWebSocket])

  const disconnect = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current)
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    setState({
      isConnected: false,
      isConnecting: false,
      lastUpdate: null,
      error: null,
    })
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(connect, 1000)
  }, [connect, disconnect])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (!state.isConnected && !state.isConnecting && !state.error) {
      reconnectTimeoutRef.current = setTimeout(reconnect, 5000)
    }
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [state.isConnected, state.isConnecting, state.error, reconnect])

  return {
    ...state,
    updates,
    connect,
    disconnect,
    reconnect,
  }
}
