'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Trophy, Gamepad2, PlayCircle, Search, LayoutGrid } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Media } from '@/components/Media'
import SimplyNumbers from '@/components/casino/games/SimplyNumbers'
import { motion, AnimatePresence } from 'motion/react'
import { Input } from '@/components/ui/input'

const GAME_COMPONENTS: any = {
  'simply-numbers': SimplyNumbers,
}

export default function CasinoClient({ nickname, money }: any) {
  const [games, setGames] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([]) // Nowy stan dla kategorii
  const [wins, setWins] = useState<any[]>([])
  const [selectedGame, setSelectedGame] = useState<any | null>(null)
  const [currentBalance, setCurrentBalance] = useState(money)

  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const fetchData = useCallback(async () => {
    try {
      // Pobieranie gier, wygranych i kategorii z kolekcji casino-categories
      const [gamesRes, winsRes, catsRes] = await Promise.all([
        fetch(`/api/casino-games?limit=100`),
        fetch(`/api/casino-wins?sort=-createdAt&limit=10`),
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

  // Logika: Filtrowanie + Sortowanie Alfabetyczne
  const filteredGames = useMemo(() => {
    const filtered = games.filter((game) => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase())

      // Dopasowanie kategorii (zakładając, że w casino-games pole nazywa się 'category' i przechowuje ID lub slug)
      const matchesCategory =
        activeCategory === 'all' ||
        (typeof game.category === 'object'
          ? game.category?.id === activeCategory
          : game.category === activeCategory)

      return matchesSearch && matchesCategory
    })

    return [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'pl'))
  }, [games, searchQuery, activeCategory])

  const ActiveGame = selectedGame ? GAME_COMPONENTS[selectedGame.slug] : null

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
      {/* MARQUEE: OSTATNIE WYGRANE */}
      <div className="w-full bg-blue-600/10 border-b border-blue-500/20 py-3 overflow-hidden h-12 flex items-center">
        <div className="flex whitespace-nowrap animate-marquee">
          {wins?.length > 0 ? (
            [...wins, ...wins].map((win, i) => (
              <div key={i} className="flex items-center gap-3 px-10 border-r border-slate-800/40">
                <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-blue-400 font-black text-[11px] uppercase">
                  {win?.user?.email?.split('@')[0] || 'Gracz'}
                </span>
                <span className="text-slate-500 text-[10px] font-bold uppercase italic text-nowrap">
                  wygrał w {win?.gameTitle || 'Kasyno'}
                </span>
                <span className="text-green-500 font-black italic text-[11px]">
                  {Number(win?.winAmount).toFixed(2)} PLN
                </span>
              </div>
            ))
          ) : (
            <div className="px-10 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
              Ładowanie danych...
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 bg-slate-900/30 p-6 md:p-8 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl">
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <div className="space-y-1">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                ls<span className="text-blue-600">Casino</span>
              </h1>
              <div className="flex items-center gap-2 text-blue-500/50 font-bold text-[8px] uppercase tracking-[0.3em]">
                <div className="h-1 w-1 bg-blue-600 rounded-full animate-pulse" /> LIVE
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
                placeholder="Szukaj gry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border-slate-800 rounded-2xl pl-11 h-12 text-[11px] font-bold uppercase tracking-widest"
              />
            </div>

            {/* DYNAMICZNE KATEGORIE Z KOLEKCJI */}
            <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto w-full no-scrollbar">
              <button
                onClick={() => setActiveCategory('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <LayoutGrid className="h-3 w-3" />
                Wszystkie
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {/* Wyświetlanie ikony z Payload jeśli masz takie pole, lub domyślna */}
                  <Gamepad2 className="h-3 w-3" />
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => setSelectedGame(game)}
                className="relative group cursor-pointer"
              >
                <div className="bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 transition-all duration-500 group-hover:border-blue-600 group-hover:shadow-[0_0_50px_rgba(37,99,235,0.25)]">
                  <div className="aspect-[4/5] relative">
                    <Media
                      resource={game.gamelogo}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-blue-600/10 backdrop-blur-[2px]">
                      <PlayCircle className="h-14 w-14 text-white fill-blue-600 shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500" />
                    </div>
                  </div>
                  <div className="p-4 text-center bg-slate-950/90 border-t border-slate-800/50">
                    <span className="text-[10px] font-black uppercase italic tracking-widest group-hover:text-blue-400 transition-colors block truncate">
                      {game.title}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
        <DialogContent className="max-w-2xl w-[95vw] bg-[#020617] border-slate-800 text-white p-0 rounded-[3rem] overflow-hidden outline-none shadow-[0_0_120px_rgba(37,99,235,0.3)]">
          {selectedGame && ActiveGame && (
            <div className="flex flex-col w-full">
              <div className="p-6 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center px-10">
                <div className="flex items-center gap-4">
                  <Gamepad2 className="h-6 w-6 text-blue-500" />
                  <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
                    {selectedGame.title}
                  </DialogTitle>
                </div>
              </div>
              <div className="p-6 md:p-10 w-full">
                <ActiveGame
                  balance={currentBalance}
                  onBalanceUpdate={(b: number) => setCurrentBalance(b)}
                  gameSlug={selectedGame.slug}
                  gameData={selectedGame}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
          animation: marquee 45s linear infinite;
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
