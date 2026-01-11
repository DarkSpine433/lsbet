'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Heartbeat() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setWasOffline(true)
      // Ukryj pasek całkowicie po 3 sekundach od odzyskania neta
      setTimeout(() => {
        setWasOffline(false)
        setShowStatus(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Inicjalizacja stanu
    const online = navigator.onLine
    setIsOnline(online)
    if (!online) setShowStatus(true)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Jeśli jest online i nie był wcześniej offline, nie renderuj nic (początkowy stan)
  if (isOnline && !wasOffline && !showStatus) return null

  return null // Komponent jest niewidoczny
}
