'use client'
import { motion } from 'motion/react'
import { Lock, PlayCircle, Sparkles } from 'lucide-react'
import { Media } from '@/components/Media'
import { ImagePlaceholder, isValidMedia } from '@/components/ImagePlaceholder'

export function GameCard({ game, isAdmin, onSelect }: any) {
  const isLocked = game.isActive === false && !isAdmin
  const showAdminUnlock = game.isActive === false && isAdmin

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!isLocked ? { y: -8, scale: 1.02 } : {}}
      onClick={() => !isLocked && onSelect()}
      className={`relative group ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 rounded-[2rem] backdrop-blur-sm">
          <Lock className="h-8 w-8 text-white/40 mb-2" />
          <span className="text-[10px] font-black uppercase text-white/40">Zablokowana</span>
        </div>
      )}

      {/* Admin Tag */}
      {showAdminUnlock && (
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-30 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-md shadow-xl border border-blue-400/50">
          ADMIN UNLOCK
        </div>
      )}

      <div
        className={`bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 transition-all duration-300 
        ${!isLocked ? 'group-hover:border-blue-600 group-hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]' : 'opacity-40'}`}
      >
        <div className="aspect-[4/5] relative">
          {isValidMedia(game.gamelogo) ? (
            <Media
              resource={game.gamelogo}
              fill
              className="object-cover transition-all  duration-300 "
              imgClassName="group-hover:scale-105 group-hover:blur-sm transition-all  duration-300 "
            />
          ) : (
            <ImagePlaceholder title={game.title} />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent opacity-60" />

          {!isLocked && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="h-14 w-14 text-white fill-blue-600 shadow-2xl" />
            </div>
          )}
        </div>

        <div className="p-4 text-center">
          <span className="text-[10px] font-black uppercase italic tracking-widest group-hover:text-blue-400 truncate block">
            {game.title}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
