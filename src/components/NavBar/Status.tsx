'use client'
import React, { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react' // Opcjonalnie do ikony braku sieci

type Props = {
  className?: string
}

const Status = ({ className }: Props) => {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  const showStatus = true

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setWasOffline(true)
      // Ukryj pasek całkowicie po 3 sekundach od odzyskania neta
      setTimeout(() => {
        setWasOffline(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Inicjalizacja stanu
    const online = navigator.onLine
    setIsOnline(online)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Jeśli jest online i nie był wcześniej offline, nie renderuj nic (początkowy stan)
  if (isOnline && !wasOffline && !showStatus) return null

  if (!isOnline && showStatus) {
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
