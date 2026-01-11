'use client'

import { useRef, useEffect, useCallback } from 'react'

export const useCasinoSounds = () => {
  const spinAudio = useRef<HTMLAudioElement | null>(null)
  const winAudio = useRef<HTMLAudioElement | null>(null)
  const loseAudio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Inicjalizacja plików (możesz tu podmienić URL na własne)
    spinAudio.current = new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2642/2642-preview.mp3',
    )
    winAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3')
    loseAudio.current = new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2026/2026-preview.mp3',
    )

    // Konfiguracja głośności
    if (spinAudio.current) spinAudio.current.volume = 0.4
    if (winAudio.current) winAudio.current.volume = 0.5
    if (loseAudio.current) loseAudio.current.volume = 0.3

    // Logika zapętlania pierwszej sekundy dla dźwięku losowania
    const handleSpinLoop = () => {
      if (spinAudio.current && spinAudio.current.currentTime >= 7.0) {
        spinAudio.current.currentTime = 0
      }
    }

    spinAudio.current?.addEventListener('timeupdate', handleSpinLoop)

    return () => {
      spinAudio.current?.removeEventListener('timeupdate', handleSpinLoop)
      // Zatrzymaj wszystkie dźwięki przy wychodzeniu z gry
      spinAudio.current?.pause()
      winAudio.current?.pause()
      loseAudio.current?.pause()
    }
  }, [])

  const playSpin = useCallback(() => {
    const isMuted = localStorage.getItem('casino_muted') === 'true'
    if (isMuted || !spinAudio.current) return
    spinAudio.current.currentTime = 0
    spinAudio.current.play().catch(() => {})
  }, [])

  const stopSpin = useCallback(() => {
    if (spinAudio.current) {
      spinAudio.current.pause()
      spinAudio.current.currentTime = 0
    }
  }, [])

  const playWin = useCallback(() => {
    const isMuted = localStorage.getItem('casino_muted') === 'true'
    if (isMuted || !winAudio.current) return
    winAudio.current.currentTime = 0
    winAudio.current.play().catch(() => {})
  }, [])

  const playLose = useCallback(() => {
    const isMuted = localStorage.getItem('casino_muted') === 'true'
    if (isMuted || !loseAudio.current) return
    loseAudio.current.currentTime = 0
    loseAudio.current.play().catch(() => {})
  }, [])

  return { playSpin, stopSpin, playWin, playLose }
}
