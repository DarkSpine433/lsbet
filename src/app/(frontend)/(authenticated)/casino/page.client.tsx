'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Trophy,
  Gamepad2,
  PlayCircle,
  Search,
  LayoutGrid,
  AlertCircle,
  Rocket,
  Sparkles,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'motion/react'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

//####################_Games Imports_#######################//
import SimplyNumbers from '@/components/casino/games/SimplyNumbers'
import JackpotBells from '@/components/casino/games/JackpotBells'
import Simple20 from '@/components/casino/games/Simple20'
import { GameCard } from './GameCard'
import { User } from '@/payload-types'

const GAME_COMPONENTS: Record<string, any> = {
  'simply-numbers': SimplyNumbers,
  'jackpot-bells': JackpotBells,
  'simple-20': Simple20,
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

  // POPRAWIONA LOGIKA ADMINA (obsługuje tablicę roles i pojedynczy string role)
  const isAdmin = useMemo(() => {
    const roles = user?.role || []
    const role = user?.role
    return role === 'admin'
  }, [user])

  const fetchData = useCallback(async () => {
    try {
      const [gamesRes, winsRes, catsRes] = await Promise.all([
        fetch(`/api/casino-games?limit=100&depth=1`),
        fetch(`/api/casino-wins?sort=-publishedAt&limit=20&depth=1`),
        fetch(`/api/casino-categories?sort=title&limit=50`),
      ])

      const gamesData = await gamesRes.json()
      const winsData = await winsRes.json()
      const catsData = await catsRes.json()

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

  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase())
        const isNewGame = (createdAt: string) => {
          const weekInMs = 7 * 24 * 60 * 60 * 1000
          return new Date().getTime() - new Date(createdAt).getTime() < weekInMs
        }

        if (activeCategory === 'new_games') return matchesSearch && isNewGame(game.createdAt)

        const gameCatId = typeof game.category === 'object' ? game.category?.id : game.category
        const matchesCategory = activeCategory === 'all' || gameCatId === activeCategory

        return matchesSearch && matchesCategory
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'pl'))
  }, [games, searchQuery, activeCategory])

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setSelectedGame(null)
      if (hasPlayed) {
        router.refresh()
        setHasPlayed(false)
      }
    }
  }

  const ActiveGameComponent = selectedGame ? GAME_COMPONENTS[selectedGame.slug] : null

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
      {/* Marquee Section */}
      <div className="w-full bg-blue-600/10 border-b border-blue-500/20 py-3 overflow-hidden h-12 flex items-center">
        <div className="flex whitespace-nowrap animate-marquee">
          {wins.map((win, i) => (
            <div key={i} className="flex items-center gap-3 px-10 border-r border-slate-800/40">
              <Trophy className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-blue-400 font-black text-[11px] uppercase">
                {win?.user?.nickname || 'Gracz'}
              </span>
              <span className="text-green-500 font-black italic text-[11px]">
                +{Number(win?.winAmount).toFixed(2)} $
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 bg-slate-900/30 p-6 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl">
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <div className="space-y-1">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                ls<span className="text-blue-600">Casino</span>
              </h1>
              <div className="flex items-center gap-2 text-blue-500 font-bold text-[8px] tracking-[0.3em]">
                <div className="h-1 w-1 bg-blue-600 rounded-full animate-pulse" />
                {isAdmin ? 'ADMIN ACCESS' : 'LIVE'}
              </div>
            </div>
            <div className="hidden md:block ml-4 border-l border-slate-800 pl-6">
              <p className="text-slate-500 text-[9px] font-black uppercase">Balans</p>
              <p className="text-green-500 font-black italic text-sm">
                {currentBalance.toFixed(2)} $
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full max-w-2xl">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Szukaj gry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border-slate-800 rounded-2xl pl-11 h-12 text-[11px] font-bold uppercase"
              />
            </div>
            <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto w-full no-scrollbar">
              <button
                onClick={() => setActiveCategory('all')}
                className={`nav-button ${activeCategory === 'all' ? 'active' : ''}`}
              >
                Wszystkie
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`nav-button ${activeCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Games Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isAdmin={isAdmin}
                onSelect={() => setSelectedGame(game)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Game Dialog */}
      <Dialog open={!!selectedGame} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-2xl w-[95vw] bg-[#020617] border-slate-800 p-0 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.2)]">
          {selectedGame && (
            <>
              <div className="p-6 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Gamepad2 className="h-6 w-6 text-blue-500" />
                  <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
                    {selectedGame.title}
                  </DialogTitle>
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[80vh]">
                {ActiveGameComponent ? (
                  <ActiveGameComponent
                    balance={currentBalance}
                    onBalanceUpdate={(bal: number) => {
                      setCurrentBalance(bal)
                      setHasPlayed(true)
                    }}
                    gameSlug={selectedGame.slug}
                    gameData={selectedGame}
                  />
                ) : (
                  <div className="py-20 text-center">
                    <Rocket className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-bounce" />
                    <p className="font-black uppercase italic">Gra wkrótce dostępna!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .nav-button {
          @apply flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap text-slate-500 hover:bg-slate-800;
        }
        .nav-button.active {
          @apply bg-blue-600 text-white shadow-lg shadow-blue-600/20;
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
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  )
}
