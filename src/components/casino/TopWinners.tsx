'use client'
import React, { useEffect, useState } from 'react'
import { Crown, Medal, Trophy, Star, Sparkles, Eye, EyeOff } from 'lucide-react'
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
      console.error('Błąd Hall of Fame:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const savedVisibility = localStorage.getItem('lscasino_hof_visible')
    if (savedVisibility !== null) setIsVisible(savedVisibility === 'true')
    fetchTopWins()
    const interval = setInterval(fetchTopWins, 60000)
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
          rank: 1,
          label: 'CHAMPION',
          icon: <Crown className="h-6 w-6 text-yellow-950 fill-yellow-400" />,
          wrapperClass: 'md:-mt-6 z-20', // Zwiększone Z-index dla pewności
          cardClass:
            'bg-gradient-to-b from-yellow-500/10 to-yellow-900/5 border-yellow-500/40 shadow-[0_0_50px_-10px_rgba(234,179,8,0.4)]',
          textGradient: 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600',
          badgeClass: 'bg-yellow-400 text-yellow-950',
          glow: 'bg-yellow-500/20',
        }
      case 1:
        return {
          rank: 2,
          label: 'LEGEND',
          icon: <Medal className="h-5 w-5 text-slate-800 fill-slate-300" />,
          wrapperClass: 'md:mt-4 z-10',
          cardClass:
            'bg-gradient-to-b from-slate-400/10 to-slate-800/5 border-slate-400/30 shadow-[0_0_30px_-10px_rgba(148,163,184,0.2)]',
          textGradient: 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-500',
          badgeClass: 'bg-slate-300 text-slate-900',
          glow: 'bg-slate-400/10',
        }
      default:
        return {
          rank: 3,
          label: 'ELITE',
          icon: <Trophy className="h-5 w-5 text-orange-900 fill-orange-400" />,
          wrapperClass: 'md:mt-8 z-0',
          cardClass:
            'bg-gradient-to-b from-orange-500/10 to-orange-900/5 border-orange-500/30 shadow-[0_0_30px_-10px_rgba(249,115,22,0.2)]',
          textGradient: 'bg-gradient-to-br from-orange-200 via-orange-400 to-orange-700',
          badgeClass: 'bg-orange-400 text-orange-950',
          glow: 'bg-orange-500/10',
        }
    }
  }

  if (loading)
    return (
      <div className="w-full mb-12 p-8 rounded-[2.5rem] bg-slate-900/20 border border-slate-800/50 flex flex-col items-center gap-8 animate-pulse">
        <div className="h-6 w-40 bg-slate-800 rounded-full" />
        <div className="flex gap-4 items-end w-full max-w-3xl justify-center h-48">
          <div className="w-1/3 h-32 bg-slate-800/40 rounded-2xl" />
          <div className="w-1/3 h-48 bg-slate-800/60 rounded-2xl" />
          <div className="w-1/3 h-24 bg-slate-800/40 rounded-2xl" />
        </div>
      </div>
    )

  if (topThree.length === 0) return null

  return (
    <div className="w-full mb-12 relative group/section z-0">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 px-5 py-5 bg-zinc-50/5 rounded-2xl border border-slate-800/50 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 ">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/50 blur-lg opacity-50" />
            <Star className="relative h-6 w-6 text-blue-500 fill-blue-500 animate-[spin_12s_linear_infinite]" />
            <Sparkles className="absolute -top-2 -right-2 h-3 w-3 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black italic uppercase tracking-tighter text-white leading-none">
              Hall of{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Fame
              </span>
            </h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.25em]">
              Najwyższe wygrane
            </p>
          </div>
        </div>

        <button
          onClick={toggleVisibility}
          className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg backdrop-blur-sm"
        >
          {isVisible ? 'Ukryj' : 'Pokaż'}
          {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            // ZMIANA: Definiujemy warianty, aby obsłużyć overflow
            variants={{
              hidden: { height: 0, opacity: 0, overflow: 'hidden' },
              visible: {
                height: 'auto',
                opacity: 1,
                // Kluczowe: po zakończeniu animacji ustawiamy overflow na visible
                transitionEnd: { overflow: 'visible' },
              },
              exit: { height: 0, opacity: 0, overflow: 'hidden' },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* GRID - Dodany większy padding (p-6) aby cienie się nie stykały z krawędziami podczas animacji */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end max-w-5xl mx-auto">
              {topThree.map((win, index) => {
                const config = getTierConfig(index)
                const order = index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'
                const userNick = win?.user?.nickname || win?.user?.email?.split('@')[0] || 'Anonim'

                return (
                  <motion.div
                    key={win.id || index}
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.15,
                      type: 'spring',
                      stiffness: 120,
                      damping: 15,
                    }}
                    className={`${order} ${config.wrapperClass} relative group`}
                  >
                    {/* GLOW EFFECT */}
                    <div
                      className={`absolute inset-0 rounded-[2rem] ${config.glow} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />

                    {/* KARTA */}
                    <div
                      className={`
                      relative overflow-hidden flex flex-col items-center
                      rounded-[2rem] border backdrop-blur-xl p-6
                      transition-transform duration-300 group-hover:-translate-y-2
                      ${config.cardClass}
                    `}
                    >
                      <span className="absolute -right-4 -top-6 text-[8rem] font-black italic text-white/[0.02] leading-none select-none pointer-events-none">
                        {config.rank}
                      </span>

                      <div
                        className={`
                        mb-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg
                        ${config.badgeClass}
                      `}
                      >
                        {config.icon}
                        {config.label}
                      </div>

                      <div
                        className={`
                        mb-3 h-14 w-14 rounded-2xl flex items-center justify-center
                        bg-gradient-to-br from-white/10 to-transparent border border-white/5 shadow-inner
                      `}
                      >
                        <span
                          className={`text-2xl font-bold ${config.textGradient} bg-clip-text text-transparent`}
                        >
                          {userNick.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-white uppercase italic tracking-wide mb-1 text-center truncate w-full">
                        {userNick}
                      </h3>

                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                          Wygrał w {win.gameTitle || 'Grze'}
                        </span>
                        <span
                          className={`text-xl md:text-2xl font-black italic tracking-tighter text-transparent bg-clip-text ${config.textGradient}`}
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
