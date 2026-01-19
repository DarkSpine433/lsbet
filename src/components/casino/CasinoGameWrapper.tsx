'use client'

import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlayCircle, BookOpen, ScrollText, Wallet, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface CasinoGameWrapperProps {
  children: React.ReactNode
  gameData: any
  title: string
  balance: number
  isSpinning?: boolean
  isWin?: boolean
}

export const CasinoGameWrapper = ({
  children,
  gameData,
  title,
  balance,
}: CasinoGameWrapperProps) => {
  const [isMuted, setIsMuted] = useState<boolean>(false)

  useEffect(() => {
    const savedMute = localStorage.getItem('casino_muted')
    if (savedMute === 'true') {
      setIsMuted(true)
    }
  }, [])

  const toggleMute = () => {
    const newState = !isMuted
    setIsMuted(newState)
    localStorage.setItem('casino_muted', String(newState))
  }

  return (
    <div className="w-full min-h-screen bg-[#020617] text-white flex flex-col">
      <Tabs defaultValue="play" className="w-full flex-1 flex flex-col">
        {/* Kontener treści gry */}
        <div className="flex-1 w-full max-w-7xl mx-auto ">
          <AnimatePresence mode="wait">
            <TabsContent value="play" key="play-content" className="mt-0 outline-none border-none">
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="flex flex-col items-center bg-[#020617] rounded-[3rem] border border-slate-800 p-4 md:p-10 gap-4  w-fit mx-auto">
                  {children}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="description" key="desc-content" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 border border-slate-800/60 rounded-[2.5rem] p-8"
              >
                <p className="text-slate-300 text-sm font-medium whitespace-pre-wrap leading-relaxed">
                  {gameData?.description || 'Opis gry nie jest dostępny.'}
                </p>
              </motion.div>
            </TabsContent>

            <TabsContent value="rules" key="rules-content" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 border border-slate-800/60 rounded-[2.5rem] p-8"
              >
                <div className="text-slate-300 text-sm font-medium whitespace-pre-line leading-loose bg-black/20 p-6 rounded-2xl border border-white/5">
                  {gameData?.rules || 'Zasady gry nie są obecnie dostępne.'}
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </div>

        {/* PRZYKLEJONE MENU NA DOLE */}
        <div className="sticky bottom-0 translate-y-2 left-0 right-0 z-50 w-full p-1 bg-[#020617]/80 backdrop-blur-md border-t border-slate-800/50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-[2rem] border border-slate-800/50">
            {/* PRZYCISKI ZAKŁADEK */}
            <TabsList className="grid grid-cols-3 bg-black/40 rounded-xl border border-slate-800 w-full md:w-auto min-w-[300px]">
              <TabsTrigger
                value="play"
                className="rounded-lg data-[state=active]:bg-blue-600 font-black uppercase text-[9px] py-2 transition-all outline-none"
              >
                <PlayCircle className="h-3.5 w-3.5 mr-1.5" /> Gra
              </TabsTrigger>
              <TabsTrigger
                value="description"
                className="rounded-lg data-[state=active]:bg-blue-600 font-black uppercase text-[9px] py-2 transition-all outline-none"
              >
                <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Opis
              </TabsTrigger>
              <TabsTrigger
                value="rules"
                className="rounded-lg data-[state=active]:bg-blue-600 font-black uppercase text-[9px] py-2 transition-all outline-none"
              >
                <ScrollText className="h-3.5 w-3.5 mr-1.5" /> Zasady
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center justify-between w-full md:w-auto gap-3 px-2">
              {/* BALANS */}
              <div className="flex items-center gap-3 bg-blue-600/10 px-6 py-2 rounded-xl border border-blue-500/20">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Wallet className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-black uppercase text-blue-500/60 leading-none">
                    Twój Balans
                  </span>
                  <span className="text-xs font-black italic text-white leading-tight mt-0.5">
                    {Number(balance || 0).toFixed(2)} <span className="text-blue-500">$</span>
                  </span>
                </div>
              </div>

              {/* GŁOŚNICZEK */}
              <button
                onClick={toggleMute}
                className={`p-2.5 rounded-xl transition-all border border-white/5 ${
                  isMuted
                    ? 'bg-red-500/20 text-red-500'
                    : 'bg-slate-800 text-blue-500 hover:bg-slate-700'
                }`}
                title={isMuted ? 'Wyłącz wyciszenie' : 'Wycisz dźwięki'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>

          <div className="text-[8px] text-slate-700 font-bold uppercase italic opacity-40 text-center mt-2">
            lsCasino © {new Date().getFullYear()} - {title}
          </div>
        </div>
      </Tabs>
    </div>
  )
}
