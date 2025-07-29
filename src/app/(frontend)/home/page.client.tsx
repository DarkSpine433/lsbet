'use client'

import { useEffect, useState, FC, MouseEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Trophy,
  Plus,
  Minus,
  X,
  Wallet,
  Bell,
  LogOut,
  BellRing,
  CheckCircle2,
  ScaleIcon,
  CircleArrowOutUpLeft,
  Share2,
} from 'lucide-react'
import { Logo } from '@/components/Logo/Logo'
import Link from 'next/link'
import { Bet, Category, Media as MediaType } from '@/payload-types'
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
import { placeBetAction } from '@/app/actions/placeBet'

// --- TYPES ---
type SelectedBet = {
  id: string
  eventId: string
  name: string
  stake: number
  odds?: number | null
  category?: string
  logo?: string | MediaType | null
}

type PageClientProps = {
  nickname: string
  categories: Category[]
  bets: Bet[]
  money?: number
}

// ====================================================================
// --- KOMPONENT: Nagłówek Strony (SiteHeader) ---
// ====================================================================
const SiteHeader: FC<{ nickname: string; money?: number; moneySign: string }> = ({
  nickname,
  money,
  moneySign,
}) => {
  const [logoutClicked, setLogoutClicked] = useState(false)
  return (
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
              <PopoverContent className="w-80" side="bottom" align="center">
                <div className="flex flex-col items-center justify-center ">
                  <BellRing className="h-4 w-4" />
                  <p className="text-sm text-slate-600">Brak powiadomień</p>
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
              <Button variant="default" size="sm" onClick={() => setLogoutClicked(true)}>
                {logoutClicked ? (
                  <CircularProgress size={16} className="[&>*]:text-slate-50" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

// ====================================================================
// --- KOMPONENT: Panel Boczny z Kategoriami (CategorySidebar) ---
// ====================================================================
const CategorySidebar: FC<{
  categories: Category[]
  selectedCategory: string
  setLoading: (loading: boolean) => void
}> = ({ categories, selectedCategory, setLoading }) => {
  return (
    <aside className="w-full lg:w-64 lg:shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 ">
      <div className="p-4 sticky left-0 top-16 ">
        <h2 className="font-semibold text-slate-900 mb-4">Sporty</h2>
        <div className="space-y-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/home?category=${category.title}`}
              onClick={() => {
                if (selectedCategory !== category.title) {
                  setLoading(true)
                }
              }}
            >
              <div
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors border cursor-pointer ${selectedCategory === category.title ? 'bg-blue-50 text-blue-700 border-blue-200' : 'hover:bg-slate-50 text-slate-700 border-transparent'}`}
              >
                <div className="flex items-center space-x-3">
                  <Trophy className="h-4 w-4" />
                  <span className="font-medium">{category.title}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Separator className="my-6" />
      </div>
    </aside>
  )
}

// ====================================================================
// --- KOMPONENT: Karta Wydarzenia (EventCard) ---
// ====================================================================
type AddBetDetails = {
  eventId: string
  teamId: string
  teamName: string
  odds?: number | null
  logo?: string | MediaType | null
  category: string
  isBettingDisabled?: boolean
}

const EventCard: FC<{
  bet: Bet
  addBet: (details: AddBetDetails) => void
  handleShare: (bet: Bet, categoryTitle: string) => void
}> = ({ bet, addBet, handleShare }) => {
  const isLive = new Date(bet.starteventdate || '') <= new Date()
  const isBettingDisabled = !!bet.stopbeting || !!bet.endevent
  const categoryTitle =
    typeof bet.category === 'object' && bet.category?.title ? bet.category.title : ''

  return (
    <Card
      key={bet.id}
      className="bg-white shadow-md hover:shadow-xl border border-gray-200/80 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 max-w-4xl mx-auto"
      id={`${categoryTitle}-${bet.id}`}
    >
      <CardHeader className="p-4 sm:p-6 border-b border-gray-200">
        {/* Responsive Header Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Main Info Block */}
          <div className="flex flex-col gap-2">
            <CardTitle className="text-lg sm:text-xl font-extrabold text-slate-800">
              {bet.title}
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${isLive && !bet.endevent ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}
                ></div>
                <span
                  className={`text-xs sm:text-sm font-semibold tracking-wide ${isLive && !bet.endevent ? 'text-red-500' : 'text-gray-500'}`}
                >
                  {isLive && !bet.endevent ? 'LIVE' : bet.endevent ? 'ZAKOŃCZONE' : 'WKRÓTCE'}
                </span>
              </div>
              <CardDescription>
                <Badge
                  variant="secondary"
                  className="px-3 py-1 text-xs sm:text-sm font-medium rounded-full"
                >
                  {bet.starteventdate && formatDateTime(bet.starteventdate, true)}
                </Badge>
              </CardDescription>
            </div>
          </div>
          {/* Share Button Block */}
          <div className="shrink-0 sm:ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleShare(bet, categoryTitle)}
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {bet.team?.map((team) => (
            <div
              key={team.id}
              className={`bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200/80 hover:border-gray-300 transition-colors duration-300 ${bet.endevent && bet.typeofbet === 'win-lose' && team['win-lose'] ? 'border-green-500 bg-green-50' : ''}`}
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
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{team.name}</h3>
                <Badge>Kurs: {team.odds}</Badge>
                <Button
                  size="lg"
                  disabled={isBettingDisabled}
                  onClick={() =>
                    addBet({
                      eventId: bet.id,
                      teamId: team.id,
                      teamName: team.name,
                      odds: team.odds,
                      logo: team.logo,
                      category: categoryTitle,
                      isBettingDisabled: isBettingDisabled,
                    })
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Wybierz drużynę
                </Button>
                {bet.endevent && bet.typeofbet === 'win-lose' && (
                  <Badge
                    className={`mt-2 ${team['win-lose'] ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                  >
                    {team['win-lose'] ? 'WYGRANA' : 'PRZEGRANA'}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        {bet['draw-odds'] && (
          <div className="w-full flex flex-col items-center justify-center mt-6 gap-2">
            <Badge className="mx-auto text-center bg-blue-500">Kurs: {bet['draw-odds']}</Badge>
            <Button
              size="lg"
              disabled={isBettingDisabled}
              className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() =>
                addBet({
                  eventId: bet.id,
                  teamId: 'draw',
                  teamName: 'Remis',
                  odds: bet['draw-odds'],
                  logo: null,
                  category: categoryTitle,
                  isBettingDisabled: isBettingDisabled,
                })
              }
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center space-x-3">
                <span>REMIS</span>
              </span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            </Button>
            {bet.endevent && (
              <Badge
                className={`mt-2 ${bet.typeofbet === 'draw' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
              >
                {bet.typeofbet === 'draw' ? 'WYGRANA' : 'PRZEGRANA'}
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="bg-gray-50/80 p-3 border-t border-gray-200/80">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 ${bet.stopbeting || bet.endevent ? 'bg-red-500' : 'bg-green-500'} rounded-full`}
            ></div>
            <span>
              Zakłady {bet.endevent ? 'Zakończone' : bet.stopbeting ? 'Wstrzymane' : 'Otwarte'}
            </span>
          </span>
          <span className="font-mono">Match ID: {bet.id}</span>
        </div>
      </div>
    </Card>
  )
}

// ====================================================================
// --- KOMPONENT: Kupon Zakładów (BettingSlip) ---
// ====================================================================
interface BettingSlipProps {
  selectedBets: SelectedBet[]
  bets: Bet[]
  removeBet: (id: string) => void
  updateStake: (id: string, stake: number) => void
  calculateTotalStake: () => number
  calculatePotentialWin: () => number
  handlePlaceBet: () => void
  clearBetSlip: () => void
  handleRedirectToEvent: (e: MouseEvent, bet: SelectedBet) => void
  isPlacingBet: boolean
  moneySign: string
}

const BettingSlip: FC<BettingSlipProps> = ({
  selectedBets,
  bets,
  removeBet,
  updateStake,
  calculateTotalStake,
  calculatePotentialWin,
  handlePlaceBet,
  clearBetSlip,
  handleRedirectToEvent,
  isPlacingBet,
  moneySign,
}) => {
  return (
    <aside className="w-full lg:w-96 lg:shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 sticky top-16 h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 text-lg">
            {selectedBets.length > 1 ? 'Kupon AKO' : 'Kupon'}
          </h2>
          <Badge variant="secondary">{selectedBets.length}</Badge>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {selectedBets.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Twój kupon jest pusty</p>
            <p className="text-slate-400 text-xs mt-1">Kliknij na kurs, aby dodać zakład.</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {selectedBets.map((bet) => {
              const isDraw = bet.id.endsWith('-draw')
              const originalEvent = isDraw ? bets.find((b) => b.id === bet.eventId) : null
              const teamNames = originalEvent
                ? originalEvent.team?.map((t) => t.name).join(' vs ')
                : ''
              return (
                <div
                  key={bet.id}
                  className="bg-slate-50 p-3 rounded-lg space-y-3 border border-slate-200/80"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {isDraw ? (
                        <div className="flex items-center justify-center w-8 h-8 bg-slate-200 rounded-full shrink-0 mt-0.5">
                          <ScaleIcon className="h-4 w-4 text-slate-600" />
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
                      <div className="flex-1">
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
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/home?category=${bet.category}#${bet.category}-${bet.eventId}`}
                        onClick={(e) => handleRedirectToEvent(e, bet)}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                        >
                          <CircleArrowOutUpLeft className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBet(bet.id)}
                        className="h-8 w-8 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {selectedBets.length === 1 && (
                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
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
                        className="h-9 text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-slate-200 text-slate-800 focus-visible:ring-1 focus-visible:ring-blue-400"
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
          </div>
        )}
      </div>
      {selectedBets.length > 0 && (
        <div className="p-4 border-t border-slate-200 shrink-0 space-y-4">
          {selectedBets.length > 1 && (
            <div className="space-y-2">
              <label className="font-semibold text-sm text-slate-800">Stawka Kuponu</label>
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
                  className="h-9 text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-slate-200 text-slate-800 focus-visible:ring-1 focus-visible:ring-blue-400"
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
            </div>
          )}
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
          <div>
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
              <AlertDialogContent className="bg-slate-50">
                <AlertDialogHeader className="items-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <AlertDialogTitle className="text-2xl font-bold pt-2 text-slate-800">
                    Twój zakład został przyjęty!
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-center">
                    <p className="text-slate-500">Ewentualna wygrana</p>
                    <p className="text-3xl font-bold text-green-600 py-2">
                      {calculatePotentialWin().toFixed(2)} {moneySign}
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex justify-between items-center border-t border-b py-4">
                  <div className="text-center flex-1">
                    <p className="text-sm text-slate-500">Stawka</p>
                    <p className="font-bold text-slate-800">
                      {calculateTotalStake().toFixed(2)} {moneySign}
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
                    disabled={isPlacingBet}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isPlacingBet ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Potwierdź zakład'
                    )}
                  </AlertDialogAction>
                  <AlertDialogCancel
                    onClick={clearBetSlip}
                    className="w-full mt-0 border-none hover:bg-slate-300 bg-slate-200 hover:text-slate-900 text-slate-800"
                  >
                    Anuluj zakład
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </aside>
  )
}
// ====================================================================
// --- GŁÓWNY KOMPONENT STRONY (PageClient) ---
// ====================================================================
export default function PageClient(props: PageClientProps) {
  const { nickname, categories, bets, money } = props
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') ?? categories[0]?.title,
  )
  const [loading, setLoading] = useState(false)
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const [selectedBets, setSelectedBets] = useState<SelectedBet[]>([])
  const moneySign = '$'

  // This effect handles redirection if the user lands on /home without a category
  useEffect(() => {
    const hasCategoryParam = searchParams.has('category')
    if (!hasCategoryParam && categories.length > 0 && categories[0]?.title) {
      router.replace(`/home?category=${categories[0].title}`)
    }
  }, [searchParams, categories, router])

  // This effect synchronizes the state with the URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') ?? categories[0]?.title
    if (categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl)
    }
    setLoading(false)
  }, [searchParams, categories, selectedCategory, bets])

  // This effect refreshes the server data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 5000)
    return () => clearInterval(interval)
  }, [router])

  const addBet = (betDetails: AddBetDetails) => {
    if (betDetails.isBettingDisabled) {
      toast.error('Zakłady na to wydarzenie są niedostępne.')
      return
    }
    if (selectedBets.some((bet) => bet.eventId === betDetails.eventId)) {
      toast.error('Możesz dodać tylko jeden zakład z danego meczu do kuponu.')
      return
    }
    const newBet: SelectedBet = {
      id: `${betDetails.eventId}-${betDetails.teamId}`,
      eventId: betDetails.eventId,
      name: betDetails.teamName,
      odds: betDetails.odds,
      logo: betDetails.logo,
      category: betDetails.category,
      stake: 10,
    }
    setSelectedBets((prev) => [...prev, newBet])
    toast.success(`Dodano ${betDetails.teamName} do Twojego kuponu!`)
  }

  const removeBet = (betId: string) => {
    setSelectedBets((prev) => prev.filter((bet) => bet.id !== betId))
  }

  const updateStake = (betId: string, stake: number) => {
    const validStake = Math.max(1, stake)
    if (selectedBets.length > 1) {
      setSelectedBets((prev) => prev.map((bet) => ({ ...bet, stake: validStake })))
    } else {
      setSelectedBets((prev) =>
        prev.map((bet) => (bet.id === betId ? { ...bet, stake: validStake } : bet)),
      )
    }
  }

  const calculateTotalStake = () => {
    if (selectedBets.length > 1) {
      return selectedBets[0]?.stake ?? 0
    }
    return selectedBets.reduce((total, bet) => total + bet.stake, 0)
  }

  const calculatePotentialWin = () => {
    if (selectedBets.length > 1) {
      const combinedOdds = selectedBets.reduce((total, bet) => total * (bet.odds ?? 1), 1)
      const stake = selectedBets[0]?.stake ?? 0
      return stake * combinedOdds
    }
    return selectedBets.reduce((total, bet) => total + bet.stake * (bet.odds ?? 0), 0)
  }

  const handlePlaceBet = async () => {
    setIsPlacingBet(true)
    try {
      const result = await placeBetAction(selectedBets)
      if (result.success) {
        toast.success(result.message)
        clearBetSlip()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Wystąpił nieoczekiwany błąd.')
    } finally {
      setIsPlacingBet(false)
    }
  }

  const clearBetSlip = () => {
    setSelectedBets([])
  }

  const handleRedirectToEvent = (e: MouseEvent, bet: SelectedBet) => {
    if (bet.category === selectedCategory) {
      e.preventDefault()
      const element = document.getElementById(`${bet.category}-${bet.eventId}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      setLoading(true)
    }
  }

  const handleShare = async (bet: Bet, categoryTitle: string) => {
    const url = `${window.location.origin}/home?category=${categoryTitle}#${categoryTitle}-${bet.id}`
    const shareData = {
      title: `Zakład na: ${bet.title}`,
      text: `Sprawdź ten zakład na ${bet.title}! Kursy i więcej informacji znajdziesz tutaj:`,
      url: url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link do wydarzenia skopiowany do schowka!')
      }
    } catch (error) {
      console.error('Błąd udostępniania:', error)
      toast.error('Nie udało się udostępnić wydarzenia.')
    }
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <SiteHeader nickname={nickname} money={money} moneySign={moneySign} />

      <div className="flex flex-col lg:flex-row max-w-screen-2xl mx-auto" id="top">
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setLoading={setLoading}
        />

        <main className="flex-1 p-4 min-h-dvh sm:p-6 bg-gray-50 order-first lg:order-none">
          {loading ? (
            <div className="flex justify-center items-center h-full min-h-[400px]">
              <CircularProgress />
            </div>
          ) : (
            <div className="space-y-8 max-w-6xl mx-auto">
              {bets.length > 0 ? (
                bets.map((bet: Bet) => (
                  <EventCard key={bet.id} bet={bet} addBet={addBet} handleShare={handleShare} />
                ))
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700">Brak aktywnych zakładów</h3>
                  <p className="text-slate-500 text-sm mt-2">
                    Aktualnie nie ma aktywnych zakładów w tej kategorii.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        <BettingSlip
          selectedBets={selectedBets}
          bets={bets}
          removeBet={removeBet}
          updateStake={updateStake}
          calculateTotalStake={calculateTotalStake}
          calculatePotentialWin={calculatePotentialWin}
          handlePlaceBet={handlePlaceBet}
          clearBetSlip={clearBetSlip}
          handleRedirectToEvent={handleRedirectToEvent}
          isPlacingBet={isPlacingBet}
          moneySign={moneySign}
        />
      </div>
    </div>
  )
}
