'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Banknote, Coins, Zap, Minus, Plus, Hash, RotateCw, Octagon } from 'lucide-react'
import { CasinoGameWrapper } from '../CasinoGameWrapper'
import { playSimplyNumbersAction } from '@/app/actions/casino/simplyNumbers'
import { motion, AnimatePresence } from 'motion/react'
import { useCasinoSounds } from '@/hooks/useCasinoSound'

export default function SimplyNumbers({ balance, onBalanceUpdate, gameSlug, gameData }: any) {
  const [bet, setBet] = useState<number>(10)
  const [multiplier, setMultiplier] = useState<number>(2.0)
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [isAutoSpin, setIsAutoSpin] = useState(false)
  const [rollingNumber, setRollingNumber] = useState<number>(0)

  // Pobierz uniwersalne funkcje dźwiękowe
  const { playSpin, stopSpin, playWin, playLose } = useCasinoSounds()

  const possibleWin = (bet * multiplier).toFixed(2)

  // Efekt wizualny losowania liczb
  useEffect(() => {
    let interval: any
    if (loading) {
      interval = setInterval(() => {
        setRollingNumber(Math.floor(Math.random() * 100))
      }, 50)
    }
    return () => clearInterval(interval)
  }, [loading])

  const handlePlay = useCallback(async () => {
    if (bet <= 0) {
      setIsAutoSpin(false)
      return toast.error('Podaj stawkę!')
    }
    if (balance < bet) {
      setIsAutoSpin(false)
      return toast.error('Niewystarczające środki!')
    }
    if (loading) return

    setLoading(true)
    setLastResult(null)

    // 1. Uruchom zapętlony dźwięk losowania
    playSpin()

    try {
      const result = await playSimplyNumbersAction(bet, gameSlug, multiplier)

      setTimeout(() => {
        // 2. Natychmiastowe wyłączenie dźwięku losowania przy wyniku
        stopSpin()

        if (result && !result.error) {
          setLastResult(result)
          onBalanceUpdate(result.newBalance)

          // 3. Odtworzenie dźwięku wyniku
          if (result.win) {
            playWin()
          } else {
            playLose()
          }
        } else if (result?.error) {
          toast.error(result.error)
          setIsAutoSpin(false)
        }
        setLoading(false)
      }, 800)
    } catch (e) {
      stopSpin() // Wyłącz dźwięk w razie błędu sieci
      toast.error('Błąd połączenia')
      setLoading(false)
      setIsAutoSpin(false)
    }
  }, [
    bet,
    balance,
    loading,
    gameSlug,
    multiplier,
    onBalanceUpdate,
    playSpin,
    stopSpin,
    playWin,
    playLose,
  ])

  useEffect(() => {
    let timeout: any
    if (isAutoSpin && !loading) {
      const isWin = lastResult?.win
      const delay = isWin ? 2000 : 600

      timeout = setTimeout(() => {
        handlePlay()
      }, delay)
    }
    return () => clearTimeout(timeout)
  }, [isAutoSpin, loading, lastResult, handlePlay])

  return (
    <CasinoGameWrapper
      balance={balance}
      gameData={gameData}
      title={gameData?.title || 'Simply Numbers'}
    >
      {/* PANEL ZYSKU */}
      <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3 text-slate-400">
          <Banknote className="h-5 w-5 text-green-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Możliwy Zysk
          </span>
        </div>
        <span className="text-xl font-black italic text-green-400">{possibleWin} $</span>
      </div>

      {/* EKRAN WYNIKU / LAYOUT LOSOWANIA */}
      <div
        className={`w-full h-44 rounded-[2.5rem] border-2 flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden ${
          loading
            ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
            : lastResult?.win
              ? 'border-green-500 bg-green-500/10 shadow-[0_0_50px_rgba(34,197,94,0.3)]'
              : lastResult?.win === false
                ? 'border-red-500 bg-red-500/10'
                : 'border-slate-800 bg-slate-950/50'
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-6xl font-black italic text-blue-500 tabular-nums"
            >
              {rollingNumber}
            </motion.span>
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] animate-pulse">
              Losowanie
            </p>
          </div>
        ) : lastResult ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <p
              className={`text-6xl font-black italic tracking-tighter ${lastResult.win ? 'text-green-500' : 'text-red-500'}`}
            >
              {lastResult.win ? `+${lastResult.winAmount}` : `-${bet}`}
            </p>
            <p
              className={`text-[10px] font-bold uppercase mt-2 tracking-widest ${lastResult.win ? 'text-green-500/50' : 'text-red-500/50'}`}
            >
              {lastResult.win ? 'WYGRANA' : 'SPRÓBUJ PONOWNIE'}
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Hash className="h-8 w-8 text-slate-800 animate-bounce" />
            <p className="text-slate-600 font-black italic uppercase text-xs tracking-widest">
              Wybierz stawkę
            </p>
          </div>
        )}
      </div>

      {/* KONTROLE */}
      <div className="space-y-4 w-full">
        <div className="w-full bg-slate-900/40 p-5 rounded-[2.5rem] border border-slate-800 space-y-4">
          <div className="flex w-full justify-between items-center mb-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" /> Mnożnik
            </span>
            <div className="flex items-center gap-4 bg-black p-1 rounded-xl border border-slate-800">
              <button
                disabled={loading || isAutoSpin}
                onClick={() => setMultiplier((m) => Math.max(1.1, m - 0.1))}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-black italic text-blue-500 min-w-[3rem] text-center">
                {multiplier.toFixed(1)}x
              </span>
              <button
                disabled={loading || isAutoSpin}
                onClick={() => setMultiplier((m) => Math.min(10, m + 0.1))}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <input
            type="range"
            min="1.1"
            max="10"
            step="0.1"
            value={multiplier}
            disabled={loading || isAutoSpin}
            onChange={(e) => setMultiplier(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="relative group flex items-center bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden focus-within:border-blue-600 transition-all">
          <Coins className="absolute left-5 h-5 w-5 text-slate-600 group-focus-within:text-blue-500 z-10" />
          <button
            disabled={loading || isAutoSpin}
            onClick={() => setBet((b) => Math.max(0, b - 10))}
            className="pl-12 pr-4 py-5 hover:bg-white/5 text-slate-500"
          >
            <Minus className="h-5 w-5" />
          </button>
          <input
            type="number"
            value={bet === 0 ? '' : bet}
            onChange={(e) => setBet(parseInt(e.target.value) || 0)}
            disabled={loading || isAutoSpin}
            placeholder="Stawka"
            className="w-full bg-transparent py-2 font-black text-lg text-white outline-none text-center"
          />
          <button
            disabled={loading || isAutoSpin}
            onClick={() => setBet((b) => b + 10)}
            className="px-6 py-5 hover:bg-white/5 text-slate-500"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* PRZYCISKI AKCJI */}
      <div className="flex gap-4 w-full">
        <button
          onClick={() => setIsAutoSpin(!isAutoSpin)}
          disabled={loading && !isAutoSpin}
          className={`flex-1 flex items-center justify-center gap-2 h-16 rounded-[2rem] font-black uppercase tracking-widest border-2 transition-all ${
            isAutoSpin
              ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
          }`}
        >
          {isAutoSpin ? (
            <Octagon className="h-5 w-5 fill-current animate-pulse" />
          ) : (
            <RotateCw className="h-5 w-5" />
          )}
          {isAutoSpin ? 'STOP' : 'AUTO'}
        </button>

        <button
          disabled={loading || balance < bet || bet <= 0 || isAutoSpin}
          onClick={handlePlay}
          className={`relative flex-[2.5] h-16 rounded-[2rem] font-black uppercase text-xl transition-all italic overflow-hidden ${
            loading || isAutoSpin
              ? 'bg-blue-600/20 border-2 border-blue-500 text-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.3)]'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_40px_rgba(37,99,235,0.3)] active:scale-95'
          }`}
        >
          {loading && (
            <motion.div
              className="absolute inset-0 bg-blue-400/20"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
          <span className="relative z-10">{loading ? 'LOSOWANIE...' : 'GRAJ TERAZ'}</span>
        </button>
      </div>

      <style jsx global>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
    </CasinoGameWrapper>
  )
}
