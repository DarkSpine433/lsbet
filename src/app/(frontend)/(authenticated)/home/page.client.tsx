'use client'

import { useEffect, useState, FC, MouseEvent, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Trophy,
  Plus,
  Minus,
  X,
  CheckCircle2,
  ScaleIcon,
  CircleArrowOutUpLeft,
  Share2,
  Ticket,
  ListFilter,
  Zap,
  ImageIcon,
  ZapOff,
} from 'lucide-react'
import Link from 'next/link'
import { Bet, Category, Media as MediaType } from '@/payload-types'
import { useRouter, useSearchParams } from 'next/navigation'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import CircularProgress from '@mui/material/CircularProgress'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { placeBetAction } from '@/app/actions/placeBet'
import { Separator } from '@/components/ui/separator'
import { ImagePlaceholder, isValidMedia } from '@/components/ImagePlaceholder'

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

type AddBetDetails = {
  eventId: string
  teamId: string
  teamName: string
  odds?: number | null
  logo?: string | MediaType | null
  category: string
  isBettingDisabled?: boolean
}

type BettingSlipProps = {
  selectedBets: SelectedBet[]
  bets: Bet[]
  removeBet: (betId: string) => void
  updateStake: (betId: string, stake: number | string) => void
  calculateTotalStake: () => number
  calculatePotentialWin: () => number
  handlePlaceBet: (closeDialog: () => void) => Promise<void>
  clearBetSlip: () => void
  handleRedirectToEvent: (e: MouseEvent, bet: SelectedBet) => void
  isPlacingBet: boolean
  moneySign: string
  lastUpdated: Date | null
}

// ====================================================================
// --- COMPONENT: CategorySidebar (DARK) ---
// ====================================================================
const CategorySidebar: FC<{
  categories: Category[]
  selectedCategory: string
  setLoading: (loading: boolean) => void
  onCategorySelect?: () => void
}> = ({ categories, selectedCategory, setLoading, onCategorySelect }) => {
  return (
    <div className="p-4 pt-6">
      <h2 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-6 px-2">
        Dyscypliny
      </h2>
      <div className="space-y-1">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/home?category=${category.title}`}
            onClick={() => {
              if (selectedCategory !== category.title) {
                setLoading(true)
              }
              onCategorySelect?.()
            }}
          >
            <div
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 border cursor-pointer ${
                selectedCategory === category.title
                  ? 'bg-blue-600/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  : 'hover:bg-slate-800/50 text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Trophy
                  className={`h-4 w-4 ${selectedCategory === category.title ? 'text-blue-400' : 'text-slate-500'}`}
                />
                <span className="font-bold text-sm tracking-tight">{category.title}</span>
              </div>
              {selectedCategory === category.title && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ====================================================================
// --- COMPONENT: EventCard (DARK) ---
// ====================================================================
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
      className="bg-slate-900 border-slate-800 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-700 max-w-4xl mx-auto"
      id={`${categoryTitle}-${bet.id}`}
    >
      <CardHeader className="p-4 sm:p-6 border-b border-slate-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-lg sm:text-xl font-black text-white italic tracking-tight">
              {bet.title}
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${isLive && !bet.endevent ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-slate-600'}`}
                />
                <span
                  className={`text-[10px] font-black tracking-[0.2em] uppercase ${isLive && !bet.endevent ? 'text-red-500' : 'text-slate-500'}`}
                >
                  {isLive && !bet.endevent ? 'LIVE' : bet.endevent ? 'ZAKOŃCZONE' : 'WKRÓTCE'}
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-slate-800 text-slate-400 bg-slate-800/30 text-[10px] uppercase tracking-widest px-3"
              >
                {bet.starteventdate && formatDateTime(bet.starteventdate, true)}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleShare(bet, categoryTitle)}
            className="text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <div className="p-4 sm:p-6 bg-gradient-to-b from-slate-900 to-[#020617]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {bet.team?.map((team) => (
            <div
              key={team.id}
              className={`group relative bg-slate-800/30 rounded-2xl p-6 border transition-all duration-300 ${
                bet.endevent && bet.typeofbet === 'win-lose' && team['win-lose']
                  ? 'border-green-500/50 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.05)]'
                  : 'border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
            >
              <div className="text-center space-y-4">
                <div className="relative w-20 h-20 mx-auto rounded-full p-1 bg-gradient-to-tr from-slate-800 to-slate-700 shadow-inner">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                    {/* ZMIANA: Rygorystyczne sprawdzanie poprawności URL */}
                    {isValidMedia(team.logo) ? (
                      <Media
                        resource={team.logo}
                        fill={true}
                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <ImagePlaceholder title={team.name} className="w-full h-full rounded-full" />
                    )}
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors">
                  {team.name}
                </h3>
                <div className="inline-block px-4 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 font-black text-sm">
                  {team.odds}
                </div>
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
                      isBettingDisabled,
                    })
                  }
                  className="w-full bg-slate-800 hover:bg-blue-600 text-white font-black py-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-all duration-300 disabled:opacity-30"
                >
                  WYBIERZ
                </Button>
                {bet.endevent && bet.typeofbet === 'win-lose' && (
                  <Badge
                    className={`mt-2 ${team['win-lose'] ? 'bg-green-600' : 'bg-red-600'} text-white border-none font-bold uppercase text-[10px]`}
                  >
                    {team['win-lose'] ? 'WYGRANA' : 'PRZEGRANA'}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {bet['draw-odds'] && (
          <div className="w-full flex flex-col items-center justify-center mt-8 gap-3 border-t border-slate-800 pt-6">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Opcja Remisu
            </div>
            <Button
              size="lg"
              disabled={isBettingDisabled}
              className="group relative bg-slate-800 hover:bg-slate-700 text-white font-black py-4 px-12 rounded-xl border border-slate-700 transition-all duration-300 disabled:opacity-30"
              onClick={() =>
                addBet({
                  eventId: bet.id,
                  teamId: 'draw',
                  teamName: 'Remis',
                  odds: bet['draw-odds'],
                  logo: null,
                  category: categoryTitle,
                  isBettingDisabled,
                })
              }
            >
              <span className="flex items-center gap-3">
                <ScaleIcon className="h-4 w-4 text-slate-400 group-hover:text-blue-400" />
                REMIS: <span className="text-blue-400">{bet['draw-odds']}</span>
              </span>
            </Button>
          </div>
        )}
      </div>
      <div className="bg-[#020617] p-3 border-t border-slate-800/50">
        <div className="flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          <span className="flex items-center space-x-2">
            <div
              className={`w-1.5 h-1.5 ${bet.stopbeting || bet.endevent ? 'bg-red-500' : 'bg-green-500'} rounded-full shadow-sm`}
            />
            <span>
              Zakłady {bet.endevent ? 'Zakończone' : bet.stopbeting ? 'Wstrzymane' : 'Otwarte'}
            </span>
          </span>
          <span className="opacity-50">ID: {bet.id}</span>
        </div>
      </div>
    </Card>
  )
}

// ====================================================================
// --- COMPONENT: BettingSlip (DARK) ---
// ====================================================================
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
  lastUpdated,
}) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  return (
    <aside className="p-4 h-full flex flex-col bg-slate-900">
      <div className="border-b border-slate-800 shrink-0 pb-6 pt-2">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-blue-500" />
            <h2 className="font-black text-white text-lg tracking-tight italic">
              {selectedBets.length > 1 ? 'KUPON AKO' : 'TWÓJ KUPON'}
            </h2>
          </div>
          <Badge className="bg-blue-600 text-white font-black rounded-lg px-2 py-0.5">
            {selectedBets.length}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-1 space-y-3 custom-scrollbar">
        {selectedBets.length === 0 ? (
          <div className="text-center py-20 px-4 h-full flex flex-col justify-center items-center">
            <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <Zap className="h-8 w-8 text-slate-600" />
            </div>
            <p className="text-slate-300 text-sm font-bold uppercase tracking-tighter">
              Brak selekcji
            </p>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              Wybierz kurs, aby przygotować swój zakład.
            </p>
          </div>
        ) : (
          selectedBets.map((bet) => (
            <div
              key={bet.id}
              className="bg-slate-800/40 p-4 rounded-2xl space-y-4 border border-slate-800 group hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                    {/* ZMIANA: Rygorystyczne sprawdzanie poprawności URL w kuponie */}
                    {isValidMedia(bet.logo) ? (
                      <Media
                        resource={bet.logo}
                        fill={true}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImagePlaceholder title={bet.name} className="w-full h-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white leading-tight">{bet.name}</p>
                    <p className="text-[11px] font-bold text-blue-500 mt-1 uppercase tracking-widest">
                      Kurs: {bet.odds?.toFixed(2) ?? 'N/A'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBet(bet.id)}
                  className="h-7 w-7 text-slate-600 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {selectedBets.length === 1 && (
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/50">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => updateStake(bet.id, (bet.stake || 0) - 10)}
                    className="h-8 w-10 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={bet.stake || ''}
                    onChange={(e) => updateStake(bet.id, e.target.value)}
                    className="h-8 bg-slate-900 border-slate-700 text-white text-center font-bold text-sm focus:ring-blue-500/50"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => updateStake(bet.id, (bet.stake || 0) + 10)}
                    className="h-8 w-10 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedBets.length > 0 && (
        <div className="pt-6 border-t border-slate-800 shrink-0 space-y-6">
          {selectedBets.length > 1 && (
            <div className="space-y-3 bg-slate-800/20 p-4 rounded-2xl border border-slate-800">
              <label className="font-bold text-xs text-slate-500 uppercase tracking-widest px-1">
                Stawka Łączna
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => updateStake('combined', (selectedBets[0]?.stake ?? 0) - 10)}
                  className="bg-slate-800 hover:bg-slate-700 border-slate-700 h-10 w-12 text-white"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={selectedBets[0]?.stake || ''}
                  onChange={(e) => updateStake('combined', e.target.value)}
                  className="bg-slate-900 border-slate-700 h-10 text-center font-black text-white"
                />
                <Button
                  onClick={() => updateStake('combined', (selectedBets[0]?.stake ?? 0) + 10)}
                  className="bg-slate-800 hover:bg-slate-700 border-slate-700 h-10 w-12 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3 px-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-widest">Stawka:</span>
              <span className="font-black text-white">
                {calculateTotalStake().toFixed(2)} {moneySign}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                Do wygrania:
              </span>
              <span className="font-black text-xl text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                {calculatePotentialWin().toFixed(2)} {moneySign}
              </span>
            </div>
          </div>

          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button
                size="lg"
                disabled={selectedBets.length === 0 || calculateTotalStake() <= 0}
                className="w-full h-14 font-black text-lg bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl shadow-blue-600/20 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-600"
              >
                POSTAW ZAKŁAD
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
              <AlertDialogHeader className="items-center pb-4">
                <div className="rounded-full bg-blue-500/10 p-4 mb-2">
                  <CheckCircle2 className="h-10 w-10 text-blue-500" />
                </div>
                <AlertDialogTitle className="text-2xl font-black italic tracking-tight">
                  POTWIERDŹ ZAKŁAD
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400 text-center">
                  Grasz bez podatku! Całość wygranej trafia na Twoje konto.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="bg-slate-800/50 rounded-2xl p-6 mb-4 border border-slate-800">
                <div className="flex justify-between items-center text-center">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      Stawka
                    </p>
                    <p className="text-xl font-black">
                      {calculateTotalStake().toFixed(2)} {moneySign}
                    </p>
                  </div>
                  <div className="h-10 w-px bg-slate-700" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      Potencjał
                    </p>
                    <p className="text-xl font-black text-green-400">
                      {calculatePotentialWin().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <AlertDialogFooter className="sm:flex-col gap-2">
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    handlePlaceBet(() => setIsAlertOpen(false))
                  }}
                  disabled={isPlacingBet}
                  className="w-full bg-blue-600 hover:bg-blue-500 font-black h-12 rounded-xl"
                >
                  {isPlacingBet ? (
                    <CircularProgress size={24} className="text-white" />
                  ) : (
                    'ZATWIERDŹ'
                  )}
                </AlertDialogAction>
                <AlertDialogCancel className="w-full bg-transparent border-slate-800 hover:bg-slate-800 text-slate-400 font-bold h-12 rounded-xl">
                  ANULUJ
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </aside>
  )
}

// ====================================================================
// --- MAIN PAGE COMPONENT (DARK) ---
// ====================================================================
export default function PageClient(props: PageClientProps) {
  const { categories, money } = props
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') ?? categories[0]?.title,
  )
  const [loading, setLoading] = useState(false)
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const [selectedBets, setSelectedBets] = useState<SelectedBet[]>([])
  const [clientMoney, setClientMoney] = useState(money)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [bets, setBets] = useState<Bet[]>(props.bets)
  const moneySign = 'PLN'

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [nextSyncIn, setNextSyncIn] = useState(60)

  // Fetch bets function

  // 1. Funkcja pobierająca dane
  const fetchBets = async (category?: string) => {
    const currentCat = category
      ? category
      : new URLSearchParams(window.location.search).get('category') || ''
    try {
      const res = await fetch(
        `/api/bets?where[or][0][category.title][equals]=${encodeURIComponent(currentCat)}`,
      )
      if (res.ok) {
        const data = await res.json()
        setBets(data.docs || [])
        setLastUpdated(new Date())
        setNextSyncIn(60) // Reset licznika po udanym pobraniu
      }
    } catch (e) {
      console.error('Sync error:', e)
      setNextSyncIn(60) // Reset nawet przy błędzie, by spróbować ponownie
    }
  }
  useEffect(() => {
    // 2. Interwał odliczania (co 1 sekundę)
    const timer = setInterval(() => {
      setNextSyncIn((prev) => {
        if (prev <= 1) {
          fetchBets() // Wywołaj pobieranie danych
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const hasCategoryParam = searchParams.has('category')
    if (!hasCategoryParam && categories.length > 0 && categories[0]?.title) {
      router.replace(`/home?category=${categories[0].title}`)
    }
  }, [searchParams, categories, router])

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') ?? categories[0]?.title
    if (categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl)
      setLoading(true)
      fetchBets(categoryFromUrl).finally(() => setLoading(false))
    }
    setClientMoney(money)
  }, [searchParams, categories, selectedCategory, money])

  // Action handlers (addBet, removeBet, updateStake, etc.) remain functionally same...
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
    toast.success(`Dodano ${betDetails.teamName} do kuponu!`, {
      style: { background: '#0f172a', color: '#fff', border: '1px solid #1e293b' },
    })
  }

  const removeBet = (betId: string) =>
    setSelectedBets((prev) => prev.filter((bet) => bet.id !== betId))

  const updateStake = (betId: string, stake: number | string) => {
    const numericStake = typeof stake === 'string' && stake === '' ? 0 : parseFloat(stake as string)
    const validStake = Math.max(0, isNaN(numericStake) ? 0 : numericStake)
    if (selectedBets.length > 1) {
      setSelectedBets((prev) => prev.map((bet) => ({ ...bet, stake: validStake })))
    } else {
      setSelectedBets((prev) =>
        prev.map((bet) => (bet.id === betId ? { ...bet, stake: validStake } : bet)),
      )
    }
  }

  const calculateTotalStake = () =>
    selectedBets.length > 1
      ? (selectedBets[0]?.stake ?? 0)
      : selectedBets.reduce((t, b) => t + b.stake, 0)
  const calculatePotentialWin = () =>
    selectedBets.length > 1
      ? (selectedBets[0]?.stake ?? 0) * selectedBets.reduce((t, b) => t * (b.odds ?? 1), 1)
      : selectedBets.reduce((t, b) => t + b.stake * (b.odds ?? 0), 0)

  const handlePlaceBet = async (closeDialog: () => void) => {
    setIsPlacingBet(true)
    try {
      const totalStake = calculateTotalStake()
      if (totalStake <= 0) {
        toast.error('Stawka musi być większa niż 0.')
        return
      }
      if ((clientMoney || 0) < totalStake) {
        toast.error('Niewystarczające środki.')
        return
      }
      const result = await placeBetAction(selectedBets)
      if (result.success) {
        toast.success(result.message)
        setClientMoney(parseFloat(((clientMoney || 0) - totalStake).toFixed(2)))
        setSelectedBets([])
        closeDialog()
      } else toast.error(result.message)
    } catch {
      toast.error('Wystąpił nieoczekiwany błąd.')
    } finally {
      setIsPlacingBet(false)
    }
  }

  const handleRedirectToEvent = (e: MouseEvent, bet: SelectedBet) => {
    if (bet.category === selectedCategory) {
      e.preventDefault()
      document
        .getElementById(`${bet.category}-${bet.eventId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else setLoading(true)
  }

  const handleShare = async (bet: Bet, categoryTitle: string) => {
    const url = `${window.location.origin}/home?category=${categoryTitle}#${categoryTitle}-${bet.id}`
    try {
      if (navigator.share) await navigator.share({ title: `Zakład: ${bet.title}`, url })
      else {
        await navigator.clipboard.writeText(url)
        toast.success('Link skopiowany!')
      }
    } catch {
      toast.error('Błąd udostępniania.')
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white">
      {lastUpdated && (
        <Badge
          variant="outline"
          className="fixed top-[67px] left-1/2 -translate-x-1/2   z-40 
               flex items-center gap-2 px-3 py-1.5 
               bg-slate-900/90 backdrop-blur-md border-slate-800 
               shadow-[0_4_20px_rgba(0,0,0,0.4)] transition-all duration-300"
        >
          {/* Pulsująca kropka statusu */}
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>

          <div className="flex items-center gap-2 divide-x divide-slate-800">
            {/* Czas ostatniej synchronizacji */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                Live
              </span>
              <span className="text-[10px] font-bold text-slate-200 tabular-nums">
                {lastUpdated.toLocaleTimeString('pl-PL', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>

            {/* Odliczanie do następnej synchronizacji */}
            <div className="pl-2 flex items-center gap-1">
              <span className="text-[9px] text-slate-500 font-bold uppercase">Next:</span>
              <span className="text-[10px] text-blue-500 font-black tabular-nums w-6">
                {nextSyncIn}s
              </span>
            </div>
          </div>
        </Badge>
      )}
      <div className="flex flex-col xl:flex-row max-w-screen-2xl mx-auto" id="top">
        {/* Sidebar Lewy */}
        <aside className="hidden xl:block xl:w-72 xl:shrink-0 bg-slate-900 border-r border-slate-800/60">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              setLoading={setLoading}
            />
          </div>
        </aside>

        {/* Główny Kontent */}
        <main className="flex-1 p-4 sm:p-8 bg-[#020617] order-first xl:order-none pb-32 xl:pb-8">
          {loading ? (
            <div className="flex justify-center items-center h-[60vh]">
              <CircularProgress className="text-blue-500" />
            </div>
          ) : (
            <div className="space-y-6 max-w-5xl mx-auto">
              {bets.length > 0 ? (
                bets.map((bet: Bet) => (
                  <EventCard key={bet.id} bet={bet} addBet={addBet} handleShare={handleShare} />
                ))
              ) : (
                <div className="text-center py-32 bg-slate-900/40 rounded-[3rem] border border-slate-800 border-dashed">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="h-10 w-10 text-slate-700" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-500 italic tracking-tight">
                    Brak aktywnych wydarzeń
                  </h3>
                  <p className="text-slate-600 font-medium mt-2">
                    Wybierz inną kategorię lub wróć później.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Sidebar Prawy (Kupon) */}
        <aside className="hidden xl:block xl:w-96 xl:shrink-0 bg-slate-900 border-l border-slate-800/60">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            <BettingSlip
              selectedBets={selectedBets}
              bets={bets}
              removeBet={removeBet}
              updateStake={updateStake}
              calculateTotalStake={calculateTotalStake}
              calculatePotentialWin={calculatePotentialWin}
              handlePlaceBet={handlePlaceBet}
              clearBetSlip={() => setSelectedBets([])}
              handleRedirectToEvent={handleRedirectToEvent}
              isPlacingBet={isPlacingBet}
              moneySign={moneySign}
              lastUpdated={lastUpdated}
            />
          </div>
        </aside>

        {/* Mobilny Pasek Dolny */}
        <div className="xl:hidden z-30 fixed bottom-0 left-0 right-0 bg-[#0f172a]/90 backdrop-blur-xl border-t border-slate-800 px-3 pt-1 flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-col h-auto p-2 text-slate-400 hover:text-white"
              >
                <ListFilter className="h-4 w-4 mb-1" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Sporty</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="h-full max-h-[85dvh] bg-slate-900 border-slate-800 text-white flex flex-col p-0">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-black italic">WYBIERZ DYSCYPLINĘ</h2>
              </div>
              <div className="overflow-y-auto px-2 pb-6">
                <CategorySidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setLoading={setLoading}
                  onCategorySelect={() => setIsCategoryDialogOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-col h-auto p-2 relative text-slate-400 hover:text-white"
              >
                <div className="relative">
                  <Ticket className="h-4 w-4 mb-1" />
                  {selectedBets.length > 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-600 rounded-full text-[9px] font-black flex items-center justify-center text-white shadow-lg">
                      {selectedBets.length}
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest">Kupon</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="h-full max-h-[85dvh] bg-slate-900 border-slate-800 text-white flex flex-col p-0">
              <BettingSlip
                selectedBets={selectedBets}
                bets={bets}
                removeBet={removeBet}
                updateStake={updateStake}
                calculateTotalStake={calculateTotalStake}
                calculatePotentialWin={calculatePotentialWin}
                handlePlaceBet={handlePlaceBet}
                clearBetSlip={() => setSelectedBets([])}
                handleRedirectToEvent={handleRedirectToEvent}
                isPlacingBet={isPlacingBet}
                moneySign={moneySign}
                lastUpdated={lastUpdated}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>{' '}
    </div>
  )
}
