'use client'

import React, { useEffect, useState } from 'react'
import { Trophy, ListFilter } from 'lucide-react'
import { getUserCasinoWins } from '@/app/actions/getCasinoWins'
import { Button } from '../../ui/button'
import WinsDetailDialog from './WinsDetailDialog'
import { useRouter } from 'next/navigation'

export default function MyCasinoWins({ user }: { user: any }) {
  const router = useRouter()
  const [wins, setWins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadWins() {
      if (!user?.email) {
        setLoading(false)
        return
      }
      try {
        const result = await getUserCasinoWins(user.email)
        if (result.success) {
          setWins(result.docs || [])
          router.refresh()
        } else {
          setError('Nie udało się pobrać danych')
        }
      } catch (err) {
        console.error('Błąd:', err)
        setError('Błąd połączenia')
      } finally {
        setLoading(false)
      }
    }
    loadWins()
  }, [user?.email])

  const totalWon = wins.reduce((acc, curr) => acc + (Number(curr.winAmount) || 0), 0)

  if (loading)
    return (
      <div className="p-4 text-center text-[10px] font-bold text-slate-500 animate-pulse uppercase tracking-widest">
        Synchronizacja...
      </div>
    )

  return (
    <div className="space-y-4">
      {/* SUMA WYGRANYCH */}
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 flex flex-col gap-4 shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Suma Wygranych
            </span>
          </div>
          <span className="text-xl font-black italic text-green-500 tracking-tighter">
            {totalWon.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}{' '}
            <span className="text-[10px] not-italic ml-1 opacity-50">$</span>
          </span>
        </div>

        {/* NOWY PRZYCISK SZCZEGÓŁÓW */}
        {wins.length > 0 && (
          <WinsDetailDialog wins={wins}>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-slate-900/50 border-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all h-8"
            >
              <ListFilter className="h-3 w-3 mr-2" />
              Szczegóły i Historia Wygranych
            </Button>
          </WinsDetailDialog>
        )}
      </div>

      {/* KRÓTKA LISTA GIER (Zostawiamy dla szybkiego podglądu) */}
      <div className="space-y-2">{/* ... (Twoja poprzednia mapa winsByGame tutaj) ... */}</div>
    </div>
  )
}
