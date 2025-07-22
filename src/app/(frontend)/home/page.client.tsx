'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Trophy, Plus, Minus, X, Wallet, Bell, LogOut, BellRing, CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/Logo/Logo'
import Link from 'next/link'
import { Bet, Category, Media as MediaType } from '@/payload-types' // Renamed Media to avoid conflict
import { useRouter, useSearchParams } from 'next/navigation'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import CircularProgress from '@mui/material/CircularProgress'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// Corrected type definition for a bet in the bet slip
type SelectedBet = {
  id: string // A unique identifier for the bet (e.g., eventId-teamId or eventId-draw)
  eventId: string // The ID of the event/match
  name: string // The name of the bet (e.g., team name or "Draw")
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
  const [loading, setLoading] = useState(true)
  const [selectedBets, setSelectedBets] = useState<SelectedBet[]>([])
  const moneySign = money ? '$' : ''

  useEffect(() => {
    setLoading(false)
  }, [bets])

  useEffect(() => {
    if (searchParams.get('category') !== selectedCategory) {
      router.push(`/home?category=${selectedCategory}`)
    }
  }, [selectedCategory, router, searchParams])

  // Refactored addBet function for clarity and correctness
  const addBet = (betDetails: {
    eventId: string
    teamId: string
    teamName: string
    odds?: number | null
    logo?: string | MediaType | null
    stopBetting?: boolean
  }) => {
    const { eventId, teamId, teamName, odds, logo, stopBetting } = betDetails

    // Prevent adding bet if betting is stopped
    if (stopBetting) {
      toast.error('Zakłady na to wydarzenie są obecnie wstrzymane.')
      return
    }

    // Prevent adding more than one bet for the same event
    if (selectedBets.some((bet) => bet.eventId === eventId)) {
      toast.error('Możesz dodać tylko jeden zakład z danego meczu do kuponu.')
      return
    }

    const newBet: SelectedBet = {
      id: `${eventId}-${teamId}`, // Create a unique ID for the bet
      eventId: eventId,
      name: teamName,
      odds: odds,
      logo: logo,
      stake: 10, // Default stake
    }

    setSelectedBets((prev) => [...prev, newBet])
    toast.success(`Dodano ${teamName} do twojego kuponu!`)
  }

  // removeBet now uses the unique bet ID
  const removeBet = (betId: string) => {
    setSelectedBets((prev) => prev.filter((bet) => bet.id !== betId))
  }

  // updateStake also uses the unique bet ID
  const updateStake = (betId: string, stake: number) => {
    // For combined bets, update all stakes
    if (selectedBets.length > 1) {
      setSelectedBets((prev) => prev.map((bet) => ({ ...bet, stake: Math.max(1, stake) })))
    } else {
      setSelectedBets((prev) =>
        prev.map((bet) => (bet.id === betId ? { ...bet, stake: Math.max(1, stake) } : bet)),
      )
    }
  }

  const calculateTotalStake = () => {
    if (selectedBets.length > 1) {
      // For combined bets, the stake is the same for all, so just take the first one.
      return selectedBets[0]?.stake ?? 0
    }
    // For single bets, sum them up (though there should only be one).
    return selectedBets.reduce((total, bet) => total + bet.stake, 0)
  }

  const calculatePotentialWin = () => {
    if (selectedBets.length > 1) {
      // For combined bets, multiply all odds by the single stake amount.
      const combinedOdds = selectedBets.reduce((total, bet) => total * (bet.odds ?? 1), 1)
      const stake = selectedBets[0]?.stake ?? 0
      return stake * combinedOdds
    }
    // For single bets.
    return selectedBets.reduce((total, bet) => total + bet.stake * (bet.odds ?? 0), 0)
  }

  const handlePlaceBet = () => {
    // Here you would typically handle the API call to place the bet
    console.log('Bet placed:', selectedBets)
    // After successfully placing the bet, you might want to clear the slip
  }

  const clearBetSlip = () => {
    setSelectedBets([])
  }

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 cursor-pointer">
              <Logo />
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge className="bg-gradient-to-r from-red-500 to-blue-500 text-white hidden sm:inline-flex">
                {nickname}
              </Badge>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" side="bottom" align="end">
                  <div className="flex flex-col items-center justify-center ">
                    <BellRing className="h-4 w-4" />
                    <p className="text-sm text-slate-600">Brak powiadomien</p>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex items-center space-x-2 bg-secondary rounded-lg px-3 py-2">
                <Wallet className="h-4 w-4 text-slate-600" />
                <span className="font-semibold text-sm">
                  {money}&nbsp;{moneySign}
                </span>
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

      {/* Main layout container */}
      <div className="flex flex-col lg:flex-row max-w-screen-2xl mx-auto">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 lg:shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200">
          <div className="p-4">
            <h2 className="font-semibold text-slate-900 mb-4">Sporty</h2>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    if (selectedCategory !== category.title) {
                      setLoading(true)
                      setSelectedCategory(category.title)
                    }
                  }}
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
        <main className="flex-1 p-4 min-h-dvh sm:p-6 bg-gray-50 order-first lg:order-none">
          {loading ? (
            <div className="flex justify-center items-center h-full min-h-[400px]">
              <CircularProgress />
            </div>
          ) : (
            <div className="space-y-8 max-w-6xl mx-auto">
              {bets.length > 0 ? (
                bets.map((bet: Bet) => {
                  const betDate = new Date(bet.starteventdate || '').toLocaleString('pl-PL', {
                    timeZone: 'Europe/Warsaw',
                  })
                  const timeInUTC2 = new Date().toLocaleString('pl-PL', {
                    timeZone: 'Europe/Warsaw',
                  })
                  const isLive = betDate <= timeInUTC2

                  return (
                    <Card
                      key={bet.id}
                      className="bg-white shadow-md hover:shadow-xl border border-gray-200/80 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 max-w-4xl mx-auto"
                    >
                      <CardHeader className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg sm:text-xl font-extrabold text-slate-800">
                              {bet.title}
                            </CardTitle>
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                isLive && !bet.endevent ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
                              }`}
                            ></div>
                            <span
                              className={`text-xs sm:text-sm font-semibold tracking-wide ${
                                isLive && !bet.endevent ? 'text-red-500' : 'text-gray-500'
                              }`}
                            >
                              {isLive && !bet.endevent
                                ? 'LIVE'
                                : bet.endevent
                                  ? 'ZAKOŃCZONE'
                                  : 'WKRÓTCE'}
                            </span>
                          </div>

                          <CardDescription>
                            <Badge
                              variant="secondary"
                              className="px-3 py-1 text-xs sm:text-sm font-medium rounded-full"
                            >
                              {bet &&
                                bet.starteventdate &&
                                formatDateTime(bet.starteventdate, true)}
                            </Badge>
                          </CardDescription>
                        </div>
                      </CardHeader>

                      <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                          {bet.team?.map((team) => (
                            <div
                              key={team.id}
                              className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200/80 hover:border-gray-300 transition-colors duration-300"
                            >
                              <div className="text-center space-y-4">
                                <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden shadow-inner bg-gray-100">
                                  <Media
                                    resource={team.logo}
                                    fill={true}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    imgClassName="w-full h-full object-cover"
                                  />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                                  {team.name}
                                </h3>
                                <Badge>Kurs: {team.odds}</Badge>
                                <Button
                                  size="lg"
                                  disabled={!!bet.stopbeting}
                                  onClick={() =>
                                    addBet({
                                      eventId: bet.id,
                                      teamId: team.id,
                                      teamName: team.name,
                                      odds: team.odds,
                                      logo: team.logo,
                                      stopBetting: !!bet.stopbeting,
                                    })
                                  }
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Select Team
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {bet.team && (
                          <div className="w-full flex flex-col items-center justify-center mt-4 gap-2">
                            <Badge className="mx-auto text-center bg-blue-500">
                              Kurs: {bet['draw-odds']}
                            </Badge>
                            <Button
                              size="lg"
                              disabled={!!bet.stopbeting}
                              className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() =>
                                addBet({
                                  eventId: bet.id,
                                  teamId: 'draw', // Use 'draw' as a unique identifier for this bet type
                                  teamName: 'Remis', // "Draw" in Polish
                                  odds: bet['draw-odds'],
                                  logo: null, // No logo for a draw
                                  stopBetting: !!bet.stopbeting,
                                })
                              }
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
                              className={`w-2 h-2 ${
                                bet.stopbeting ? 'bg-red-500' : 'bg-green-500'
                              } rounded-full`}
                            ></div>
                            <span>Zakłady {bet.stopbeting ? 'Wstrzymane' : 'Otwarte'} </span>
                          </span>
                          <span className="font-mono">Match ID: {bet.id}</span>
                        </div>
                      </div>
                    </Card>
                  )
                })
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700">Brak aktywnych zakładów</h3>
                  <p className="text-slate-500 text-sm mt-2">
                    Aktualnie nie ma aktywnych zakładów w tej kategorii.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Betting Slip */}
        <aside className="w-full lg:w-96 lg:shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 space-y-4">
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
              {selectedBets.map((bet) => {
                const isDraw = bet.id.endsWith('-draw')
                // Find the original event to get team names for the draw.
                const originalEvent = isDraw ? bets.find((b) => b.id === bet.eventId) : null
                const teamNames = originalEvent
                  ? originalEvent.team?.map((t) => t.name).join(' i ')
                  : ''

                return (
                  <div key={bet.id} className="bg-slate-50 p-3 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isDraw ? (
                          <div className="flex items-center justify-center w-8 h-8 bg-slate-200 rounded-full shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="text-slate-500"
                              viewBox="0 0 16 16"
                            >
                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                              <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-inner bg-gray-100 shrink-0">
                            <Media
                              resource={bet.logo}
                              fill={true}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm text-slate-800 leading-tight">
                            {bet.name}
                          </p>
                          {isDraw && teamNames && (
                            <p className="text-xs text-slate-500">{teamNames}</p>
                          )}
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
                    {selectedBets.length <= 1 && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => updateStake(bet.id, bet.stake - 10)}
                          className="h-9 w-12 bg-slate-200 text-slate-800 hover:bg-slate-300"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={bet.stake}
                          onChange={(e) => updateStake(bet.id, Number(e.target.value))}
                          className="h-9 text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-slate-200 text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-200 focus:border-transparent"
                          min="1"
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
                    )}
                  </div>
                )
              })}
              {selectedBets.length > 1 && (
                <>
                  <p className="font-semibold text-sm text-slate-800 pt-2">Kupon Łączony</p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => updateStake('combined', (selectedBets[0]?.stake ?? 10) - 10)}
                      className="h-9 w-12 bg-slate-200 text-slate-800 hover:bg-slate-300"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={selectedBets[0]?.stake ?? 10}
                      onChange={(e) => updateStake('combined', Number(e.target.value))}
                      className="h-9 text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-slate-200 text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-200 focus:border-transparent"
                      min="1"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => updateStake('combined', (selectedBets[0]?.stake ?? 0) + 10)}
                      className="h-9 w-12 bg-slate-200 text-slate-800 hover:bg-slate-300"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
              <Separator className="!my-4" />
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Łączna stawka:</span>
                  <span className="font-bold text-slate-900">
                    {calculateTotalStake().toFixed(2)} {moneySign}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Potencjalna wygrana:</span>
                  <span className="font-bold text-lg text-green-600">
                    {calculatePotentialWin().toFixed(2)} {moneySign}
                  </span>
                </div>
              </div>
              <div className="pt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="lg"
                      disabled={selectedBets.length === 0}
                      className="w-full h-12 font-bold text-lg bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                      Postaw Zakład
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader className="items-center">
                      <div className="rounded-full bg-green-100 p-3">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                      <AlertDialogTitle className="text-2xl font-bold pt-2">
                        Twój zakład został przyjęty!
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-center">
                        <p className="text-slate-500">Ewentualna wygrana</p>
                        <p className="text-3xl font-bold text-slate-800 py-2">
                          {calculatePotentialWin().toFixed(2)} zł
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-between items-center border-t border-b py-4">
                      <div className="text-center flex-1">
                        <p className="text-sm text-slate-500">Stawka</p>
                        <p className="font-bold text-slate-800">
                          {calculateTotalStake().toFixed(2)} zł
                        </p>
                      </div>
                      <div className="border-l h-10"></div>
                      <div className="text-center flex-1">
                        <p className="text-sm text-slate-500">Kurs</p>
                        <p className="font-bold text-slate-800">
                          {(calculatePotentialWin() / (calculateTotalStake() || 1)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
                      <AlertDialogAction
                        onClick={handlePlaceBet}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        Zamknij
                      </AlertDialogAction>
                      <AlertDialogCancel
                        onClick={clearBetSlip}
                        className="w-full mt-0 border-none hover:bg-slate-100"
                      >
                        Postaw ponownie
                      </AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
