'use client'

import React, { useState, useEffect } from 'react'
import { Heart, AlertCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { GameCard } from '@/app/(frontend)/(authenticated)/casino/GameCard'

// --- KOMPONENT SKELETONA (Ładne ładowanie) ---
const GameCardSkeleton = () => (
  <div className="relative aspect-[3/4] w-full bg-slate-900/40 rounded-[2rem] border border-slate-800/50 overflow-hidden animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full animate-[shimmer_2s_infinite]" />
    <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
      <div className="h-4 w-2/3 bg-slate-800 rounded-lg" />
      <div className="h-3 w-1/3 bg-slate-800/60 rounded-lg" />
    </div>
  </div>
)

export const GameGrid = ({
  filteredGames,
  favorites,
  toggleFavorite,
  isNewGame,
  isAdmin,
  handleGameSelect,
  isLoading,
}: {
  filteredGames: any[]
  favorites: string[]
  toggleFavorite: (e: React.MouseEvent, gameId: string) => void
  isNewGame: (publishedAt: string) => boolean
  isAdmin: boolean
  handleGameSelect: (game: any) => void
  isLoading: boolean
}) => {
  // --- STAN ŁADOWANIA ---
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 p-6">
        {[...Array(10)].map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <AnimatePresence mode="popLayout">
        {filteredGames.length > 0 ? (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transitionEnd: { overflow: 'visible' }, // NAPRAWA CIENI: Po animacji pozwalamy cieniom wyjść poza kontener
            }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 p-6 overflow-hidden"
          >
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                layout
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                className="relative group z-10 hover:z-20" // Z-index dla najechania
              >
                {/* Badge dla Nowych Gier */}
                {isNewGame(game.publishedAt) && (
                  <div className="absolute top-4 left-4 z-30 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.5)] uppercase tracking-tighter">
                    NOWOŚĆ
                  </div>
                )}

                {/* Serduszko */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(e, game.id)
                  }}
                  className="absolute top-4 right-4 z-30 p-2.5 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90 shadow-2xl"
                >
                  <Heart
                    size={14}
                    className={`${favorites.includes(game.id) ? 'fill-red-500 text-red-500' : 'text-white'}`}
                  />
                </button>

                {/* KARTA GRY (Z Twoimi cieniami) */}
                <div className="relative transition-all duration-300 group-hover:shadow-[0_20px_50px_-10px_rgba(37,99,235,0.3)] rounded-[2rem]">
                  <GameCard game={game} isAdmin={isAdmin} onSelect={() => handleGameSelect(game)} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-32 text-center"
          >
            <div className="inline-flex items-center justify-center p-6 rounded-full bg-slate-900/50 mb-6 border border-slate-800">
              <AlertCircle className="h-12 w-12 text-slate-700" />
            </div>
            <p className="font-black uppercase italic tracking-[0.3em] text-slate-600 text-sm">
              Brak dostępnych gier
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateY(100%);
          }
        }
      `}</style>
    </div>
  )
}
