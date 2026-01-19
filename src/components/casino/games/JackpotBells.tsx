'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
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

  const { playSpin, stopSpin, playWin, playLose } = useCasinoSounds()

  // Pre-load dźwięków lokalnie, aby uniknąć opóźnień
  const audioCache = useMemo(() => {
    if (typeof window === 'undefined') return {}
    return {
      menuClick: new Audio('https://assets.mixkit.co/active_storage/sfx/1117/1117-preview.mp3'),
      tileDeselect: new Audio('https://assets.mixkit.co/active_storage/sfx/1108/1108-preview.mp3'),
      tileSelect: new Audio('https://assets.mixkit.co/active_storage/sfx/1109/1109-preview.mp3'),
      reveal: new Audio('https://assets.mixkit.co/active_storage/sfx/211/211-preview.mp3'),
    }
  }, [])

  const playCachedEffect = (audioKey: keyof typeof audioCache) => {
    const isMuted = localStorage.getItem('casino_muted') === 'true'
    if (isMuted || !audioCache[audioKey]) return

    const sound = audioCache[audioKey] as HTMLAudioElement
    sound.currentTime = 0 // Resetuje czas, aby dźwięki się nie nakładały (nie stakowały)
    sound.volume = 0.3
    sound.play().catch(() => {})
  }

  const playMenuClick = () => playCachedEffect('menuClick')
  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Usuwamy wszystko co nie jest cyfrą
    const rawValue = e.target.value.replace(/\D/g, '')

    if (rawValue === '') {
      setStake(0)
      return
    }

    // Parsujemy na liczbę, co automatycznie usuwa zera z przodu (np. "020" -> 20)
    const numValue = parseInt(rawValue, 10)
    setStake(numValue)
  }

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
                      ? { duration: 0.3, repeat: Infinity, ease: 'linear' }
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
          <div className="w-full max-w-[500px] mx-auto bg-slate-900/90 p-4 sm:p-6 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col gap-4">
              {/* Nagłówek sekcji zakładu */}
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                  Konfiguracja Gry
                </span>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">
                  5 Linii Płatnych
                </span>
              </div>

              {/* Główny kontener sterowania */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                {/* Kontener Stawki */}
                <div className="flex-1 flex items-center bg-[#0f172a] border border-slate-700/50 p-1.5 rounded-2xl shadow-inner group transition-all hover:border-slate-500">
                  {/* Przycisk Minus */}
                  <button
                    onClick={() => {
                      playMenuClick()
                      setStake(Math.max(1, stake - 10))
                    }}
                    className="h-12 w-12 flex items-center justify-center bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-xl text-slate-400 active:scale-90 transition-all border border-slate-700/50"
                  >
                    <Minus size={18} strokeWidth={3} />
                  </button>

                  {/* Input i Etykieta */}
                  <div className="flex-1 flex flex-col items-center justify-center min-w-[80px]">
                    <span className="text-[8px] font-black text-slate-500 uppercase leading-none mb-1 group-hover:text-blue-500 transition-colors">
                      Twój Zakład
                    </span>
                    <div className="relative flex items-center justify-center">
                      {/* Znak dolara z ujemnym marginesem prawym, aby dosunąć input */}
                      <span className="text-yellow-500 font-black text-lg italic select-none mr-0.5">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={stake === 0 ? '' : stake}
                        onChange={handleStakeChange}
                        // Zmniejszono padding-left i ustawiono text-left, aby wartość zaczynała się zaraz za $
                        // Jeśli wolisz wyrównanie do środka, używamy w-fit (wymaga dodatkowej logiki)
                        // lub po prostu szerokości dopasowanej do fontu.
                        className="bg-transparent text-left text-xl font-black text-white w-16 outline-none placeholder:text-slate-700"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Przycisk Plus */}
                  <button
                    onClick={() => {
                      playMenuClick()
                      setStake(stake + 10)
                    }}
                    className="h-12 w-12 flex items-center justify-center bg-slate-800 hover:bg-green-500/20 hover:text-green-500 rounded-xl text-slate-400 active:scale-90 transition-all border border-slate-700/50"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>

                {/* Szybkie wybory (Opcjonalnie - dodaje profesjonalizmu) */}
                <div className="hidden sm:flex flex-col justify-between gap-1">
                  <button
                    onClick={() => setStake(stake * 2)}
                    className="px-3 py-1.5 bg-slate-800/50 hover:bg-blue-600 rounded-lg text-[9px] font-black uppercase transition-all border border-slate-700/50"
                  >
                    x2
                  </button>
                  <button
                    onClick={() => setStake(Math.floor(stake / 2))}
                    className="px-3 py-1.5 bg-slate-800/50 hover:bg-blue-600 rounded-lg text-[9px] font-black uppercase transition-all border border-slate-700/50"
                  >
                    1/2
                  </button>
                </div>
              </div>

              {/* Stopka informacyjna */}
              <p className="text-center text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                Zmień stawkę za pomocą przycisków lub wpisz własną kwotę
              </p>
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
