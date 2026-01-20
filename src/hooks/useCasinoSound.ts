'use client'

import { useRef, useEffect, useCallback } from 'react'

export const useCasinoSounds = () => {
  const spinAudio = useRef<HTMLAudioElement | null>(null)
  const winAudio = useRef<HTMLAudioElement | null>(null)
  const loseAudio = useRef<HTMLAudioElement | null>(null)
  const cardMoveAudio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    spinAudio.current = new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2642/2642-preview.mp3',
    )
    winAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3')
    loseAudio.current = new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2026/2026-preview.mp3',
    )
    // Dźwięk przesuwania/rozdawania karty
    cardMoveAudio.current = new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3',
    )

    if (spinAudio.current) spinAudio.current.volume = 0.4
    if (winAudio.current) winAudio.current.volume = 0.5
    if (loseAudio.current) loseAudio.current.volume = 0.3
    if (cardMoveAudio.current) cardMoveAudio.current.volume = 0.6

    const handleSpinLoop = () => {
      if (spinAudio.current && spinAudio.current.currentTime >= 7.0) {
        spinAudio.current.currentTime = 0
      }
    }

    spinAudio.current?.addEventListener('timeupdate', handleSpinLoop)

    return () => {
      spinAudio.current?.removeEventListener('timeupdate', handleSpinLoop)
      spinAudio.current?.pause()
      winAudio.current?.pause()
      loseAudio.current?.pause()
      cardMoveAudio.current?.pause()
    }
  }, [])

  const checkMute = () => localStorage.getItem('casino_muted') === 'true'

  const playSpin = useCallback(() => {
    if (checkMute() || !spinAudio.current) return
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
    if (checkMute() || !winAudio.current) return
    winAudio.current.currentTime = 0
    winAudio.current.play().catch(() => {})
  }, [])

  const playLose = useCallback(() => {
    if (checkMute() || !loseAudio.current) return
    loseAudio.current.currentTime = 0
    loseAudio.current.play().catch(() => {})
  }, [])

  const playCardMove = useCallback(() => {
    if (checkMute() || !cardMoveAudio.current) return
    cardMoveAudio.current.currentTime = 0
    cardMoveAudio.current.play().catch(() => {})
  }, [])

  return { playSpin, stopSpin, playWin, playLose, playCardMove }
}
