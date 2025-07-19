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
import { LiveUpdateIndicator } from '@/components/MainPage/LiveUpdateIndicator'
import { Logo } from '@/components/Logo/Logo'
import Link from 'next/link'

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
  const [selectedCategory, setSelectedCategory] = useState('Piłka nożna')

  // Use live games hook instead of static data

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
            <div className="flex items-center space-x-4 cursor-pointer">
              <Logo />
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2 bg-secondary rounded-lg px-3 py-2">
                <Wallet className="h-4 w-4 text-slate-600" />
                <span className="font-semibold">0 zł</span>
              </div>
              <Link href={'/home/logout'}>
                <Button variant="default" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </Link>
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
          {/* Live Games */}
          <div className="space-y-4"></div>
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
