'use client'

import React from 'react'
import { motion } from 'motion/react'
import { Hammer, Cog, Bell, ArrowLeft, Construction, Sparkles, ArrowUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MaintenancePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 overflow-hidden font-sans relative">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* ICON ANIMATION */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
              <Construction className="h-16 w-16 text-blue-500" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-2 -right-2 bg-blue-600 p-2 rounded-xl shadow-lg"
              >
                <Cog className="h-5 w-5 text-white" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* TEXT CONTENT */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full mb-4">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
              Przerwa Techniczna
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Ulepszamy <span className="text-blue-600">Wrażenia</span>
          </h1>

          <p className="text-slate-500 font-bold text-sm md:text-base max-w-md mx-auto uppercase tracking-wide leading-relaxed">
            Obecnie wprowadzamy nowe systemy i zabezpieczenia, aby Twoja gra była jeszcze bardziej
            płynna.
          </p>
        </motion.div>

        {/* PROGRESS BAR SIMULATION */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-12 mb-12 h-1 bg-slate-900 rounded-full overflow-hidden max-w-xs mx-auto"
        >
          <motion.div
            animate={{ x: ['-100%', '300%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-blue-600 to-transparent"
          />
        </motion.div>

        {/* ACTIONS */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => router.push('/casino')}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] group"
          >
            <ArrowUp className="h-4 w-4 animate-bounce" />
            Przejdź do Kasyna
          </button>
        </motion.div>

        {/* FOOTER INFO */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic"
        >
          ls<span className="text-blue-600/50">Bet</span>
        </motion.p>
      </div>
    </div>
  )
}
