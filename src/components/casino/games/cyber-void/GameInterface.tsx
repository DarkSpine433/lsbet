'use client'

import React, { useState, useCallback } from 'react'
import { ScratchCanvas } from './ScratchCanvas'
import { Loader2, Sparkles, Minus, Plus, Zap, Trophy, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { playCyberVoidAction } from '@/app/actions/casino/cyber-void'
import { SYMBOLS } from '@/utilities/casino/cyber-void/server/config'
import { useCasinoSounds } from '@/hooks/useCasinoSound'
import { motion, AnimatePresence } from 'motion/react'
import { CasinoGameWrapper } from '../../CasinoGameWrapper'

export default function CyberVoidGame({ balance, onBalanceUpdate, gameData }: any) {
  const [stake, setStake] = useState(10)
  const [gameState, setGameState] = useState<'IDLE' | 'READY_TO_SCRATCH' | 'REVEALED'>('IDLE')
  const [gridData, setGridData] = useState<number[]>(Array(18).fill(0)) // 6 wierszy * 3 kolumny
  const [winData, setWinData] = useState<{ amount: number; multiplier: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { playSpin, playWin, playLose } = useCasinoSounds()

  const getSymbol = (id: number) => Object.values(SYMBOLS).find((s) => s.id === id) || SYMBOLS.VOID

  const handleBuyCard = async () => {
    if (balance < stake) {
      toast.error('Niewystarczające środki!')
      return
    }

    setIsLoading(true)

    try {
      const result = await playCyberVoidAction(stake)
      setGridData(result.grid) // Serwer musi zwracać 18 symboli
      setWinData({ amount: result.winAmount, multiplier: result.multiplier })
      setGameState('READY_TO_SCRATCH')
      onBalanceUpdate(balance - stake)
    } catch (e: any) {
      toast.error(e.message || 'Błąd zakupu karty')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinishReveal = useCallback(() => {
    if (gameState === 'REVEALED') return
    setGameState('REVEALED')

    if (winData && winData.amount > 0) {
      playWin()
      onBalanceUpdate(balance + winData.amount)
      toast.success(`WYGRANA: ${winData.amount.toFixed(2)}$`, {
        icon: '💰',
        style: { background: '#1e293b', color: '#3b82f6', border: '1px solid #3b82f6' },
      })
    } else {
      playLose()
    }
  }, [gameState, winData, balance, onBalanceUpdate, playWin, playLose])

  const handleRevealAll = () => {
    if (gameState !== 'READY_TO_SCRATCH') return
    handleFinishReveal()
  }

  return (
    <CasinoGameWrapper title="Cyber Void" balance={balance} gameData={gameData}>
      <div className="flex flex-col  gap-6 p-4 max-w-6xl mx-auto items-start justify-center">
        {/* PANEL STEROWANIA - Podobnie jak w CoinFlip/Simple20 */}
        <div className="w-full lg:w-[350px] space-y-4 order-1 lg:order-1">
          <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Zap size={18} className="text-blue-500 fill-blue-500" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-white leading-none">
                  Cyber Void
                </h2>
                <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">
                  Relic Hunter Edition
                </p>
              </div>
            </div>

            {/* WYBÓR STAWKI */}
            <div className="space-y-3">
              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">Stawka</span>
                <span className="text-[10px] font-black text-blue-500 uppercase italic">
                  {stake.toFixed(2)} $
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStake(Math.max(1, stake - 10))}
                  disabled={gameState !== 'IDLE'}
                  className="w-12 h-12 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-white hover:bg-slate-700 transition-all disabled:opacity-20"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 h-12 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center font-black text-blue-500 italic">
                  {stake}
                </div>
                <button
                  onClick={() => setStake(stake + 10)}
                  disabled={gameState !== 'IDLE'}
                  className="w-12 h-12 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-white hover:bg-slate-700 transition-all disabled:opacity-20"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                {[10, 50, 100].map((v) => (
                  <button
                    key={v}
                    onClick={() => setStake(v)}
                    disabled={gameState !== 'IDLE'}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all ${stake === v ? 'bg-blue-600 text-white' : 'bg-slate-800/50 text-slate-500 border border-white/5 hover:bg-slate-800'}`}
                  >
                    {v}$
                  </button>
                ))}
              </div>
            </div>

            {/* PRZYCISKI AKCJI */}
            <div className="mt-8 space-y-3">
              {gameState === 'IDLE' ? (
                <button
                  onClick={handleBuyCard}
                  disabled={isLoading || balance < stake}
                  className={`w-full h-16 rounded-[1.5rem] font-black uppercase text-xl transition-all italic flex items-center justify-center gap-3 ${
                    isLoading
                      ? 'bg-blue-600/20 text-blue-400 border-2 border-blue-500'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] active:scale-95'
                  }`}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'KUP KARTĘ'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRevealAll}
                    disabled={gameState === 'REVEALED'}
                    className="w-full h-14 rounded-xl bg-slate-100 text-slate-900 font-black uppercase flex items-center justify-center gap-2 hover:bg-white transition-all active:scale-95"
                  >
                    <Sparkles size={18} /> Zdrap wszystko
                  </button>
                  {gameState === 'REVEALED' && (
                    <button
                      onClick={() => {
                        setGameState('IDLE')
                        setGridData(Array(18).fill(0))
                      }}
                      className="w-full h-14 rounded-xl bg-blue-600/10 border border-blue-500/50 text-blue-500 font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-600/20 transition-all"
                    >
                      Zagraj ponownie
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* TABELA WYPŁAT (TYLKO IKONY) */}
          <div className="bg-slate-900/30 p-4 rounded-2xl border border-white/5">
            <div className="grid grid-cols-4 gap-2">
              {Object.values(SYMBOLS)
                .filter((s) => s.multiplier > 0)
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col items-center p-2 bg-black/20 rounded-lg border border-white/5"
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-[7px] font-black text-blue-500 mt-1">
                      x{s.multiplier}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* OBSZAR ZDRAPKI - 6 WIERSZY X 3 KOLUMNY */}
        <div className="w-full max-w-[400px] order-2 lg:order-2 flex flex-col items-center">
          <div className="relative w-full aspect-[3/6] bg-slate-950 rounded-[2.5rem] border-[10px] border-slate-900 shadow-2xl overflow-hidden shadow-black/50">
            {/* GRID SYMBOLI (POD SPODEM) */}
            <div className="w-full h-full grid grid-cols-3 grid-rows-6 gap-2 p-3">
              {gridData.map((symbolId, idx) => {
                const sym = getSymbol(symbolId)
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center bg-slate-900/40 rounded-xl border border-white/[0.03]"
                  >
                    <span className="text-3xl">{sym.icon}</span>
                    <span className="text-[7px] font-black text-slate-600 uppercase mt-1">
                      {sym.name}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* CANVAS ZDRAPKI */}
            {gameState !== 'IDLE' && (
              <div className="absolute inset-0 z-20">
                <ScratchCanvas
                  width={400}
                  height={800} // Dopasowane do proporcji 3:6
                  isRevealedProp={gameState === 'REVEALED'}
                  onReveal={handleFinishReveal}
                  coverColor="#0f172a"
                  threshold={70} // Zdrapanie 70% odsłania całość
                />
              </div>
            )}

            {/* IDLE OVERLAY */}
            {gameState === 'IDLE' && (
              <div className="absolute inset-0 z-30 bg-slate-900 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
                  <Coins className="text-blue-500 animate-pulse" size={32} />
                </div>
                <h3 className="text-lg font-black uppercase italic text-white leading-none">
                  Wybierz stawkę
                </h3>
                <p className="text-[8px] font-bold text-slate-500 uppercase mt-2 tracking-widest leading-relaxed">
                  Kup kartę, aby przeszukać
                  <br />
                  cyfrową otchłań
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 text-slate-600 text-[8px] font-black uppercase tracking-widest">
            <Trophy size={10} className="text-blue-500" />
            <span>Traf 3 takie same symbole by wygrać</span>
          </div>
        </div>
      </div>
    </CasinoGameWrapper>
  )
}
