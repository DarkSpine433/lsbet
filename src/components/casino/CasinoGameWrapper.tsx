'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlayCircle, BookOpen, ScrollText } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react' // Poprawny import dla Twojej biblioteki

export const CasinoGameWrapper = ({ children, gameData, title }: any) => {
  return (
    <div className="w-full bg-[#020617] text-white">
      <Tabs defaultValue="play" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 p-1 rounded-2xl mb-6 border border-slate-800">
          <TabsTrigger
            value="play"
            className="rounded-xl data-[state=active]:bg-blue-600 font-bold uppercase text-[10px] py-3 transition-all"
          >
            <PlayCircle className="h-3.5 w-3.5 mr-2" /> Gra
          </TabsTrigger>
          <TabsTrigger
            value="description"
            className="rounded-xl data-[state=active]:bg-blue-600 font-bold uppercase text-[10px] py-3 transition-all"
          >
            <BookOpen className="h-3.5 w-3.5 mr-2" /> Opis
          </TabsTrigger>
          <TabsTrigger
            value="rules"
            className="rounded-xl data-[state=active]:bg-blue-600 font-bold uppercase text-[10px] py-3 transition-all"
          >
            <ScrollText className="h-3.5 w-3.5 mr-2" /> Zasady
          </TabsTrigger>
        </TabsList>

        {/* Dynamiczna wysokość z motion/react */}
        <motion.div
          layout
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <TabsContent value="play" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </TabsContent>

            <TabsContent value="description" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#0a0f1e] border border-slate-800/60 rounded-[2.5rem] p-8"
              >
                <h3 className="text-xl font-black italic uppercase text-blue-500 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> O grze {title}
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm font-medium whitespace-pre-wrap">
                  {/* Wyciąganie danych bezpośrednio z pól textarea zdefiniowanych w index.ts */}
                  {gameData?.description || 'Opis nie został jeszcze dodany w panelu admina.'}
                </p>
              </motion.div>
            </TabsContent>

            <TabsContent value="rules" className="mt-0 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#0a0f1e] border border-slate-800/60 rounded-[2.5rem] p-8"
              >
                <h3 className="text-xl font-black italic uppercase text-yellow-500 mb-4 flex items-center gap-2">
                  <ScrollText className="h-5 w-5" /> Zasady {title}
                </h3>
                <div className="text-slate-300 text-sm font-medium whitespace-pre-line leading-loose">
                  {/* Wyciąganie danych bezpośrednio z pól textarea zdefiniowanych w index.ts */}
                  {gameData?.rules || 'Zasady gry nie są obecnie dostępne.'}
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </motion.div>
      </Tabs>
    </div>
  )
}
