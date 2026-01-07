'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, ListFilter, PlayCircle, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Media } from '@/components/Media'

// --- KOMPONENT WYKONUJĄCY KOD Z BAZY ---
const DynamicGameRenderer = ({ code, onPlay, balance, isPlaying }: any) => {
  const GameComponent = useMemo(() => {
    if (!code) return null
    try {
      // OPAKOWANIE KODU: Wymuszamy, aby kod z bazy zawsze zwracał GameUI
      // Dodajemy 'window.React', aby mieć pewność, że hooki działają
      const factory = new Function(
        'React',
        `
        try {
          ${code}
         return GameUI;
         
        } catch (e) {
          console.error("Błąd wewnątrz kodu gry:", e);
          return null;
        }
      `,
      )

      return factory(React)
    } catch (err) {
      console.error('Błąd krytyczny kompilacji DynamicGameRenderer:', err)
      return null
    }
  }, [code])

  if (!GameComponent) {
    return (
      <div className="p-8 border-2 border-dashed border-red-500/40 bg-red-500/5 rounded-[2rem] text-center w-full">
        <p className="text-red-500 font-black uppercase italic text-sm">
          Błąd renderowania interfejsu
        </p>
        <p className="text-slate-400 text-[9px] mt-4 font-bold uppercase">
          {code
            ? 'Kod został wczytany, ale GameUI nie zostało znalezione.'
            : 'Brak kodu w polu clientLogic.'}
        </p>
      </div>
    )
  }

  return <GameComponent onPlay={onPlay} balance={balance} isPlaying={isPlaying} />
}

export default function CasinoClient({ nickname, categories, initialCategory, money }: any) {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedGame, setSelectedGame] = useState<any | null>(null)
  const [isGameModalOpen, setIsGameModalOpen] = useState(false)

  // Pobieranie gier z bazy (Payload) zamiast MOCK_GAMES
  const fetchGames = useCallback(async (categoryTitle: string) => {
    setLoading(true)
    try {
      const query =
        categoryTitle === 'Wszystkie'
          ? ''
          : `?where[category.title][equals]=${encodeURIComponent(categoryTitle)}`
      const res = await fetch(`/api/casino-games${query}`)
      const data = await res.json()
      setGames(data.docs || [])
    } catch (error) {
      toast.error('Błąd pobierania gier z bazy')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGames(selectedCategory)
  }, [selectedCategory, fetchGames])

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-32">
      <div className="max-w-screen-2xl mx-auto p-8">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Casino <span className="text-blue-600">Lounge</span>
          </h1>
          <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl">
            <Wallet className="text-blue-500 h-5 w-5" />
            <span className="text-xl font-black italic tabular-nums">{money.toFixed(2)} PLN</span>
          </div>
        </header>

        {/* LISTA GIER */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {games.map((game) => (
            <Card
              key={game.id}
              onClick={() => {
                setSelectedGame(game)
                setIsGameModalOpen(true)
              }}
              className="bg-slate-900 border-slate-800 rounded-[2rem] overflow-hidden cursor-pointer hover:border-blue-600 transition-all group"
            >
              <div className="aspect-[3/4] relative">
                <Media
                  resource={game.gamelogo}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="h-12 w-12 text-white fill-blue-600" />
                </div>
              </div>
              <div className="p-4 text-center font-black uppercase italic text-[10px] tracking-widest">
                {game.title}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* MODAL Z GRĄ */}
      <Dialog open={isGameModalOpen} onOpenChange={setIsGameModalOpen}>
        <DialogContent className="max-w-3xl bg-[#020617] border-slate-800 text-white p-0 rounded-[2.5rem] overflow-hidden">
          {selectedGame && (
            <div className="flex flex-col">
              <div className="p-6 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                  {selectedGame.title}
                </DialogTitle>
                <Badge className="bg-blue-600">LIVE ENGINE</Badge>
              </div>
              <div className="p-12 min-h-[400px] flex items-center justify-center bg-gradient-to-b from-transparent to-blue-900/10">
                <DynamicGameRenderer
                  code={selectedGame.clientLogic}
                  onPlay={(bet: number) => toast.success(`Postawiono: ${bet} PLN`)}
                  balance={money}
                  isPlaying={false}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
