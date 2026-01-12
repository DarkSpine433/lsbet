'use client'

import { playCoinFlip } from '@/app/actions/casino/coin-flip'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RefreshCcw, Loader2, Minus, Plus, Info, Trophy, XCircle, Coins } from 'lucide-react'
import { CasinoGameWrapper } from '../CasinoGameWrapper'
import { useCasinoSounds } from '@/hooks/useCasinoSound'

type Difficulty = 'normal' | 'boost' | 'extra'

const MODES = {
  normal: { label: '3', count: 3, mult: 2.0 },
  boost: { label: '4', count: 4, mult: 3.5 },
  extra: { label: '5', count: 5, mult: 5.0 },
}

export default function CoinFlipGame({
  initialMoney = 1000,
  gameData,
}: {
  initialMoney?: number
  gameData: any
}) {
  const [balance, setBalance] = useState(initialMoney)
  const [stake, setStake] = useState(10)
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')

  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [gameState, setGameState] = useState<'picking' | 'processing' | 'revealing' | 'result'>(
    'picking',
  )
  const [board, setBoard] = useState<string[]>(Array(20).fill(''))
  const [winData, setWinData] = useState<{ isWin: boolean; amount: number } | null>(null)
  const [showResultOverlay, setShowResultOverlay] = useState(false)

  const { playWin, playLose } = useCasinoSounds()

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

  useEffect(() => {
    if (gameState === 'revealing') {
      selectedIndices.forEach((_, order) => {
        setTimeout(() => {
          playCachedEffect('reveal')
        }, order * 450)
      })
    }
  }, [gameState, selectedIndices])

  const handleTileClick = (index: number) => {
    if (gameState !== 'picking') return

    if (selectedIndices.includes(index)) {
      playCachedEffect('tileDeselect')
      setSelectedIndices((prev) => prev.filter((i) => i !== index))
    } else if (selectedIndices.length < MODES[difficulty].count) {
      playCachedEffect('tileSelect')
      setSelectedIndices((prev) => [...prev, index])
    }
  }

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

  const handlePlay = async () => {
    if (selectedIndices.length !== MODES[difficulty].count || balance < stake) return
    setGameState('processing')

    try {
      const result = await playCoinFlip(stake, difficulty, selectedIndices)
      setBoard(result.board)
      setGameState('revealing')

      const revealTime = selectedIndices.length * 450 + 400

      setTimeout(() => {
        setBalance(result.newBalance)
        setWinData({ isWin: result.isWin, amount: result.wonAmount })
        setGameState('result')
        setShowResultOverlay(true)

        const isMuted = localStorage.getItem('casino_muted') === 'true'
        if (!isMuted) {
          result.isWin ? playWin() : playLose()
        }
      }, revealTime)
    } catch (e: any) {
      setGameState('picking')
    }
  }

  const resetGame = () => {
    playMenuClick()
    setGameState('picking')
    setSelectedIndices([])
    setBoard(Array(20).fill(''))
    setWinData(null)
    setShowResultOverlay(false)
  }

  return (
    <CasinoGameWrapper gameData={gameData} title="Coin Flip" balance={balance}>
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-2 sm:px-4 py-4">
        <div className="relative p-3 sm:p-6 bg-[#050b14] border-4 border-[#1e293b] rounded-[2rem] shadow-2xl w-full max-w-[480px]">
          <div className="grid grid-cols-5 gap-2 sm:gap-3 relative z-10">
            {Array.from({ length: 20 }).map((_, index) => {
              const isSelected = selectedIndices.includes(index)
              const order = selectedIndices.indexOf(index)
              const isRevealed = (gameState === 'revealing' && isSelected) || gameState === 'result'

              return (
                <div key={index} className="aspect-[3/4] perspective-1000">
                  <motion.div
                    className="w-full h-full relative preserve-3d cursor-pointer"
                    animate={{ rotateY: isRevealed ? 180 : 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                      delay: gameState === 'revealing' && isSelected ? order * 0.45 : 0,
                    }}
                    onClick={() => handleTileClick(index)}
                  >
                    <div
                      className={`absolute inset-0 backface-hidden rounded-lg border-b-[3px] sm:border-b-4 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-blue-600 border-blue-800' : 'bg-[#0f172a] border-[#1e293b]'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Coins
                          size={18}
                          className={`${isSelected ? 'text-blue-200' : 'text-slate-700'} sm:w-6 sm:h-6 transition-colors`}
                        />
                        {isSelected && (
                          <span className="text-white font-black text-xs sm:text-sm italic leading-none">
                            {order + 1}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`absolute inset-0 backface-hidden rounded-lg flex items-center justify-center text-xl sm:text-3xl bg-[#0b1121] border transition-all duration-500 shadow-inner ${
                        isSelected && gameState === 'result'
                          ? 'border-blue-500 bg-blue-900/30 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                          : 'border-slate-700'
                      }`}
                      style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                    >
                      {board[index]}
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </div>

          <AnimatePresence>
            {showResultOverlay && winData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setShowResultOverlay(false)}
                className="absolute inset-0 z-30 flex items-center justify-center p-4 cursor-pointer"
              >
                <div
                  className={`p-6 rounded-[2rem] border-4 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center bg-black/80 pointer-events-none ${winData.isWin ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}
                >
                  {winData.isWin ? (
                    <Trophy size={40} className="mb-2" />
                  ) : (
                    <XCircle size={40} className="mb-2" />
                  )}
                  <h2 className="text-xl sm:text-3xl font-black uppercase italic leading-none">
                    {winData.isWin ? 'Wygrana!' : 'Przegrana'}
                  </h2>
                  {winData.isWin && (
                    <p className="text-xl font-mono font-bold text-white mt-1">
                      +{winData.amount.toFixed(2)}
                    </p>
                  )}
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-tight text-white/70">
                    Kliknij na mnie żeby zobaczyć jak było blisko wygranej
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full max-w-[480px] mt-4 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 h-12 sm:h-16">
            <div className="flex items-center justify-between bg-[#0f1523] border border-[#1e293b] p-1 rounded-xl h-full">
              <button
                onClick={() => {
                  playMenuClick()
                  setStake(Math.max(1, stake - 10))
                }}
                className="h-full aspect-square flex items-center justify-center bg-slate-800 rounded-lg text-white active:scale-90 transition-transform"
              >
                <Minus size={14} />
              </button>
              <div className="flex flex-col items-center flex-1">
                <p className="text-[7px] font-bold text-slate-500 uppercase leading-none mb-1">
                  Stawka
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={stake === 0 ? '' : stake}
                  onChange={handleStakeChange}
                  className="bg-transparent text-center text-sm sm:text-lg font-black text-yellow-500 w-full outline-none"
                />
              </div>
              <button
                onClick={() => {
                  playMenuClick()
                  setStake(stake + 10)
                }}
                className="h-full aspect-square flex items-center justify-center bg-slate-800 rounded-lg text-white active:scale-90 transition-transform"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex bg-[#0f1523] border border-[#1e293b] p-1 rounded-xl h-full">
              {(Object.keys(MODES) as Difficulty[]).map((m) => (
                <button
                  key={m}
                  disabled={gameState !== 'picking'}
                  onClick={() => {
                    if (difficulty !== m) {
                      playMenuClick()
                      setDifficulty(m)
                      setSelectedIndices([])
                    }
                  }}
                  className={`flex-1 rounded-lg text-xs font-black uppercase transition-all flex flex-col items-center justify-center ${difficulty === m ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}
                >
                  {MODES[m].label} <span className="text-[10px] opacity-60">x{MODES[m].mult}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full">
            {gameState === 'picking' ? (
              <button
                onClick={handlePlay}
                disabled={selectedIndices.length !== MODES[difficulty].count}
                className={`w-full h-12 sm:h-14 rounded-xl font-black text-sm sm:text-lg uppercase italic tracking-widest transition-all shadow-lg active:scale-[0.98]
                  ${selectedIndices.length === MODES[difficulty].count ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed'}`}
              >
                {selectedIndices.length < MODES[difficulty].count
                  ? `Wybierz ${MODES[difficulty].count - selectedIndices.length}`
                  : 'Graj'}
              </button>
            ) : gameState === 'result' ? (
              <button
                onClick={resetGame}
                className="w-full h-12 sm:h-14 rounded-xl bg-slate-700 text-white font-black uppercase flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <RefreshCcw size={16} /> Resetuj
              </button>
            ) : (
              <div className="w-full h-12 sm:h-14 rounded-xl bg-slate-800 flex items-center justify-center border border-[#1e293b]">
                <Loader2 className="animate-spin text-blue-500 mr-2" size={18} />
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase italic">
                  Sprawdzam...
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 opacity-40 flex items-center gap-1.5 text-slate-500 text-[8px] font-bold uppercase">
          <Info size={10} />
          <span>Traf {MODES[difficulty].count} te same symbole</span>
        </div>
      </div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </CasinoGameWrapper>
  )
}
