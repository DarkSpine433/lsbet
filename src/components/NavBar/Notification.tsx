'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Bell, BellRing, Trophy, Info, AlertTriangle, Gift, Check } from 'lucide-react'

const Notification = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [hasUnread, setHasUnread] = useState(false)

  const fetchAllNotifications = useCallback(async () => {
    try {
      // Pobieramy MAX 9 powiadomień
      const res = await fetch('/api/notifications?sort=-createdAt&limit=9')
      const data = await res.json()

      if (data.docs) {
        setNotifications(data.docs)
        // Sprawdzamy czy CO NAJMNIEJ JEDNO powiadomienie jest nieprzeczytane
        const unreadExists = data.docs.some((n: any) => n.isRead === false)
        setHasUnread(unreadExists)
      }
    } catch (err) {
      console.error('Błąd fetch:', err)
    }
  }, [])

  // Funkcja oznaczająca pojedyncze powiadomienie jako przeczytane w bazie
  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      // Odświeżamy listę lokalnie
      fetchAllNotifications()
    } catch (err) {
      console.error('Błąd oznaczania jako przeczytane:', err)
    }
  }

  // Funkcja oznaczająca WSZYSTKIE widoczne powiadomienia jako przeczytane
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead)

      // Wykonujemy zapytania równolegle dla wszystkich nieprzeczytanych
      await Promise.all(
        unreadNotifications.map((n) =>
          fetch(`/api/notifications/${n.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isRead: true }),
          }),
        ),
      )
      fetchAllNotifications()
    } catch (err) {
      console.error('Błąd oznaczania wszystkich:', err)
    }
  }

  useEffect(() => {
    fetchAllNotifications()
    // Sprawdzanie co 5 minut
    const interval = setInterval(fetchAllNotifications, 300000)
    return () => clearInterval(interval)
  }, [fetchAllNotifications])

  const getIcon = (type: string) => {
    switch (type) {
      case 'win':
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'bonus':
        return <Gift className="h-4 w-4 text-purple-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative bg-slate-900 border-slate-800 hover:bg-slate-800 rounded-xl active:scale-95 transition-all"
        >
          <Bell className={`h-5 w-5 ${hasUnread ? 'text-blue-500' : 'text-slate-400'}`} />
          {hasUnread && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-[#0f172a] border-slate-800 shadow-2xl rounded-2xl overflow-hidden"
        align="end"
      >
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <h4 className="font-black text-[10px] uppercase tracking-widest text-blue-500">
            Powiadomienia (Max 9)
          </h4>
          {hasUnread && (
            <button
              onClick={markAllAsRead}
              className="text-[9px] text-blue-400 hover:text-white uppercase font-bold flex items-center gap-1 transition-colors"
            >
              <Check className="h-3 w-3" /> Oznacz wszystkie
            </button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markAsRead(n.id)}
                className={`p-4 border-b border-slate-800/50 transition-all cursor-pointer flex gap-3 ${
                  n.isRead
                    ? 'opacity-50 hover:bg-slate-800/10'
                    : 'bg-blue-500/5 hover:bg-blue-500/10'
                }`}
              >
                <div className="mt-1 relative">
                  {getIcon(n.type)}
                  {!n.isRead && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-[#0f172a]" />
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-[11px] font-black uppercase ${n.isRead ? 'text-slate-400' : 'text-slate-200'}`}
                    >
                      {n.title}
                    </span>
                  </div>
                  <p
                    className={`text-[10px] font-medium leading-relaxed mt-1 ${n.isRead ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    {n.message}
                  </p>
                  <span className="text-[8px] text-slate-600 uppercase mt-2 font-bold">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center flex flex-col items-center">
              <BellRing className="h-8 w-8 text-slate-700 mb-3" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Brak powiadomień
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default Notification
