'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  ClubIcon as Football,
  Trophy,
  Clock,
  TrendingUp,
  Plus,
  Minus,
  X,
  User,
  Wallet,
  Settings,
  Bell,
  Search,
  Filter,
  Wifi,
  LogOut,
} from 'lucide-react'
import { useLiveGames } from '@/hooks/useLiveGames'
import { ConnectionStatus } from '@/components/MainPage/ConnectionStatus'
import { LiveUpdateIndicator } from '@/components/MainPage/LiveUpdateIndicator'
import { Logo } from '@/components/Logo/Logo'

interface Bet {
  id: string
  team: string
  market: string
  odds: number
  stake: number
}

const sportsCategories = [
  { name: 'Piłka nożna', icon: Football, count: 156, active: true },
  { name: 'Koszykówka', icon: Trophy, count: 89 },
  { name: 'Tenis', icon: Trophy, count: 67 },
  { name: 'Baseball', icon: Trophy, count: 45 },
  { name: 'Hokej', icon: Trophy, count: 34 },
  { name: 'Siatkówka', icon: Football, count: 234 },
]

export default function BettingDashboard() {
  const [selectedBets, setSelectedBets] = useState<Bet[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Piłka nożna')

  // Use live games hook instead of static data
  const {
    games: liveGames,
    isConnected,
    isConnecting,
    lastUpdate,
    error,
    isGameRecentlyUpdated,
    connectionStatus,
  } = useLiveGames()

  // Ensure connectionStatus is strictly typed
  const connectionStatusStrict: 'connected' | 'connecting' | 'disconnected' =
    connectionStatus === 'connected' ||
    connectionStatus === 'connecting' ||
    connectionStatus === 'disconnected'
      ? connectionStatus
      : 'disconnected'

  const addBet = (game: any, market: string, odds: number, team: string) => {
    const newBet: Bet = {
      id: `${game.id}-${market}`,
      team,
      market,
      odds,
      stake: 10,
    }

    setSelectedBets((prev) => {
      const existing = prev.find((bet) => bet.id === newBet.id)
      if (existing) {
        return prev
      }
      return [...prev, newBet]
    })
  }

  const removeBet = (betId: string) => {
    setSelectedBets((prev) => prev.filter((bet) => bet.id !== betId))
  }

  const updateStake = (betId: string, stake: number) => {
    setSelectedBets((prev) => prev.map((bet) => (bet.id === betId ? { ...bet, stake } : bet)))
  }

  const calculatePotentialWin = () => {
    return selectedBets.reduce((total, bet) => total + bet.stake * bet.odds, 0)
  }

  const calculateTotalStake = () => {
    return selectedBets.reduce((total, bet) => total + bet.stake, 0)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo />
              <div className="relative">
                <ConnectionStatus status={connectionStatusStrict} lastUpdate={lastUpdate} />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2 bg-secondary rounded-lg px-3 py-2">
                <Wallet className="h-4 w-4 text-slate-600" />
                <span className="font-semibold">0 zł</span>
              </div>
              <Button variant="default" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen">
          <div className="p-4">
            <h2 className="font-semibold text-slate-900 mb-4">Sporty</h2>
            <div className="space-y-1">
              {sportsCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <category.icon className="h-4 w-4" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </button>
              ))}
            </div>

            <Separator className="my-6" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Mecze na żywo i nadchodzące</h1>
              <p className="text-slate-600">Obstawiaj mecze na żywo i nadchodzące wydarzenia</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtruj
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Popularne
              </Button>
            </div>
          </div>

          {/* Live Games */}
          <div className="space-y-4">
            {liveGames.map((game: any) => (
              <Card key={game.id} className="overflow-hidden relative">
                <LiveUpdateIndicator show={isGameRecentlyUpdated(game.id)} />
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border-b">
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={game.status === 'live' ? 'destructive' : 'secondary'}
                        className="flex items-center space-x-1"
                      >
                        {game.status === 'live' ? (
                          <>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span>NA ŻYWO</span>
                          </>
                        ) : game.status === 'halftime' ? (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>PRZERWA</span>
                          </>
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                      </Badge>
                      <span className="text-sm font-medium text-slate-600">{game.league}</span>
                      {isConnected && game.isLive && (
                        <Badge
                          variant="outline"
                          className="text-xs border-green-500 text-green-600"
                        >
                          <Wifi className="h-2 w-2 mr-1" />
                          Dane na żywo
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">
                      {game.status === 'live' || game.status === 'halftime'
                        ? `${game.time}`
                        : game.time}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-900">{game.homeTeam}</span>
                          {game.score && (
                            <span
                              className={`text-2xl font-bold transition-colors duration-300 ${
                                isGameRecentlyUpdated(game.id) ? 'text-blue-600' : 'text-slate-900'
                              }`}
                            >
                              {game.score.home}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{game.awayTeam}</span>
                          {game.score && (
                            <span
                              className={`text-2xl font-bold transition-colors duration-300 ${
                                isGameRecentlyUpdated(game.id) ? 'text-blue-600' : 'text-slate-900'
                              }`}
                            >
                              {game.score.away}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Betting Options with live odds highlighting */}
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className={`flex flex-col items-center p-4 h-auto hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 ${
                          isGameRecentlyUpdated(game.id)
                            ? 'bg-blue-50 border-blue-300 shadow-md'
                            : 'bg-transparent'
                        }`}
                        onClick={() => addBet(game, '1X2', game.homeOdds, game.homeTeam)}
                      >
                        <span className="text-xs text-slate-600 mb-1">1</span>
                        <span className="font-bold text-lg">{game.homeOdds}</span>
                      </Button>

                      {game.drawOdds && (
                        <Button
                          variant="outline"
                          className={`flex flex-col items-center p-4 h-auto hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 ${
                            isGameRecentlyUpdated(game.id)
                              ? 'bg-blue-50 border-blue-300 shadow-md'
                              : 'bg-transparent'
                          }`}
                          onClick={() => addBet(game, '1X2', game.drawOdds!, 'Remis')}
                        >
                          <span className="text-xs text-slate-600 mb-1">X</span>
                          <span className="font-bold text-lg">{game.drawOdds}</span>
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        className={`flex flex-col items-center p-4 h-auto hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 ${
                          isGameRecentlyUpdated(game.id)
                            ? 'bg-blue-50 border-blue-300 shadow-md'
                            : 'bg-transparent'
                        }`}
                        onClick={() => addBet(game, '1X2', game.awayOdds, game.awayTeam)}
                      >
                        <span className="text-xs text-slate-600 mb-1">2</span>
                        <span className="font-bold text-lg">{game.awayOdds}</span>
                      </Button>
                    </div>

                    <div className="flex items-center justify-center mt-4">
                      <Button variant="ghost" size="sm" className="text-blue-600">
                        <Plus className="h-4 w-4 mr-1" />
                        Więcej rynków ({Math.floor(Math.random() * 50) + 20})
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>

        {/* Betting Slip */}
        <aside className="w-80 bg-white border-l border-slate-200 min-h-screen">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Kupon</h2>
              <Badge variant="secondary">{selectedBets.length}</Badge>
            </div>

            {selectedBets.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">
                  Kliknij na kursy, aby dodać wybory do kuponu
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedBets.map((bet) => (
                  <Card key={bet.id} className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900">{bet.team}</p>
                        <p className="text-xs text-slate-600">{bet.market}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm">{bet.odds}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBet(bet.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStake(bet.id, Math.max(1, bet.stake - 5))}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={bet.stake}
                        onChange={(e) => updateStake(bet.id, Number(e.target.value))}
                        className="h-8 text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStake(bet.id, bet.stake + 5)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Łączna stawka:</span>
                    <span className="font-semibold">{calculateTotalStake().toFixed(2)} zł</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Potencjalna wygrana:</span>
                    <span className="font-semibold text-green-600">
                      {calculatePotentialWin().toFixed(2)} zł
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-red-600 to-blue-700 hover:from-red-700 hover:to-blue-800">
                  Postaw zakład
                </Button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
