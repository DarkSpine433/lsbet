"use client"

import { useState, useEffect, useCallback } from "react"
import { useWebSocket, type LiveUpdate } from "./useWebSocket"

export interface Game {
  id: string
  homeTeam: string
  awayTeam: string
  league: string
  time: string
  status: "live" | "upcoming" | "halftime" | "finished"
  score?: { home: number; away: number }
  homeOdds: number
  drawOdds?: number
  awayOdds: number
  isLive?: boolean
  lastUpdated?: Date
}

const initialGames: Game[] = [
  {
    id: "1",
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    league: "Premier League",
    time: "67:32",
    status: "live",
    score: { home: 2, away: 1 },
    homeOdds: 2.45,
    drawOdds: 3.2,
    awayOdds: 2.8,
    isLive: true,
  },
  {
    id: "2",
    homeTeam: "Barcelona",
    awayTeam: "Real Madrid",
    league: "La Liga",
    time: "45:00",
    status: "live",
    score: { home: 1, away: 1 },
    homeOdds: 1.95,
    drawOdds: 3.4,
    awayOdds: 3.75,
    isLive: true,
  },
  {
    id: "3",
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    league: "Bundesliga",
    time: "19:30",
    status: "upcoming",
    homeOdds: 1.65,
    drawOdds: 4.2,
    awayOdds: 4.8,
  },
  {
    id: "4",
    homeTeam: "PSG",
    awayTeam: "Marseille",
    league: "Ligue 1",
    time: "21:00",
    status: "upcoming",
    homeOdds: 1.35,
    drawOdds: 5.2,
    awayOdds: 8.5,
  },
]

export function useLiveGames() {
  const [games, setGames] = useState<Game[]>(initialGames)
  const [recentUpdates, setRecentUpdates] = useState<Map<string, Date>>(new Map())
  const { isConnected, isConnecting, lastUpdate, updates, error } = useWebSocket("ws://localhost:8080/live")

  const applyUpdate = useCallback((update: LiveUpdate) => {
    setGames((prevGames) => {
      return prevGames.map((game) => {
        if (game.id !== update.gameId) return game

        const updatedGame = { ...game, lastUpdated: new Date() }

        switch (update.type) {
          case "score":
            if (update.data.home !== undefined && update.data.away !== undefined) {
              updatedGame.score = {
                home: update.data.home,
                away: update.data.away,
              }
            }
            break
          case "odds":
            if (update.data.homeOdds) updatedGame.homeOdds = update.data.homeOdds
            if (update.data.drawOdds) updatedGame.drawOdds = update.data.drawOdds
            if (update.data.awayOdds) updatedGame.awayOdds = update.data.awayOdds
            break
          case "time":
            if (update.data.time) updatedGame.time = update.data.time
            break
          case "status":
            if (update.data.status) {
              updatedGame.status = update.data.status
              updatedGame.isLive = update.data.status === "live"
            }
            break
        }

        return updatedGame
      })
    })

    // Track recent updates for visual feedback
    setRecentUpdates((prev) => {
      const newMap = new Map(prev)
      newMap.set(update.gameId, new Date())
      return newMap
    })

    // Clear recent update indicator after 3 seconds
    setTimeout(() => {
      setRecentUpdates((prev) => {
        const newMap = new Map(prev)
        newMap.delete(update.gameId)
        return newMap
      })
    }, 3000)
  }, [])

  useEffect(() => {
    if (updates.length > 0) {
      const latestUpdate = updates[updates.length - 1]
      applyUpdate(latestUpdate)
    }
  }, [updates, applyUpdate])

  const isGameRecentlyUpdated = useCallback(
    (gameId: string) => {
      return recentUpdates.has(gameId)
    },
    [recentUpdates],
  )

  return {
    games,
    isConnected,
    isConnecting,
    lastUpdate,
    error,
    isGameRecentlyUpdated,
    connectionStatus: isConnecting ? "connecting" : isConnected ? "connected" : "disconnected",
  }
}
