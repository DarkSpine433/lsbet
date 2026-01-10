'use client'
import { useState, useEffect } from 'react'

type Props = {}

const OfflineBarStatus = (props: Props) => {
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

  return (
    <div
      className={`
        fixed bottom-0 left-0 w-full z-[100] text-center text-white text-xs font-black uppercase tracking-widest px-2 py-1.5
        transition-all duration-500 ease-in-out transform
        ${isOnline && wasOffline ? 'bg-emerald-500 translate-y-0 opacity-100' : ''}
        ${!isOnline ? 'bg-red-600 translate-y-0 opacity-100 animate-pulse' : ''}
        ${isOnline && !wasOffline ? 'translate-y-full opacity-0' : ''}
      `}
    >
      <div className="flex items-center justify-center gap-2">
        <span className={`w-2 h-2 rounded-full bg-white ${!isOnline ? 'animate-ping' : ''}`} />
        {isOnline ? 'Połączenie przywrócone - ONLINE' : 'Brak połączenia - OFFLINE'}
      </div>
    </div>
  )
}

export default OfflineBarStatus
