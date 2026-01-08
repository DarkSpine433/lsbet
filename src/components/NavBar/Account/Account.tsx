'use client'

import React from 'react'
import { Button } from '../../ui/button'
import {
  UserIcon,
  History,
  Gift,
  KeyRound,
  ShieldCheck,
  CircleUser,
  Activity,
  CalendarDays,
  Trophy, // Dodano ikonę
} from 'lucide-react'
import LogoutButton from '../../ui/logout-button'
import type { User } from '@/payload-types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '../../ui/separator'
import { Badge } from '@/components/ui/badge'
import ChangePwd from './ChangePwd'
import CodeCupons from './CodeCupons'
import MyBets from './MyBets/MyBets'
import { formatDateTime } from '@/utilities/formatDateTime'
import MyCasinoWins from './MyCasinoWins'

type Props = {
  user: User
}

const Account = ({ user }: Props) => {
  const userNick = user.email.split('@')[0]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-blue-600 hover:text-white text-slate-400 transition-all duration-300 shadow-lg"
        >
          <UserIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md w-full max-h-[90dvh] flex flex-col p-0 bg-[#020617] border-slate-800 text-slate-100 overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 pb-6 border-b border-slate-800/50 bg-gradient-to-b from-blue-600/10 to-transparent relative">
          <div className="absolute top-6 right-6">
            <Badge className="bg-blue-600 text-white border-none font-black text-[10px] tracking-widest uppercase px-3 py-1">
              PRO MEMBER
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
              <CircleUser className="h-10 w-10 text-blue-500" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black italic tracking-tight text-white uppercase">
                {userNick}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-bold flex items-center gap-2 uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3 text-green-500" />
                Konto Zweryfikowane
              </DialogDescription>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">
                Dołączył
              </p>
              <div className="flex items-center gap-2 text-slate-200">
                <CalendarDays className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-bold">{formatDateTime(user.createdAt)}</span>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">
                Status
              </p>
              <div className="flex items-center gap-2 text-slate-200">
                <Activity className="h-3 w-3 text-green-500" />
                <span className="text-xs font-bold">Aktywny</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950/20">
          {/* NOWA SEKCJA: WYGRANE W KASYNIE */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/20">
                <Trophy className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">
                Wygrane w Kasynie
              </h3>
            </div>
            <MyCasinoWins user={user} />
          </section>

          <Separator className="bg-slate-800/50" />

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/20">
                <History className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">
                Historia Gier
              </h3>
            </div>
            <div className="bg-slate-900/30 rounded-2xl border border-slate-800 overflow-hidden">
              <MyBets />
            </div>
          </section>

          {/* ... reszta komponentu pozostaje bez zmian ... */}
          <Separator className="bg-slate-800/50" />

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/20">
                <Gift className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">
                Bonusy i Kody
              </h3>
            </div>
            <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-4">
              <CodeCupons />
            </div>
          </section>

          <Separator className="bg-slate-800/50" />

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/20">
                <KeyRound className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">
                Bezpieczeństwo
              </h3>
            </div>
            <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-4">
              <ChangePwd />
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-800 bg-[#020617] mt-auto">
          <div className="flex flex-col gap-3">
            <p className="text-[10px] text-center text-slate-500 font-medium px-4">
              Zalogowano jako {user.email}
            </p>
            <LogoutButton />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Account
