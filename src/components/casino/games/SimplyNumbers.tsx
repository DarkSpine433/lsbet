'use client'

import React, { useState } from 'react'
import { runCasinoGame } from '@/app/actions/casinoLogic'
import { toast } from 'sonner'
import {
  Banknote,
  Coins,
  Zap,
  Minus,
  Plus,
  Hash,
  BookOpen,
  ScrollText,
  PlayCircle,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SimplyNumbers({ balance, onBalanceUpdate, gameSlug, gameData }: any) {
  const [bet, setBet] = useState<number>(10)
  const [multiplier, setMultiplier] = useState<number>(2.0)
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const possibleWin = (bet * multiplier).toFixed(2)

  const resetResult = () => {
    if (lastResult) setLastResult(null)
  }

  const changeMultiplier = (amount: number) => {
    setMultiplier((prev) => {
      const newVal = Math.min(10, Math.max(1.1, parseFloat((prev + amount).toFixed(1))))
      return newVal
    })
    resetResult()
  }

  const handlePlay = async () => {
    if (bet <= 0 || bet > balance) return toast.error('Błędna stawka!')
    setLoading(true)
    setLastResult(null)

    try {
      const result = await runCasinoGame(bet, gameSlug, multiplier)
      setTimeout(() => {
        if (result && !result.error) {
          setLastResult(result)
          onBalanceUpdate(result.newBalance)
        } else if (result?.error) {
          toast.error(result.error)
        }
        setLoading(false)
      }, 700)
    } catch (e) {
      toast.error('Błąd połączenia')
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-[#020617] text-white">
      <Tabs defaultValue="play" className="w-full">
        {/* NAWIGACJA ZAKŁADEK */}
        <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 p-1 rounded-2xl mb-6 border border-slate-800">
          <TabsTrigger
            value="play"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white flex gap-2 font-bold uppercase text-[10px]"
          >
            <PlayCircle className="h-3.5 w-3.5" /> Gra
          </TabsTrigger>
          <TabsTrigger
            value="description"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white flex gap-2 font-bold uppercase text-[10px]"
          >
            <BookOpen className="h-3.5 w-3.5" /> Opis
          </TabsTrigger>
          <TabsTrigger
            value="rules"
            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white flex gap-2 font-bold uppercase text-[10px]"
          >
            <ScrollText className="h-3.5 w-3.5" /> Zasady
          </TabsTrigger>
        </TabsList>

        {/* --- TAB: GRA --- */}
        <TabsContent
          value="play"
          className="space-y-6 animate-in fade-in duration-300 outline-none"
        >
          {/* PANEL ZYSKU */}
          <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3 text-slate-400">
              <Banknote className="h-5 w-5 text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Możliwy Zysk</span>
            </div>
            <span className="text-xl font-black italic text-green-400">{possibleWin} PLN</span>
          </div>

          {/* EKRAN WYNIKU */}
          <div
            className={`w-full h-40 rounded-[2.5rem] border-2 flex flex-col items-center justify-center transition-all duration-500 ${
              loading
                ? 'border-blue-500 bg-blue-500/5 animate-pulse'
                : lastResult?.win
                  ? 'border-green-500 bg-green-500/10 shadow-[0_0_50px_rgba(34,197,94,0.3)]'
                  : lastResult?.win === false
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-slate-800 bg-slate-950/50'
            }`}
          >
            {loading ? (
              <p className="text-blue-400 font-black italic uppercase animate-pulse">
                Losowanie...
              </p>
            ) : lastResult ? (
              <div className="text-center animate-in zoom-in duration-300">
                <p
                  className={`text-6xl font-black italic tracking-tighter ${lastResult.win ? 'text-green-500' : 'text-red-500'}`}
                >
                  {lastResult.win ? `+${lastResult.winAmount}` : `-${bet}`}
                </p>
                <p className="text-[10px] font-bold text-white/30 uppercase mt-2 tracking-widest">
                  System Simply Numbers
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Hash className="h-6 w-6 text-slate-700" />
                <p className="text-slate-600 font-black italic uppercase text-xs tracking-widest">
                  Wybierz stawkę i graj
                </p>
              </div>
            )}
          </div>

          {/* KONTROLE */}
          <div className="space-y-4">
            <div className="w-full bg-slate-900/40 p-5 rounded-[2.5rem] border border-slate-800 space-y-4 shadow-inner">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" /> Mnożnik
                </span>
                <div className="flex items-center gap-4 bg-black p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => changeMultiplier(-0.1)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-black italic text-blue-500 min-w-[3rem] text-center">
                    {multiplier.toFixed(1)}
                  </span>
                  <button
                    onClick={() => changeMultiplier(0.1)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
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
                onChange={(e) => {
                  setMultiplier(parseFloat(e.target.value))
                  resetResult()
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="relative group">
              <Coins className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-blue-500" />
              <input
                type="number"
                value={bet === 0 ? '' : bet}
                onChange={(e) => {
                  setBet(parseInt(e.target.value) || 0)
                  resetResult()
                }}
                placeholder="Twoja stawka..."
                className="w-full bg-slate-900 border border-slate-800 rounded-3xl py-5 pl-14 pr-6 font-black text-lg text-white outline-none focus:border-blue-600 text-center"
              />
            </div>
          </div>

          <button
            disabled={loading || balance < bet || bet <= 0}
            onClick={handlePlay}
            className="w-full h-20 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 rounded-[2rem] font-black uppercase text-xl shadow-[0_10px_40px_rgba(37,99,235,0.3)] active:scale-95 transition-all italic"
          >
            {loading ? 'Przetwarzanie...' : 'Graj Teraz'}
          </button>
        </TabsContent>

        {/* --- TAB: OPIS --- */}
        <TabsContent
          value="description"
          className="outline-none animate-in slide-in-from-right-5 duration-300"
        >
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 space-y-4 min-h-[300px]">
            <h3 className="text-xl font-black italic uppercase text-blue-500 flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> O grze
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm font-medium whitespace-pre-wrap">
              {/* Tutaj pobieramy opis z bazy danych */}
              {gameData?.description || 'Brak opisu w bazie danych.'}
            </p>
            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Kategoria: {gameData?.category?.title || 'Instant Win'}
            </div>
          </div>
        </TabsContent>

        {/* --- TAB: ZASADY --- */}
        <TabsContent
          value="rules"
          className="outline-none animate-in slide-in-from-right-5 duration-300"
        >
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 space-y-4 min-h-[300px]">
            <h3 className="text-xl font-black italic uppercase text-yellow-500 flex items-center gap-2">
              <ScrollText className="h-5 w-5" /> Zasady gry
            </h3>
            <div className="text-slate-300 text-sm space-y-3 font-medium whitespace-pre-line">
              {/* Tutaj pobieramy zasady z bazy danych */}
              {gameData?.rules || 'Brak zasad w bazie danych.'}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-[9px] text-slate-700 font-bold uppercase italic opacity-40 text-center mt-6">
        lsCasino © {new Date().getFullYear()} - {gameData?.title || 'System'}
      </div>
    </div>
  )
}
