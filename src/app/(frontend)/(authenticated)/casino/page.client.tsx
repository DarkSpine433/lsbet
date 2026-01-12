'use client'
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import {
  Trophy,
  Gamepad2,
  PlayCircle,
  Search,
  LayoutGrid,
  AlertCircle,
  Rocket,
  Sparkles,
  Star,
  Clock,
  Heart,
  History,
  CheckCircle2,
} from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Media } from '@/components/Media'
import { motion, AnimatePresence } from 'motion/react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

//####################_Games Imports_#######################//
import SimplyNumbers from '@/components/casino/games/SimplyNumbers'
import JackpotBells from '@/components/casino/games/JackpotBells'
import Simple20 from '@/components/casino/games/Simple20'
import { GameCard } from './GameCard'
import { User } from '@/payload-types'
import { TopWinners } from '@/components/casino/TopWinners'
import CoinFlip from '@/components/casino/games/CoinFlip'

const GAME_COMPONENTS: Record<string, any> = {
  'simply-numbers': SimplyNumbers,
  'jackpot-bells': JackpotBells,
  'simple-20': Simple20,
  'coin-flip': CoinFlip,
}

export default function CasinoClient({
  nickname,
  money,
  user,
}: {
  nickname: string
  money: number
  user: User
}) {
  const router = useRouter()
  const [games, setGames] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [wins, setWins] = useState<any[]>([])
  const [selectedGame, setSelectedGame] = useState<any | null>(null)
  const [currentBalance, setCurrentBalance] = useState(money)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const [favorites, setFavorites] = useState<string[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([])
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)

  const isAdmin = useMemo(() => user?.role === 'admin', [user])

  // Funkcja pomocnicza do sprawdzania czy gra jest nowa (< 7 dni)
  const isNewGame = (publishedAt: string) => {
    if (!publishedAt) return false
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    return new Date().getTime() - new Date(publishedAt).getTime() < sevenDaysInMs
  }

  useEffect(() => {
    const savedFavs = localStorage.getItem('casino_favs')
    const savedRecent = localStorage.getItem('casino_recent')
    if (savedFavs) setFavorites(JSON.parse(savedFavs))
    if (savedRecent) setRecentlyPlayed(JSON.parse(savedRecent))
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const [gamesRes, winsRes, catsRes] = await Promise.all([
        fetch(`/api/casino-games?limit=100&depth=1`),
        fetch(`/api/casino-wins?sort=-createdAt&limit=20&depth=1`),
        fetch(`/api/casino-categories?sort=title&limit=50`),
      ])
      const [gamesData, winsData, catsData] = await Promise.all([
        gamesRes.json(),
        winsRes.json(),
        catsRes.json(),
      ])
      setGames(gamesData?.docs || [])
      setWins(winsData?.docs || [])
      setCategories(catsData?.docs || [])
    } catch (err) {
      console.error('Błąd pobierania danych:', err)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 20000)
    return () => clearInterval(interval)
  }, [fetchData])

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (selectedGame) {
      idleTimerRef.current = setTimeout(() => {
        handleDialogChange(false)
      }, 180000)
    }
  }, [selectedGame])

  useEffect(() => {
    if (selectedGame) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
      events.forEach((evt) => window.addEventListener(evt, resetIdleTimer))
      resetIdleTimer()
      return () => {
        events.forEach((evt) => window.removeEventListener(evt, resetIdleTimer))
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      }
    }
  }, [selectedGame, resetIdleTimer])

  const toggleFavorite = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation()
    const newFavs = favorites.includes(gameId)
      ? favorites.filter((id) => id !== gameId)
      : [...favorites, gameId]
    setFavorites(newFavs)
    localStorage.setItem('casino_favs', JSON.stringify(newFavs))
  }

  const addToRecent = (gameId: string) => {
    const filtered = recentlyPlayed.filter((id) => id !== gameId)
    const newRecent = [gameId, ...filtered].slice(0, 10) // Zwiększono do 10 dla lepszej użyteczności
    setRecentlyPlayed(newRecent)
    localStorage.setItem('casino_recent', JSON.stringify(newRecent))
  }

  const filteredGames = useMemo(() => {
    let filtered = games.filter((game) => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      if (activeCategory === 'favorites') return favorites.includes(game.id)
      if (activeCategory === 'recent') return recentlyPlayed.includes(game.id)
      if (activeCategory === 'new_games') return isNewGame(game.publishedAt)

      const gameCatId = typeof game.category === 'object' ? game.category?.id : game.category
      return activeCategory === 'all' || gameCatId === activeCategory
    })

    // Sortowanie dla kategorii "Ostatnie", aby zachować kolejność grania
    if (activeCategory === 'recent') {
      return filtered.sort((a, b) => recentlyPlayed.indexOf(a.id) - recentlyPlayed.indexOf(b.id))
    }

    return filtered.sort((a, b) => a.title.localeCompare(b.title, 'pl'))
  }, [games, searchQuery, activeCategory, favorites, recentlyPlayed])

  const handleBalanceUpdate = (newBalance: number) => {
    setCurrentBalance(newBalance)
    setHasPlayed(true)
    resetIdleTimer()
  }

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setSelectedGame(null)
      if (hasPlayed) {
        router.refresh()
        setHasPlayed(false)
      }
    }
  }

  const handleGameSelect = (game: any) => {
    setSelectedGame(game)
    addToRecent(game.id)
  }

  const ActiveGame = selectedGame ? GAME_COMPONENTS[selectedGame.slug] : null

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
      <div className="w-full bg-blue-600/10 border-b border-blue-500/20 py-3 overflow-hidden h-12 flex items-center">
        <div className="flex whitespace-nowrap animate-marquee">
          {wins?.length > 0 ? (
            [...wins, ...wins].map((win, i) => {
              const isJackpot = Number(win?.winAmount) >= 500
              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-10 border-r border-slate-800/40 ${isJackpot ? 'bg-yellow-500/5' : ''}`}
                >
                  <Trophy
                    className={`h-3.5 w-3.5 ${isJackpot ? 'text-yellow-400 animate-bounce' : 'text-yellow-500'}`}
                  />
                  <div className="flex flex-col leading-none">
                    <span className="text-white font-black text-[10px] uppercase tracking-tighter">
                      {win?.user?.nickname || win?.user?.email?.split('@')[0] || 'Gracz'}
                      <span className="text-slate-500 font-medium ml-2">w</span>
                      <span className="text-blue-400 ml-1 italic">
                        {win?.gameTitle || 'Kasyno'}
                      </span>
                    </span>
                  </div>
                  <span
                    className={`font-black italic text-[12px] ${isJackpot ? 'text-yellow-400 scale-110 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 'text-green-500'}`}
                  >
                    +{Number(win?.winAmount).toFixed(2)} $
                  </span>
                </div>
              )
            })
          ) : (
            <div className="px-10 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
              Ładowanie danych...
            </div>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <TopWinners />

        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 bg-slate-900/30 p-6 md:p-8 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl">
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <div className="space-y-1">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                ls<span className="text-blue-600">Casino</span>
              </h1>
              <div className="flex items-center gap-2 text-blue-500 font-bold text-[8px] tracking-[0.3em]">
                <div className="h-1 w-1 bg-blue-600 rounded-full animate-pulse" />
                {isAdmin ? 'ADMIN ACCESS' : 'LIVE SYSTEM'}
              </div>
            </div>
            <div className="h-10 w-px bg-slate-800 mx-2 hidden md:block" />
            <div className="hidden md:block">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">
                Zalogowany
              </p>
              <p className="text-white font-black italic uppercase text-sm">{nickname}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full max-w-2xl">
            <div className="relative w-full md:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="SZUKAJ GRY..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border-slate-800 rounded-2xl pl-11 h-12 text-[10px] font-black uppercase focus:ring-blue-600 tracking-widest"
              />
            </div>

            <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto w-full no-scrollbar">
              <button
                onClick={() => setActiveCategory('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:bg-slate-800/50'}`}
              >
                <LayoutGrid className="h-3 w-3" /> Wszystkie
              </button>

              <button
                onClick={() => setActiveCategory('favorites')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${activeCategory === 'favorites' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'text-slate-500 hover:bg-slate-800/50'}`}
              >
                <Heart className={`h-3 w-3 ${favorites.length > 0 ? 'fill-white' : ''}`} /> Ulubione
              </button>

              <button
                onClick={() => setActiveCategory('recent')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${activeCategory === 'recent' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-slate-800/50'}`}
              >
                <History className="h-3 w-3" /> Ostatnie
              </button>

              <button
                onClick={() => setActiveCategory('new_games')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${activeCategory === 'new_games' ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
              >
                <Sparkles className="h-3 w-3" /> Nowe
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800/50'}`}
                >
                  <Gamepad2 className="h-3 w-3" /> {cat.title}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <div key={game.id} className="relative group">
                  {/* Badge dla Nowych Gier */}
                  {isNewGame(game.publishedAt) && (
                    <div className="absolute top-4 left-4 z-20 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.5)] uppercase tracking-tighter">
                      NOWOŚĆ
                    </div>
                  )}

                  {/* Serduszko w PRAWYM GÓRNYM ROGU */}
                  <button
                    onClick={(e) => toggleFavorite(e, game.id)}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <Heart
                      className={`h-3 w-3 ${favorites.includes(game.id) ? 'fill-red-500 text-red-500' : 'text-white'}`}
                    />
                  </button>

                  <GameCard game={game} isAdmin={isAdmin} onSelect={() => handleGameSelect(game)} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center opacity-30">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p className="font-black uppercase italic tracking-widest">Nie znaleziono gier</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Dialog open={!!selectedGame} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-screen-2xl w-dvw h-dvh  bg-[#020617] border-slate-800 text-white p-0 rounded-none sm:rounded-3xl outline-none shadow-[0_0_120px_rgba(37,99,235,0.3)] flex flex-col overflow-hidden">
          {selectedGame && (
            <>
              <div className="flex-none p-6 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Gamepad2 className="h-6 w-6 text-blue-500" />
                  <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
                    {selectedGame.title}
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[6px] font-black uppercase tracking-widest bg-slate-950 px-3 py-1.5 rounded-full border border-white/5">
                  <Clock size={10} className="text-blue-500 animate-pulse" />
                  auto-close 180s
                </div>
              </div>

              <div className="flex-1 overflow-y-auto  custom-scrollbar">
                <div className="w-full min-h-full flex items-center justify-center">
                  {ActiveGame ? (
                    <div className="w-full">
                      <ActiveGame
                        balance={currentBalance}
                        onBalanceUpdate={handleBalanceUpdate}
                        gameSlug={selectedGame.slug}
                        gameData={selectedGame}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center space-y-4 py-12">
                      <Rocket className="h-20 w-20 text-blue-500/20 animate-bounce" />
                      <h3 className="text-xl font-black uppercase italic text-white">
                        Coming Soon
                      </h3>
                      <button
                        onClick={() => setSelectedGame(null)}
                        className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                      >
                        Wróć do lobby
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
          display: flex;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
