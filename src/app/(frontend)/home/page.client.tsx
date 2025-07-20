'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Trophy, Plus, Minus, X, Wallet, Bell, LogOut } from 'lucide-react'
import { Logo } from '@/components/Logo/Logo'
import Link from 'next/link'
import { Bet, Category, Media as MediaType } from '@/payload-types' // Renamed Media to avoid conflict
import { useRouter, useSearchParams } from 'next/navigation'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'

// 1. DEFINED THE NEW TYPE for bets in the bet slip
type SelectedBet = {
  id: string
  name: string
  stake: number
  odds?: number | null
  logo?: string | MediaType | null
}

type PageClientProps = {
  nickname: string
  categories: Category[]
  bets: Bet[]
  money?: number
}

export default function PageClient(props: PageClientProps) {
  const { nickname, categories, bets, money } = props
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') ?? categories[0]?.title,
  )
  // 2. UPDATED THE STATE to use the new SelectedBet[] type
  const [selectedBets, setSelectedBets] = useState<SelectedBet[]>([])

  useEffect(() => {
    // Navigate to the selected category page, only if the category changes
    if (searchParams.get('category') !== selectedCategory) {
      router.push(`/home?category=${selectedCategory}`)
    }
  }, [selectedCategory, router, searchParams])

  const addBet = (team: Bet['team'], stake: number = 10) => {
    if (!team || !team[0]) return

    const { id, name, logo, odds } = team[0]

    // Create a new bet object that matches the `SelectedBet` type
    const newBet: SelectedBet = {
      id: id,
      name: name,
      logo: logo,
      odds: odds,
      stake: stake, // Default stake when adding
    }

    setSelectedBets((prev) => {
      const existing = prev.find((bet) => bet.id === newBet.id)
      if (existing) {
        // If bet already exists, don't add it again
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

  const calculateTotalStake = () => {
    return selectedBets.reduce((total, bet) => total + bet.stake, 0)
  }

  const calculatePotentialWin = () => {
    return selectedBets.reduce((total, bet) => total + bet.stake * (bet.odds ?? 0), 0)
  }

  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-6 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 cursor-pointer">
              <Logo />
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-red-500 to-blue-500 text-white">
                {nickname}
              </Badge>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2 bg-secondary rounded-lg px-3 py-2">
                <Wallet className="h-4 w-4 text-slate-600" />
                <span className="font-semibold">{money}&nbsp;zł</span>
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

      <div className="flex max-w-screen-2xl mx-auto bg-slate-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen">
          <div className="p-4">
            <h2 className="font-semibold text-slate-900 mb-4">Sporty</h2>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.title)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors border ${
                    selectedCategory === category.title
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'hover:bg-slate-50 text-slate-700 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-4 w-4" />
                    <span className="font-medium">{category.title}</span>
                  </div>
                </button>
              ))}
            </div>
            <Separator className="my-6" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50">
          <div className="space-y-8 max-w-6xl mx-auto">
            {bets.map((bet: Bet) => {
              const betDate = new Date(bet.starteventdate || '').toLocaleString('pl-PL', {
                timeZone: 'Europe/Warsaw', // A time zone in UTC+2
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
              const timeInUTC2 = new Date().toLocaleString('pl-PL', {
                timeZone: 'Europe/Warsaw', // A time zone in UTC+2
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
              const isLive = betDate <= timeInUTC2

              return (
                <Card
                  key={bet.id}
                  className="bg-white shadow-md hover:shadow-xl border border-gray-200/80 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 max-w-4xl mx-auto"
                >
                  <CardHeader className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-xl font-extrabold text-slate-800 text-center">
                          {bet.title}
                        </CardTitle>
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isLive && !bet.endevent ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
                          }`}
                        ></div>
                        <span
                          className={`text-sm font-semibold tracking-wide ${
                            isLive && !bet.endevent ? 'text-red-500' : 'text-gray-500'
                          }`}
                        >
                          {isLive && !bet.endevent
                            ? 'LIVE'
                            : bet.endevent
                              ? 'ZAKOŃCZONE'
                              : 'WKRÓTCE'}
                        </span>
                      </div>

                      <CardDescription>
                        <Badge
                          variant="secondary"
                          className="px-3 py-1 text-xs sm:text-sm font-medium rounded-full"
                        >
                          {bet && bet.starteventdate && formatDateTime(bet.starteventdate, true)}
                        </Badge>
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                      {bet.team?.map((team) => (
                        <div
                          key={team.id}
                          className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200/80 hover:border-gray-300 transition-colors duration-300"
                        >
                          <div className="text-center space-y-4">
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden shadow-inner bg-gray-100">
                              <Media
                                key={team.id}
                                resource={team.logo}
                                fill={true}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                imgClassName="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                              {team.name}
                            </h3>
                            <Button
                              size="lg"
                              onClick={() => addBet([team])}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300"
                            >
                              Select Team
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {bet.team && (
                      <div className="mt-6 mx-auto flex justify-center">
                        <Button
                          size="lg"
                          className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <span className="relative flex items-center space-x-3">
                            <span>REMIS</span>
                          </span>
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50/80 p-3 border-t border-gray-200/80">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 ${bet.canbet ? 'bg-red-500' : 'bg-green-500'} rounded-full`}
                        ></div>
                        <span>Zakłady {bet.canbet ? 'Nieaktywne' : 'Aktywne'} </span>
                      </span>
                      <span className="font-mono">Match ID: {bet.id}</span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </main>

        {/* Betting Slip */}
        <aside className="w-96 bg-white border-l border-slate-200 min-h-screen p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 text-lg">Kupon</h2>
            <Badge variant="secondary">{selectedBets.length}</Badge>
          </div>

          {selectedBets.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Twój kupon jest pusty</p>
              <p className="text-slate-400 text-xs mt-1">Kliknij na kurs, aby dodać zakład.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedBets.map((bet) => (
                <div key={bet.id} className="bg-slate-50 p-3 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-inner bg-gray-100 shrink-0">
                        <Media
                          resource={bet.logo}
                          fill={true}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-800 leading-tight">
                          {bet.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Kurs:{' '}
                          <span className="font-bold text-slate-700">
                            {bet.odds?.toFixed(2) ?? 'N/A'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBet(bet.id)}
                      className="h-8 w-8 text-slate-500 hover:bg-red-50 hover:text-red-600 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => updateStake(bet.id, Math.max(1, bet.stake - 10))}
                      className="h-9 w-12 bg-slate-200 text-slate-800 hover:bg-slate-300"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={bet.stake}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (value >= 1) updateStake(bet.id, value)
                      }}
                      className="h-9 text-center font-bold  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-slate-200 text-slate-800   focus-visible:ring-2 focus-visible:ring-blue-200 focus:border-transparent"
                      min="1 "
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => updateStake(bet.id, bet.stake + 10)}
                      className="h-9 w-12 bg-slate-200 text-slate-800 hover:bg-slate-300"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Separator className="!my-4" />

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Łączna stawka:</span>
                  <span className="font-bold text-slate-900">
                    {calculateTotalStake().toFixed(2)} PLN
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Potencjalna wygrana:</span>
                  <span className="font-bold text-lg text-green-600">
                    {calculatePotentialWin().toFixed(2)} PLN
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  size="lg"
                  disabled={selectedBets.length === 0}
                  className="w-full h-12 font-bold text-lg bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  Postaw Zakład
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
