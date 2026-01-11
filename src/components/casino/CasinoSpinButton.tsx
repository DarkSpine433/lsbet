'use client'

import React, { useRef } from 'react'
import { motion } from 'motion/react'

interface CasinoSpinButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  label: string
  className?: string
}

export const CasinoSpinButton = ({
  onClick,
  disabled,
  loading,
  label,
  className = '',
}: CasinoSpinButtonProps) => {
  // Referencja do pliku dźwiękowego
  const clickSound = useRef<HTMLAudioElement | null>(null)

  const handlePress = () => {
    if (disabled || loading) return

    // Sprawdzamy czy dźwięk jest wyciszony w localStorage
    const isMuted = localStorage.getItem('casino_muted') === 'true'

    if (!isMuted) {
      // Jeśli audio nie istnieje, stwórz je (używamy otwartego zasobu biblioteki Mixkit)
      if (!clickSound.current) {
        clickSound.current = new Audio(
          'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
        )
        clickSound.current.volume = 0.5
      }
      clickSound.current.currentTime = 0
      clickSound.current.play().catch((err) => console.log('Audio play blocked:', err))
    }

    onClick()
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      onClick={handlePress}
      disabled={disabled || loading}
      className={`relative overflow-hidden font-black uppercase italic transition-all ${className} ${
        disabled || loading
          ? 'bg-slate-800 cursor-not-allowed opacity-50 text-slate-500'
          : 'bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white shadow-xl hover:shadow-blue-500/20'
      }`}
    >
      {/* Efekt fali/światła podczas ładowania */}
      {loading && (
        <motion.div
          className="absolute inset-0 bg-white/20"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
      )}

      <span className="relative z-10">{loading ? 'LOSOWANIE...' : label}</span>
    </motion.button>
  )
}
