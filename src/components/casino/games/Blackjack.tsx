'use client'

import React, { useState } from 'react'
import { CasinoGameWrapper } from '../CasinoGameWrapper' //
import { useCasinoSounds } from '../../../hooks/useCasinoSound' //
import { startBlackjack, standAction } from '@/app/actions/casino/blackjack'
import { calculateScore, Card } from '@/utilities/casino/blackjack/engine' //
import { Loader2, Minus, Plus, Shield } from 'lucide-react'
import { toast } from 'sonner'

export default function BlackjackGame({ balance, onBalanceUpdate, gameData }: any) {
  const [stake, setStake] = useState(10)
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'RESULT'>('IDLE')
  const [playerHand, setPlayerHand] = useState<Card[]>([])
  const [dealerHand, setDealerHand] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { playSpin, playWin, playLose, playCardMove, stopSpin } = useCasinoSounds()

  const handleDeal = async () => {
    setIsLoading(true)
    playSpin()

    const res = await startBlackjack(stake)
    if (res.success) {
      setPlayerHand(res.playerHand!)
      setDealerHand(res.dealerHand!)
      onBalanceUpdate(res.newBalance)
      playCardMove()
      setGameState(res.isBlackjack ? 'RESULT' : 'PLAYING')
      if (res.isBlackjack) playWin()
    } else {
      toast.error(res.error)
    }

    stopSpin()
    setIsLoading(false)
  }

  const handleStand = async () => {
    setIsLoading(true)
    const res = await standAction(playerHand, dealerHand, stake)
    if (res.success) {
      setDealerHand(res.dealerHand!)
      onBalanceUpdate(res.newBalance)
      setGameState('RESULT')
      res.winAmount! > 0 ? playWin() : playLose()
    }
    setIsLoading(false)
  }

  return (
    <CasinoGameWrapper title="Blackjack Pro" balance={balance} gameData={gameData}>
      <div className="flex flex-col items-center gap-12 w-full max-w-4xl p-4">
        {/* Dealer Area */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2 h-36">
            {dealerHand.map((card, i) => (
              <CardVisual key={i} card={card} />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Dealer Hand
          </span>
        </div>

        {/* Player Area */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-2 h-36">
            {playerHand.map((card, i) => (
              <CardVisual key={i} card={card} />
            ))}
          </div>
          <div className="bg-blue-600 px-6 py-2 rounded-full font-black italic shadow-lg">
            SCORE: {calculateScore(playerHand)}
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-xs space-y-4">
          {gameState === 'IDLE' || gameState === 'RESULT' ? (
            <>
              <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-white/5">
                <button onClick={() => setStake((s) => Math.max(1, s - 10))} className="p-2">
                  <Minus size={16} />
                </button>
                <span className="font-black">{stake} $</span>
                <button onClick={() => setStake((s) => s + 10)} className="p-2">
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleDeal}
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 rounded-xl font-black uppercase hover:bg-blue-500 transition-colors"
              >
                {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'ROZDAJ'}
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                disabled
                className="py-4 bg-white text-black rounded-xl font-black uppercase opacity-50"
              >
                HIT
              </button>
              <button
                onClick={handleStand}
                className="py-4 bg-blue-600 text-white rounded-xl font-black uppercase"
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
