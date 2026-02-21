'use client'

import React, { useState } from 'react'
import { CasinoGameWrapper } from '../CasinoGameWrapper' //
import { useCasinoSounds } from '../../../hooks/useCasinoSound' //
import { startBlackjack, standAction, hitAction } from '@/app/actions/casino/blackjack'
import { calculateScore, Card } from '@/utilities/casino/blackjack/engine' //
import { Loader2, Minus, Plus, Shield, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'

export default function BlackjackGame({ balance, onBalanceUpdate, gameData }: any) {
  const [stake, setStake] = useState(10)
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'RESULT'>('IDLE')
  const [playerHand, setPlayerHand] = useState<Card[]>([])
  const [dealerHand, setDealerHand] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { playWin, playCardMove, playLose, stopSpin } = useCasinoSounds()

  const handleDeal = async () => {
    if (balance < stake) return toast.error('Niewystarczające środki!')
    setIsLoading(true)

    const res = await startBlackjack(stake)
    if (res.success) {
      setPlayerHand(res.playerHand!)
      setDealerHand(res.dealerHand!)
      onBalanceUpdate(res.newBalance)
      playCardMove()

      if (res.isBlackjack) {
        setGameState('RESULT')
        playWin()
      } else {
        setGameState('PLAYING')
      }
    } else {
      toast.error(res.error)
    }

    stopSpin()
    setIsLoading(false)
  }

  const handleHit = async () => {
    setIsLoading(true)
    playCardMove()
    const res = await hitAction(playerHand, dealerHand, stake)
    if (res.success) {
      setPlayerHand(res.playerHand!)
      if (res.isBust) {
        setGameState('RESULT')
        playLose()
        if (res.newBalance !== undefined) onBalanceUpdate(res.newBalance)
      }
    }
    setIsLoading(false)
  }

  const handleStand = async () => {
    setIsLoading(true)
    const res = await standAction(playerHand, dealerHand, stake)
    if (res.success) {
      setDealerHand(res.dealerHand!)
      onBalanceUpdate(res.newBalance)
      setGameState('RESULT')
      res.winAmount! > stake ? playWin() : res.winAmount! === stake ? null : playLose()
    }
    setIsLoading(false)
  }

  return (
    <CasinoGameWrapper title="Blackjack Ultra" balance={balance} gameData={gameData} border={false}>
      <div className="flex flex-col items-center gap-10 w-full max-w-4xl p-4 py-12 min-h-[600px] justify-between">
        {/* Dealer Area */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4 h-40">
            <AnimatePresence mode="popLayout">
              {dealerHand.map((card, i) => (
                <motion.div
                  key={`${i}-${card.rank}`}
                  initial={{ x: 200, y: -200, rotate: 20, opacity: 0 }}
                  animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  <CardVisual card={card} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-12 bg-white/10" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Dealer {gameState === 'RESULT' && `(${calculateScore(dealerHand)})`}
            </span>
            <div className="h-[1px] w-12 bg-white/10" />
          </div>
        </div>

        {/* Player Area */}
        <div className="flex flex-col items-center gap-8">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 px-8 py-3 rounded-2xl flex items-center gap-4 shadow-2xl">
            <span className="text-[10px] font-black text-blue-500 uppercase">Twój Wynik</span>
            <div className="h-6 w-[1px] bg-white/10" />
            <span className="text-2xl font-black italic text-white leading-none">
              {calculateScore(playerHand)}
            </span>
          </div>

          <div className="flex gap-4 h-40">
            <AnimatePresence mode="popLayout">
              {playerHand.map((card, i) => (
                <motion.div
                  key={`${i}-${card.rank}`}
                  initial={{ x: 200, y: 200, rotate: -20, opacity: 0 }}
                  animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  <CardVisual card={card} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-sm">
          {gameState === 'IDLE' || gameState === 'RESULT' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center justify-between bg-slate-900/80 p-1 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <button
                    onClick={() => setStake((s) => Math.max(1, s - 10))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Minus size={18} className="text-slate-400" />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1">
                      Stawka
                    </span>
                    <span className="text-xl font-black italic text-blue-500">{stake}$</span>
                  </div>
                  <button
                    onClick={() => setStake((s) => s + 10)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Plus size={18} className="text-blue-500" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleDeal}
                disabled={isLoading}
                className="w-full h-16 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase italic text-xl shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'ZAGRAJ TERAZ'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleHit}
                disabled={isLoading}
                className="h-20 bg-white hover:bg-slate-100 text-slate-950 rounded-2xl font-black uppercase italic text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                HIT
              </button>
              <button
                onClick={handleStand}
                disabled={isLoading}
                className="h-20 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase italic text-lg shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                STAND
              </button>
            </div>
          )}
        </div>
      </div>
    </CasinoGameWrapper>
  )
}

function CardVisual({ card }: { card: Card }) {
  return (
    <div
      className={`w-24 h-36 rounded-xl border-2 flex items-center justify-center transition-all ${
        card.isFlipped ? 'bg-white border-slate-200 shadow-xl' : 'bg-blue-900 border-blue-400'
      }`}
    >
      {card.isFlipped ? (
        <div
          className={`flex flex-col items-center ${['hearts', 'diamonds'].includes(card.suit) ? 'text-red-500' : 'text-black'}`}
        >
          <span className="text-xl font-black">{card.rank}</span>
          <span className="text-2xl">
            {card.suit === 'hearts'
              ? '♥'
              : card.suit === 'diamonds'
                ? '♦'
                : card.suit === 'clubs'
                  ? '♣'
                  : '♠'}
          </span>
        </div>
      ) : (
        <Shield size={32} className="text-blue-400/30" />
      )}
    </div>
  )
}
