'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Trophy,
  Gamepad2,
  PlayCircle,
  Search,
  LayoutGrid,
  Star,
  History,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Media } from '@/components/Media'
import SimplyNumbers from '@/components/casino/games/SimplyNumbers'
import { motion, AnimatePresence } from 'motion/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const GAME_COMPONENTS: any = {
  'simply-numbers': SimplyNumbers,
}

export default function CasinoClient({ nickname, money }: any) {
  const [games, setGames] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [wins, setWins] = useState<any[]>([])
  const [selectedGame, setSelectedGame] = useState<any | null>(null)
  const [currentBalance, setCurrentBalance] = useState(money)

  // Nowe stany funkcjonalne
  const [favorites, setFavorites] = useState<string[]>([])
  const [lastPlayed, setLastPlayed] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  // Ładowanie preferencji z localStorage
  useEffect(() => {
    const favs = localStorage.getItem('casino_favs')
    const last = localStorage.getItem('casino_last')
    if (favs) setFavorites(JSON.parse(favs))
    if (last) setLastPlayed(JSON.parse(last))
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const [gamesRes, winsRes, catsRes] = await Promise.all([
        fetch(`/api/casino-games?limit=100`),
        fetch(`/api/casino-wins?sort=-createdAt&limit=10`),
        fetch(`/api/casino-categories?sort=title&limit=50`),
      ])
      const gamesData = await gamesRes.json()
      const winsData = await winsRes.json()
      const catsData = await catsRes.json()

      // Filtrujemy tylko aktywne gry (funkcjonalność z Admin Panelu)
      const activeGames = (gamesData?.docs || []).filter((g: any) => g.isActive !== false)
      setGames(activeGames)
      setWins(winsData?.docs || [])
      setCategories(catsData?.docs || [])
    } catch (err) {
      console.error('Błąd:', err)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 20000)
    return () => clearInterval(interval)
  }, [fetchData])

  // System Ulubionych
  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const newFavs = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id]
    setFavorites(newFavs)
    localStorage.setItem('casino_favs', JSON.stringify(newFavs))
  }

  // Obsługa kliknięcia w grę
  const handleGameSelect = (game: any) => {
    setSelectedGame(game)
    // Aktualizacja ostatnio granych
    const newLast = [game.id, ...lastPlayed.filter((id) => id !== game.id)].slice(0, 5)
    setLastPlayed(newLast)
    localStorage.setItem('casino_last', JSON.stringify(newLast))
  }

  const filteredGames = useMemo(() => {
    return games
      .filter((game) => {
        const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory =
          activeCategory === 'all' ||
          (typeof game.category === 'object'
            ? game.category?.id === activeCategory
            : game.category === activeCategory)

        // Specjalne kategorie wirtualne
        if (activeCategory === 'favorites') return favorites.includes(game.id) && matchesSearch
        if (activeCategory === 'recent') return lastPlayed.includes(game.id) && matchesSearch

        return matchesSearch && matchesCategory
      })
      .sort((a, b) => a.title.localeCompare(b.title, 'pl'))
  }, [games, searchQuery, activeCategory, favorites, lastPlayed])

  const ActiveGame = selectedGame ? GAME_COMPONENTS[selectedGame.slug] : null

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
      {/* MARQUEE... (kod bez zmian) */}

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12 bg-slate-900/30 p-6 md:p-8 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-xl">
          {/* LOGO I USER... (kod bez zmian) */}

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

            <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto w-full no-scrollbar">
              <button
                onClick={() => setActiveCategory('all')}
                className={catBtnStyle(activeCategory === 'all')}
              >
                <LayoutGrid className="h-3 w-3" /> Wszystkie
              </button>
              <button
                onClick={() => setActiveCategory('favorites')}
                className={catBtnStyle(activeCategory === 'favorites')}
              >
                <Star className="h-3 w-3" /> Ulubione
              </button>
              <button
                onClick={() => setActiveCategory('recent')}
                className={catBtnStyle(activeCategory === 'recent')}
              >
                <History className="h-3 w-3" /> Ostatnie
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={catBtnStyle(activeCategory === cat.id)}
                >
                  <Gamepad2 className="h-3 w-3" /> {cat.title}
                </button>
              ))}
            </div>
          </div>
          {/* SALDO... (kod bez zmian) */}
        </header>

        {/* GRID GIER */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ y: -10 }}
                onClick={() => handleGameSelect(game)}
                className="relative group cursor-pointer"
              >
                <div className="bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 transition-all duration-500 group-hover:border-blue-600">
                  <div className="aspect-[4/5] relative">
                    <Media
                      resource={game.gamelogo}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />

                    {/* Przycisk ulubionych na karcie */}
                    <button
                      onClick={(e) => toggleFavorite(e, game.id)}
                      className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10"
                    >
                      <Star
                        className={cn(
                          'h-4 w-4',
                          favorites.includes(game.id)
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-white',
                        )}
                      />
                    </button>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-blue-600/10 backdrop-blur-[2px]">
                      <PlayCircle className="h-14 w-14 text-white fill-blue-600 shadow-2xl" />
                    </div>
                  </div>
                  <div className="p-4 text-center bg-slate-950/90 border-t border-slate-800/50">
                    <span className="text-[10px] font-black uppercase italic tracking-widest">
                      {game.title}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* DIALOG Z OBSŁUGĄ BŁĘDÓW (ERROR HANDLING) */}
      <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
        <DialogContent className="max-w-2xl w-[95vw] bg-[#020617] border-slate-800 text-white p-0 rounded-[3rem] overflow-hidden outline-none">
          {selectedGame && (
            <div className="flex flex-col w-full">
              <div className="p-6 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center px-10">
                <div className="flex items-center gap-4">
                  <Gamepad2 className="h-6 w-6 text-blue-500" />
                  <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">
                    {selectedGame.title}
                  </DialogTitle>
                </div>
              </div>

              <div className="p-10 w-full min-h-[300px] flex items-center justify-center">
                {ActiveGame ? (
                  <ActiveGame
                    balance={currentBalance}
                    onBalanceUpdate={(b: number) => setCurrentBalance(b)}
                    gameSlug={selectedGame.slug}
                    gameData={selectedGame}
                  />
                ) : (
                  /* ERROR HANDLING: Gdy admin dodał grę w panelu, ale deweloper nie dodał kodu komponentu */
                  <div className="flex flex-col items-center text-center max-w-sm">
                    <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                      <AlertTriangle className="h-10 w-10 text-red-500 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-black uppercase italic mb-2">Błąd Systemowy</h3>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed uppercase">
                      Gra <span className="text-white">&quot;{selectedGame.title}&quot;</span>{' '}
                      została zarejestrowana w bazie, ale jej moduł wykonawczy nie jest jeszcze
                      gotowy.
                    </p>
                    <div className="mt-8 p-4 bg-slate-900 rounded-2xl border border-slate-800 w-full">
                      <p className="text-[9px] text-blue-500 font-black uppercase mb-1">
                        Status techniczny
                      </p>
                      <code className="text-[10px] text-slate-400">
                        Component_Not_Found: {selectedGame.slug}
                      </code>
                    </div>
                    <Button
                      onClick={() => setSelectedGame(null)}
                      className="mt-8 bg-blue-600 hover:bg-blue-700 text-[10px] font-black uppercase px-8"
                    >
                      Wróć do lobby
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Pomocnicze funkcje stylu
function catBtnStyle(isActive: boolean) {
  return `flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${
    isActive
      ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
  }`
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
