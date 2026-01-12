'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RefreshCw, Zap, Plus, Minus, Octagon, RotateCw } from 'lucide-react'
import { playJackpotBellsAction } from '@/app/actions/casino/jackpot-bells'
import { CasinoGameWrapper } from '../CasinoGameWrapper'
import { useCasinoSounds } from '@/hooks/useCasinoSound'

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🍉', '7️⃣', '🔔']
const ANIM_COUNT = 40

export default function JackpotBells({ balance, onBalanceUpdate, gameData }: any) {
  const [spinning, setSpinning] = useState(false)
  const [columnSpinning, setColumnSpinning] = useState([false, false, false, false, false])
  const [autoSpin, setAutoSpin] = useState(false)
  const [stake, setStake] = useState(5)
  const [lastWin, setLastWin] = useState(0)
  const [winningCells, setWinningCells] = useState<number[]>([])

  // Inicjalizacja dźwięków
  const { playSpin, stopSpin, playWin, playLose } = useCasinoSounds()

  const [displayGrid, setDisplayGrid] = useState([
    ['🍒', '7️⃣', '🍒'],
    ['🍋', '🔔', '🍋'],
    ['🍊', '🍉', '🍊'],
    ['🍇', '🍋', '🍇'],
    ['🍉', '🍒', '🍉'],
  ])

  const [reelStrips, setReelStrips] = useState<string[][]>(displayGrid)

  const spin = useCallback(async () => {
    // Blokada jeśli kręci, brak środków lub ujemna stawka
    if (spinning || balance < stake || stake <= 0) {
      setAutoSpin(false)
      return
    }

    setWinningCells([])
    setLastWin(0)
    setSpinning(true)

    // START: Dźwięk kręcenia
    playSpin()

    // Przygotowanie "rozpędzonych" bębnów
    const initialStrips = displayGrid.map((col) => {
      const randomFill = Array.from(
        { length: ANIM_COUNT },
        () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      )
      return [...randomFill, ...col]
    })
    setReelStrips(initialStrips)
    setColumnSpinning([true, true, true, true, true])

    try {
      const result = await playJackpotBellsAction(stake)

      const finalColumns = [
        [result.grid[0], result.grid[5], result.grid[10]],
        [result.grid[1], result.grid[6], result.grid[11]],
        [result.grid[2], result.grid[7], result.grid[12]],
        [result.grid[3], result.grid[8], result.grid[13]],
        [result.grid[4], result.grid[9], result.grid[14]],
      ]

      // Kaskadowe zatrzymywanie
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 600 + i * 400))

        setReelStrips((prev) => {
          const updated = [...prev]
          const transitionBuffer = Array.from(
            { length: ANIM_COUNT },
            () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          )
          updated[i] = [...finalColumns[i], ...transitionBuffer, ...displayGrid[i]]
          return updated
        })

        setColumnSpinning((prev) => {
          const next = [...prev]
          next[i] = false
          return next
        })

        setDisplayGrid((prev) => {
          const next = [...prev]
          next[i] = finalColumns[i]
          return next
        })
      }

      // Po zatrzymaniu ostatniej kolumny
      setTimeout(() => {
        // STOP: Wyłączamy dźwięk kręcenia
        stopSpin()

        setLastWin(result.winAmount)
        setWinningCells(result.winningIndices)
        onBalanceUpdate(result.newBalance)
        setSpinning(false)

        // Dźwięk wyniku
        if (result.winAmount > 0) {
          playWin()
        } else {
          playLose()
        }
      }, 700)
    } catch (err) {
      console.error(err)
      stopSpin() // Wyłącz dźwięk w razie błędu
      setSpinning(false)
      setAutoSpin(false)
      setColumnSpinning([false, false, false, false, false])
    }
  }, [
    spinning,
    balance,
    stake,
    displayGrid,
    onBalanceUpdate,
    playSpin,
    stopSpin,
    playWin,
    playLose,
  ])

  // System Auto Spin
  useEffect(() => {
    let timer: any
    if (autoSpin && !spinning) {
      const delay = lastWin > 0 ? 2000 : 1200
      timer = setTimeout(spin, delay)
    }
    return () => clearTimeout(timer)
  }, [autoSpin, spinning, spin, lastWin])

  return (
    <CasinoGameWrapper balance={balance} gameData={gameData} title="Jackpot Bells">
      <div className="w-full max-w-5xl flex flex-col items-center gap-8">
        {/* REELS CONTAINER */}
        <div className="relative bg-slate-900 rounded-[3rem] border-b-[12px] border-black shadow-2xl w-full">
          <div
            className={`relative flex gap-2 md:gap-4 bg-black/80 p-4 rounded-[2rem] overflow-hidden border-4 transition-colors duration-500 ${!spinning && lastWin > 0 ? 'border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.3)]' : 'border-white/50'}`}
          >
            {reelStrips.map((strip, colIdx) => (
              <div
                key={colIdx}
                className="relative flex-1 h-[200px] md:h-[350px] bg-slate-950 rounded-2xl overflow-hidden border border-white/5"
              >
                <motion.div
                  animate={columnSpinning[colIdx] ? { y: [0, -(ANIM_COUNT * 100)] } : { y: 0 }}
                  initial={{ y: 0 }}
                  transition={
                    columnSpinning[colIdx]
                      ? { duration: 0.15, repeat: Infinity, ease: 'linear' }
                      : { type: 'spring', stiffness: 30, damping: 12 }
                  }
                  className="flex flex-col items-center"
                >
                  {strip.map((symbol, sIdx) => {
                    const gridIndex = sIdx === 0 ? colIdx : sIdx === 1 ? colIdx + 5 : colIdx + 10
                    const isWinning = !spinning && winningCells.includes(gridIndex) && sIdx < 3

                    return (
                      <div
                        key={sIdx}
                        className="h-[66px] md:h-[116px] flex items-center justify-center text-4xl md:text-7xl shrink-0"
                      >
                        <span
                          className={`transition-all duration-500 ${isWinning ? 'scale-125 brightness-125 drop-shadow-[0_0_20px_gold] z-50 animate-bounce' : 'opacity-90'}`}
                        >
                          {symbol}
                        </span>
                      </div>
                    )
                  })}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL STEROWANIA */}
        <div className="w-full bg-slate-900/90 p-6 rounded-[2.5rem] border border-slate-700 backdrop-blur-md flex flex-wrap flex-col-reverse sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col-reverse sm:flex-col gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter text-center">
              Zakład (5 linii)
            </span>
            <div className="flex items-center gap-4 bg-black/50 p-2 rounded-2xl">
              <button
                onClick={() => setStake(Math.max(5, stake - 5))}
                disabled={spinning || autoSpin}
                className="p-2 bg-slate-800 rounded-lg text-white disabled:opacity-30 hover:bg-slate-700 transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl font-black text-yellow-500 italic min-w-[60px] text-center">
                {stake}$
              </span>
              <button
                onClick={() => setStake(stake + 5)}
                disabled={spinning || autoSpin}
                className="p-2 bg-slate-800 rounded-lg text-white disabled:opacity-30 hover:bg-slate-700 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-slate-400 uppercase">Suma Wygranych</span>
            <div
              className={`text-4xl font-black transition-all ${lastWin > 0 ? 'text-green-400 scale-110' : 'text-slate-600'}`}
            >
              {lastWin.toFixed(2)}$
            </div>
          </div>

          <div className="flex flex-row   sms:items-center gap-4">
            {/* PRZYCISK AUTO SPIN */}
            <button
              onClick={() => setAutoSpin(!autoSpin)}
              className={`flex items-center flex-col justify-center gap-2 px-2 py-1 rounded-2xl font-black uppercase transition-all border-2 ${
                autoSpin
                  ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {autoSpin ? <Octagon className="animate-pulse" size={24} /> : <RotateCw size={24} />}
              {autoSpin ? 'STOP' : 'AUTO'}
            </button>

            {/* PRZYCISK ZAGRAJ */}
            <button
              onClick={spin}
              disabled={spinning || balance < stake || autoSpin}
              className={`px-6 py-2 rounded-2xl shadow-lg active:scale-95 transition-all ${
                spinning || autoSpin
                  ? 'bg-blue-600/20 border-2 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                  : 'bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white'
              }`}
            >
              <div className="flex items-center gap-3 font-black text-xl uppercase italic">
                <Zap fill="currentColor" />
                {spinning ? 'Kręcę...' : 'Zagraj'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </CasinoGameWrapper>
  )
}
