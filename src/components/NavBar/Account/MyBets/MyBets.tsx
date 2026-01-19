'use client'

import React, { useState } from 'react'
import { History, Loader2, Trophy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getMyBetsAction } from '@/app/actions/getBets'
import dynamic from 'next/dynamic'
import { Bet, PlacedBet } from '@/payload-types'

const MyBetsPageClient = dynamic(() => import('@/components/NavBar/Account/MyBets/MyBets.client'), {
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
    </div>
  ),
})

const MyBets = () => {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<{
    placedBets: PlacedBet[]
    results: Bet[]
    user: { nickname: string; money: number }
  } | null>(null)
  const [loading, setLoading] = useState(false)

  // Funkcja wywoływana przy próbie zmiany stanu Dialogu
  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen) // Natychmiastowa reakcja UI na kliknięcie

    // Pobieramy dane tylko gdy Dialog się otwiera i nie mamy jeszcze danych (lub chcemy je odświeżyć)
    if (newOpen) {
      setLoading(true)
      try {
        const res = await getMyBetsAction()
        if (res && 'placedBets' in res) {
          setData({
            placedBets: res.placedBets as any,
            results: res.results as any,
            user: res.user as any,
          })
        }
      } catch (error) {
        console.error('Błąd podczas pobierania zakładów:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="group flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black text-white uppercase tracking-wider">Moje Zakłady</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                Sprawdź historię i wyniki
              </p>
            </div>
          </div>
          <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        </div>
      </DialogTrigger>

      <DialogContent className="h-[90dvh] max-w-screen-xl bg-[#020617] border-slate-800 p-0 overflow-hidden flex flex-col shadow-2xl">
        <DialogHeader className="p-8 border-b border-slate-800/50 bg-gradient-to-b from-blue-600/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30">
              <Trophy className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black italic text-white uppercase tracking-tighter">
                Historia <span className="text-blue-500">Gier</span>
              </DialogTitle>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                Przegląd Twojej aktywności
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/20 custom-scrollbar">
          {loading ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Pobieranie danych...
              </p>
            </div>
          ) : data ? (
            <MyBetsPageClient
              nickname={data.user.nickname}
              money={data.user.money}
              initialBets={data.placedBets}
              resultOfEventBeted={data.results}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-slate-500 uppercase font-bold text-xs">
                Brak danych do wyświetlenia
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MyBets
