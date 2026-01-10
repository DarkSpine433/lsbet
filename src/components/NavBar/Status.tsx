'use client'
import React, { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react' // Opcjonalnie do ikony braku sieci

type Props = {
  lastActive?: string | Date | null
  className?: string
}

const Status = ({ lastActive, className }: Props) => {
  const [isOnline, setIsOnline] = useState(false)
  const [isBrowserOnline, setIsBrowserOnline] = useState(true)

  useEffect(() => {
    // 1. Sprawdzanie tętna (Heartbeat/Activity)
    const checkActivityStatus = () => {
      if (!lastActive) {
        setIsOnline(false)
        return
      }
      const lastActiveDate = new Date(lastActive).getTime()
      const now = new Date().getTime()
      // Online jeśli aktywność była w ciągu ostatnich 2 minut
      setIsOnline(now - lastActiveDate < 120000)
    }

    // 2. Sprawdzanie połączenia internetowego (Browser Connection)
    const handleOnline = () => setIsBrowserOnline(true)
    const handleOffline = () => setIsBrowserOnline(false)

    // Ustawienie początkowego stanu internetu
    setIsBrowserOnline(navigator.onLine)

    // Event listenery dla internetu
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Interwał dla tętna
    checkActivityStatus()
    const interval = setInterval(checkActivityStatus, 10000)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [lastActive])

  // Logika kolorów:
  // - Czerwony (lub ikona): Brak internetu u użytkownika
  // - Zielony: Internet jest OK + tętno świeże (Użytkownik aktywny)
  // - Szary: Internet jest OK + tętno stare (Użytkownik nieaktywny)

  if (!isBrowserOnline) {
    return (
      <div className={` flex items-center justify-center ${className}`}>
        <span className="h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-transparent animate-pulse">
          <WifiOff className="absolute -top-4 left-1/2 -translate-x-1/2 h-3 w-3 text-red-500" />
        </span>
      </div>
    )
  }

  return (
    <div className={` flex items-center justify-center ${className}`}>
      <span
        className={`h-2.5 w-2.5 rounded-full border-2 border-transparent transition-colors duration-500 ${
          isOnline ? 'bg-green-500' : 'bg-slate-600'
        }`}
      >
        {isOnline && (
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25"></span>
        )}
      </span>
    </div>
  )
}

export default Status
