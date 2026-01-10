'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { playJackpotBells } from '@/app/actions/casino/jackpot-bells'
import { toast } from 'sonner'
import { CasinoGameWrapper } from '../CasinoGameWrapper'
import { Coins, Zap, Trophy, ArrowRightCircle, Plus, Minus } from 'lucide-react'

const SYMBOLS = ['🔔', '🍒', '🍋', '🍇', '🍉', '7️⃣']

export default function JackpotBells({ balance, onBalanceUpdate, gameData }: any) {
  const [reels, setReels] = useState(['7️⃣', '🔔', '7️⃣'])
  const [isSpinning, setIsSpinning] = useState(false)
  const [stake, setStake] = useState(10)
  const [visualReels, setVisualReels] = useState(['7️⃣', '🔔', '7️⃣'])

  useEffect(() => {
    let interval: any
    if (isSpinning) {
      interval = setInterval(() => {
        setVisualReels([
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        ])
      }, 80)
    } else {
      setVisualReels(reels)
    }
    return () => clearInterval(interval)
  }, [isSpinning, reels])

  const handleSpin = async () => {
    if (stake <= 0) return toast.error('Podaj stawkę!')
    if (balance < stake) return toast.error('Niewystarczające środki!')
    if (isSpinning) return

    setIsSpinning(true)

    try {
      const result = await playJackpotBells(stake)

      setTimeout(() => {
        setReels(result.reels)
        onBalanceUpdate(result.newBalance)
        setIsSpinning(false)

        if (result.isWin) {
          toast.success(`WYGRANA: +${result.winAmount.toFixed(2)} $`, {
            icon: '🔔',
            style: { background: '#fbbf24', color: '#000', fontWeight: '900' },
          })
        } else {
          toast.info('Brak wygranej. Spróbuj ponownie!', {
            style: { background: '#1e293b', color: '#fff' },
          })
        }
      }, 2000)
    } catch (err: any) {
      toast.error('Błąd serwera')
      setIsSpinning(false)
    }
  }

  return (
    // Upewnij się, że CasinoGameWrapper przyjmuje prop 'balance'
    <CasinoGameWrapper
      balance={balance}
      gameData={gameData}
      title={gameData?.title || 'Jackpot Bells'}
    >
      {/* TOP STATUS BAR */}
      <div className="w-full flex justify-between items-center mb-8 px-6 py-3 bg-slate-900/50 rounded-2xl border border-slate-800/60">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
            Max Win: x50
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${isSpinning ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}
          />
          <span className="text-[10px] font-black uppercase text-slate-400 italic">
            Live Engine
          </span>
        </div>
      </div>

      {/* SLOT MACHINE CASE */}
      <div className="relative group flex justify-center w-full">
        <div className="p-4 md:p-8 bg-gradient-to-b from-slate-800 to-black rounded-[3.5rem] border-[8px] border-slate-900 shadow-[0_0_60px_rgba(0,0,0,0.8)] w-full max-w-lg">
          <div className="flex gap-4 bg-[#050505] p-6 rounded-[2rem] border-2 border-slate-800/50 shadow-inner relative overflow-hidden justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none z-20" />

            {visualReels.map((symbol, i) => (
              <div
                key={i}
                className="relative w-20 h-28 md:w-28 md:h-40 bg-gradient-to-b from-[#111] to-[#050505] rounded-2xl border border-white/5 flex items-center justify-center text-4xl md:text-6xl shadow-2xl overflow-hidden"
              >
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={`${symbol}-${i}-${isSpinning}`}
                    initial={{ y: isSpinning ? -50 : 0, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: isSpinning ? 50 : 0, opacity: 0 }}
                    transition={{ duration: isSpinning ? 0.08 : 0.5 }}
                  >
                    {symbol}
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60 z-10 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PANEL STEROWANIA */}
      <div className="mt-10 w-full max-w-md mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
              <Zap className="h-3 w-3 text-yellow-500" /> Stawka ($)
            </label>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-focus-within focus-within:border-blue-600">
              <button
                disabled={isSpinning}
                onClick={() => setStake(Math.max(10, stake - 10))}
                className="p-4 text-slate-500 hover:text-white hover:bg-white/5 transition-colors border-r border-slate-800"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={isSpinning}
                className="w-full bg-transparent py-4 text-center font-black text-white outline-none no-arrows"
              />
              <button
                disabled={isSpinning}
                onClick={() => setStake(stake + 10)}
                className="p-4 text-slate-500 hover:text-white hover:bg-white/5 transition-colors border-l border-slate-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">
              Szybki wybór
            </label>
            <div className="flex gap-2">
              {[10, 100, 500].map((v) => (
                <button
                  key={v}
                  onClick={() => setStake(v)}
                  disabled={isSpinning}
                  className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all border ${
                    stake === v
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={isSpinning || balance < stake}
          className={`group relative w-full h-14 rounded-[2rem] transition-all duration-300 overflow-hidden ${
            isSpinning || balance < stake
              ? 'bg-slate-800 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 active:scale-95 shadow-xl hover:shadow-blue-500/20'
          }`}
        >
          <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <span className="text-2xl font-black italic uppercase tracking-[0.4em] text-white">
              {isSpinning ? 'SPINNING...' : balance < stake ? 'Brak środków' : 'SPIN'}
            </span>
          </div>
        </button>
      </div>

      <style jsx>{`
        .no-arrows::-webkit-inner-spin-button,
        .no-arrows::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-arrows {
          -moz-appearance: textfield;
        }
      `}</style>
    </CasinoGameWrapper>
  )
}
