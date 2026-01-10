'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlayCircle, BookOpen, ScrollText, Wallet } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export const CasinoGameWrapper = ({
  children,
  gameData,
  title,
  balance,
}: {
  children: React.ReactNode
  gameData: any
  title: string
  balance: number
}) => {
  return (
    <div className="w-full bg-[#020617] text-white">
      <Tabs defaultValue="play" className="w-full">
        {/* --- HEADER SEKRETY: TABS + BALANCE --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 bg-slate-900/40 p-4 rounded-[2rem] border border-slate-800/50 backdrop-blur-sm">
          {/* PRZYCISKI ZAKŁADEK */}
          <TabsList className="grid grid-cols-3 bg-black/40 rounded-xl border border-slate-800 w-full md:w-auto min-w-[300px] justify-center items-center">
            <TabsTrigger
              value="play"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[9px] py-2 transition-all outline-none"
            >
              <PlayCircle className="h-3.5 w-3.5 mr-1.5" /> Gra
            </TabsTrigger>
            <TabsTrigger
              value="description"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[9px] py-2 transition-all outline-none"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Opis
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[9px] py-2 transition-all outline-none"
            >
              <ScrollText className="h-3.5 w-3.5 mr-1.5" /> Zasady
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {/* GRA */}
            <TabsContent value="play" className="mt-0 outline-none border-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 5 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div className="flex flex-col items-center bg-[#020617] p-4 md:p-10 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden gap-4">
                  {children}
                </div>
                {/* BALANCE DISPLAY */}
                <div className="flex mt-4 items-center gap-3 bg-blue-600/10 px-6 py-2.5 rounded-xl border border-blue-500/20 w-full md:w-auto justify-center md:justify-start min-w-[160px]">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-blue-500/60 leading-none mb-1">
                      Twój Balans
                    </span>
                    <span className="text-sm font-black italic text-white tracking-tighter">
                      {typeof balance === 'number' ? balance.toFixed(2) : '0.00'}{' '}
                      <span className="text-blue-500">$</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* OPIS */}
            <TabsContent value="description" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900/50 border border-slate-800/60 rounded-[2.5rem] p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">
                    O grze <span className="text-blue-500">{title}</span>
                  </h3>
                </div>
                <p className="text-slate-300 leading-relaxed text-sm font-medium whitespace-pre-wrap">
                  {gameData?.description || 'Opis nie został jeszcze dodany w panelu admina.'}
                </p>
              </motion.div>
            </TabsContent>

            {/* ZASADY */}
            <TabsContent value="rules" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900/50 border border-slate-800/60 rounded-[2.5rem] p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <ScrollText className="h-5 w-5 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">
                    Zasady <span className="text-yellow-500">{title}</span>
                  </h3>
                </div>
                <div className="text-slate-300 text-sm font-medium whitespace-pre-line leading-loose bg-black/20 p-6 rounded-2xl border border-white/5">
                  {gameData?.rules || 'Zasady gry nie są obecnie dostępne.'}
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
          <div className="text-[9px] text-slate-700 font-bold uppercase italic opacity-40 text-center mt-6">
            lsCasino © {new Date().getFullYear()} - {gameData?.title || 'System'}
          </div>
        </div>
      </Tabs>
    </div>
  )
}
