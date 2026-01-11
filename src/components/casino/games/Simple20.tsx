'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { CasinoGameWrapper } from '../CasinoGameWrapper'
import { Zap, Trophy, Plus, Minus, RotateCw, Octagon } from 'lucide-react'
import { playSimple20Action } from '@/app/actions/casino/simple20'
import { useCasinoSounds } from '@/hooks/useCasinoSound'

const SYMBOLS = ['🔔', '🍒', '🍋', '🍇', '🍉', '7️⃣']

export default function Simple20({ balance, onBalanceUpdate, gameData }: any) {
  const [reels, setReels] = useState(['7️⃣', '🔔', '7️⃣'])
  const [isSpinning, setIsSpinning] = useState(false)
  const [isAutoSpin, setIsAutoSpin] = useState(false)
  const [isWinningHit, setIsWinningHit] = useState(false)
  const [stake, setStake] = useState(10)
  const [visualReels, setVisualReels] = useState(['7️⃣', '🔔', '7️⃣'])

  // Inicjalizacja dźwięków
  const { playSpin, stopSpin, playWin, playLose } = useCasinoSounds()

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

  const handleSpin = useCallback(async () => {
    if (stake <= 0) {
      setIsAutoSpin(false)
      return toast.error('Podaj stawkę!')
    }
    if (balance < stake) {
      setIsAutoSpin(false)
      return toast.error('Niewystarczające środki!')
    }
    if (isSpinning) return

    setIsSpinning(true)
    setIsWinningHit(false)

    // START: Dźwięk kręcenia
    playSpin()

    try {
      const result = await playSimple20Action(stake)

      // Czekamy 2 sekundy (zgodnie z czasem animacji slotów)
      setTimeout(() => {
        // STOP: Wyłączamy dźwięk kręcenia przy pokazaniu wyniku
        stopSpin()

        if (result) {
          setReels(result.reels)
          onBalanceUpdate(result.newBalance)
          setIsSpinning(false)

          if (result.isWin) {
            setIsWinningHit(true)
            playWin() // Dźwięk wygranej
            toast.success(`WYGRANA: +${result.winAmount.toFixed(2)} $`, {
              icon: '🔔',
            })
            setTimeout(() => setIsWinningHit(false), 4000)
          } else {
            playLose() // Dźwięk przegranej
          }
        }
      }, 2000)
    } catch (err: any) {
      stopSpin() // Wyłącz dźwięk w razie błędu serwera
      toast.error('Błąd serwera')
      setIsSpinning(false)
      setIsAutoSpin(false)
    }
  }, [stake, balance, isSpinning, onBalanceUpdate, playSpin, stopSpin, playWin, playLose])

  // Logika Auto Spinu
  useEffect(() => {
    let timeout: any
    if (isAutoSpin && !isSpinning) {
      const delay = isWinningHit ? 2000 : 500
      timeout = setTimeout(() => {
        handleSpin()
      }, delay)
    }
    return () => clearTimeout(timeout)
  }, [isAutoSpin, isSpinning, isWinningHit, handleSpin])

  return (
    <CasinoGameWrapper balance={balance} gameData={gameData} title={gameData?.title || 'Simple 20'}>
      {/* TOP STATUS BAR */}
      <div className="w-full flex justify-between items-center mb-8 px-6 py-3 bg-slate-900/50 rounded-2xl border border-slate-800/60">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
            Max Wygrana: x50
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${isSpinning || isAutoSpin ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}
          />
          <span className="text-[10px] font-black uppercase text-slate-400 italic">
            {isAutoSpin
              ? isWinningHit
                ? 'Oczekiwanie po wygranej...'
                : 'Tryb Auto Aktywny'
              : 'Silnik Live'}
          </span>
        </div>
      </div>

      {/* SLOT MACHINE CASE */}
      <div className="relative group flex justify-center w-full">
        <div
          className={`p-4 md:p-8 bg-gradient-to-b from-slate-800 to-black rounded-[3.5rem] border-[8px] transition-all duration-500 ${isWinningHit ? 'border-yellow-500 shadow-[0_0_80px_rgba(234,179,8,0.4)]' : 'border-slate-900 shadow-[0_0_60px_rgba(0,0,0,0.8)]'} w-full max-w-lg`}
        >
          <div className="flex gap-4 bg-[#050505] p-6 rounded-[2rem] border-2 border-slate-800/50 shadow-inner relative overflow-hidden justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none z-20" />

            {visualReels.map((symbol, i) => (
              <div
                key={i}
                className={`relative w-20 h-28 md:w-28 md:h-40 bg-gradient-to-b from-[#111] to-[#050505] rounded-2xl border transition-all duration-500 flex items-center justify-center text-4xl md:text-6xl shadow-2xl overflow-hidden ${isWinningHit ? 'border-yellow-500/50 shadow-[inset_0_0_20px_rgba(234,179,8,0.2)]' : 'border-white/5'}`}
              >
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={`${symbol}-${i}-${isSpinning}`}
                    initial={{ y: isSpinning ? -50 : 0, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      scale: isWinningHit ? [1, 1.2, 1] : 1,
                    }}
                    exit={{ y: isSpinning ? 50 : 0, opacity: 0 }}
                    transition={{
                      duration: isSpinning ? 0.08 : 0.5,
                      scale: { repeat: isWinningHit ? Infinity : 0, duration: 0.6 },
                    }}
                  >
                    {symbol}
                  </motion.div>
                </AnimatePresence>

                {isWinningHit && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-yellow-500/10"
                  />
                )}
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
                disabled={isSpinning || isAutoSpin}
                onClick={() => setStake(Math.max(10, stake - 10))}
                className="p-4 text-slate-500 hover:text-white hover:bg-white/5 transition-colors border-r border-slate-800"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(Math.max(0, parseInt(e.target.value) || 0))}
                disabled={isSpinning || isAutoSpin}
                className="w-full bg-transparent py-4 text-center font-black text-white outline-none no-arrows"
              />
              <button
                disabled={isSpinning || isAutoSpin}
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
                  disabled={isSpinning || isAutoSpin}
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

        <div className="flex gap-4">
          <button
            onClick={() => setIsAutoSpin(!isAutoSpin)}
            disabled={balance < stake && !isAutoSpin}
            className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-[2rem] transition-all duration-300 font-black uppercase tracking-widest border-2 ${
              isAutoSpin
                ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
            }`}
          >
            {isAutoSpin ? (
              <>
                <Octagon className="h-5 w-5 fill-current animate-pulse" /> STOP
              </>
            ) : (
              <>
                <RotateCw className="h-5 w-5" /> AUTO
              </>
            )}
          </button>

          <button
            onClick={handleSpin}
            disabled={isSpinning || balance < stake || isAutoSpin}
            className={`relative flex-[2] h-14 rounded-[2rem] transition-all duration-300 overflow-hidden ${
              isSpinning || isAutoSpin
                ? 'bg-blue-600/20 border-2 border-blue-500 text-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.4)]'
                : balance < stake
                  ? 'bg-slate-800 cursor-not-allowed opacity-50 text-slate-500'
                  : 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 active:scale-95 shadow-xl hover:shadow-blue-500/20 text-white'
            }`}
          >
            {isSpinning && (
              <motion.div
                className="absolute inset-0 bg-blue-400/20"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}

            <span className="relative z-10 text-2xl font-black italic uppercase tracking-[0.4em]">
              {isSpinning ? 'KRĘCĘ...' : 'KRĘĆ'}
            </span>
          </button>
        </div>
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
