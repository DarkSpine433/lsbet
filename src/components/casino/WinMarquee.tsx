'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Loader2 } from 'lucide-react'

const WinMarquee = () => {
  const [wins, setWins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWins = async () => {
      try {
        // Symulacja pobierania danych z Twojej kolekcji 'casino-wins'
        const res = await fetch('/api/casino-wins?sort=-createdAt&limit=10')
        const data = await res.json()
        setWins(data.docs || [])
      } catch (err) {
        console.error('Error fetching wins:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchWins()
  }, [])

  // 1. Renderowanie Skeletona (Ładne ładowanie)
  if (isLoading) {
    return (
      <div className="w-full bg-blue-600/5 border-b border-blue-500/10 py-3 h-12 flex items-center justify-center gap-3">
        <Loader2 className="h-4 w-4 text-blue-500/40 animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 animate-pulse">
          Synchronizacja wygranych...
        </span>
      </div>
    )
  }

  // 2. Jeśli nie ma żadnych wygranych - nie pokazuj komponentu wcale
  if (!wins || wins.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-blue-600/10 border-b border-blue-500/20 py-3 overflow-hidden h-12 flex items-center shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]">
      <div className="flex whitespace-nowrap animate-marquee">
        {/* Podwajamy tablicę dla płynnego zapętlenia animacji marquee */}
        {[...wins, ...wins].map((win, i) => {
          const isJackpot = Number(win?.winAmount) >= 2000
          const userNick = win?.user?.nickname || win?.user?.email?.split('@')[0] || 'Gracz'

          return (
            <div
              key={i}
              className="flex items-center gap-4 px-10 border-r border-slate-800/40 group hover:bg-white/5 transition-colors cursor-default"
            >
              <Trophy
                className={`h-3.5 w-3.5 transition-transform group-hover:scale-125 ${
                  isJackpot ? 'text-yellow-400 animate-bounce' : 'text-yellow-500/80'
                }`}
              />
              <div className="flex flex-col leading-none">
                <span className="text-white font-black text-[10px] uppercase tracking-tighter">
                  {userNick}
                  <span className="text-slate-500 font-medium ml-2 uppercase">w</span>
                  <span className="text-blue-400 ml-1 italic tracking-normal">
                    {win?.gameTitle || 'Kasyno'}
                  </span>
                </span>
              </div>
              <span
                className={`font-black italic text-[12px] tracking-tight ${
                  isJackpot
                    ? 'text-yellow-400 scale-110 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                    : 'text-green-500'
                }`}
              >
                +{Number(win?.winAmount).toFixed(2)} $
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WinMarquee
