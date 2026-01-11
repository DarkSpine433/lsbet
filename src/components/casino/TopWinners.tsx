'use client'
import React, { useEffect, useState } from 'react'
import {
  Trophy,
  Medal,
  Crown,
  Star,
  TrendingUp,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export const TopWinners = () => {
  const [topThree, setTopThree] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(true)

  const fetchTopWins = async () => {
    try {
      const res = await fetch('/api/casino-wins?sort=-winAmount&limit=3&depth=1')
      const data = await res.json()
      setTopThree(data?.docs || [])
    } catch (err) {
      console.error('Błąd pobierania top wygranych:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Ładowanie preferencji widoczności z LocalStorage
    const savedVisibility = localStorage.getItem('lscasino_hof_visible')
    if (savedVisibility !== null) {
      setIsVisible(savedVisibility === 'true')
    }

    fetchTopWins()
    const interval = setInterval(fetchTopWins, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleVisibility = () => {
    const nextState = !isVisible
    setIsVisible(nextState)
    localStorage.setItem('lscasino_hof_visible', String(nextState))
  }

  const getTierConfig = (index: number) => {
    switch (index) {
      case 0:
        return {
          color: 'from-yellow-400 to-amber-600',
          border: 'border-yellow-500/40',
          bg: 'bg-yellow-500/5',
          icon: (
            <Crown className="h-5 w-5 text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" />
          ),
          label: 'Champion',
          scale: 'md:scale-[1.01]  shadow-[0px_5px_20px_rgba(234,179,8,0.2)]',
        }
      case 1:
        return {
          color: 'from-slate-300 to-slate-500',
          border: 'border-slate-400/30',
          bg: 'bg-slate-400/5',
          icon: <Medal className="h-5 w-5 text-slate-300" />,
          label: 'Legendary',
          scale: 'md:scale-95',
        }
      default:
        return {
          color: 'from-orange-400 to-orange-700',
          border: 'border-orange-500/30',
          bg: 'bg-orange-500/5',
          icon: <Trophy className="h-5 w-5 text-orange-400" />,
          label: 'Elite',
          scale: 'md:scale-95',
        }
    }
  }

  if (loading) return null

  return (
    <div className="w-full mb-10 relative">
      {/* NAGŁÓWEK Z PRZYCISKIEM UKRYWANIA */}
      <div className="flex items-center justify-between mb-6 bg-slate-900/20 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
            <Star className="h-4 w-4 text-blue-600 fill-blue-600 opacity-50" />
          </div>
          <div>
            <h2 className="text-sm font-black italic uppercase tracking-tighter leading-none">
              Hall of <span className="text-blue-600">Fame</span>
            </h2>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Top 3 Rekordy
            </p>
          </div>
        </div>

        <button
          onClick={toggleVisibility}
          className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-blue-600/20 border border-white/10 rounded-xl transition-all group"
        >
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-400">
            {isVisible ? 'Ukryj' : 'Pokaż'}
          </span>
          {isVisible ? (
            <EyeOff size={12} className="text-slate-500" />
          ) : (
            <Eye size={12} className="text-blue-500" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 mt-1">
              {topThree.map((win, index) => {
                const tier = getTierConfig(index)
                const userName = win?.user?.nickname || win?.user?.email?.split('@')[0] || 'Gracz'
                const orderClass =
                  index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'

                return (
                  <motion.div
                    key={win.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative group ${orderClass}`}
                  >
                    <div
                      className={`relative overflow-hidden rounded-[1.5rem] border ${tier.border} bg-[#0a101f]/80 p-4 flex flex-col items-center shadow-xl backdrop-blur-md ${tier.scale}`}
                    >
                      {/* Dekoracyjny numer */}
                      <span className="absolute -right-1 -top-2 text-4xl font-black italic text-white/[0.03] pointer-events-none">
                        #{index + 1}
                      </span>

                      <div className="flex items-center gap-3 w-full mb-3">
                        <div
                          className={`p-2 rounded-xl bg-gradient-to-b ${tier.bg} border ${tier.border}`}
                        >
                          {tier.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-[8px] font-black uppercase tracking-[0.1em] bg-clip-text text-transparent bg-gradient-to-r ${tier.color}`}
                          >
                            {tier.label}
                          </p>
                          <h3 className="text-sm font-black italic uppercase text-white truncate">
                            {userName}
                          </h3>
                        </div>
                      </div>

                      <div className="w-full flex items-center justify-between gap-2 mt-auto pt-3 border-t border-white/5">
                        <div className="px-2 py-0.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <span className="text-blue-400 text-[8px] font-black uppercase italic">
                            {win.gameTitle || 'lsCasino'}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b ${tier.color}`}
                        >
                          {Number(win.winAmount).toLocaleString('pl-PL')} $
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
