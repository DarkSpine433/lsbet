'use client'

import React, { version } from 'react'
import { Wallet, Ticket, History, Gift, Calendar, Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import lsBetVersion from '@/components/LsBetVersion'
import LsBetVersion from '@/components/LsBetVersion'
import { User } from '@/payload-types'

export function WalletStatus({ user, moneySign }: { user: User; moneySign: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end sm:justify-start min-w-0">
      <Popover>
        {/* TRIGGER: Cała sekcja portfela jako jeden wyzwalacz */}
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer outline-none group">
            {/* SALDO GŁÓWNE */}
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-slate-900/50 px-2 sm:px-4 py-1.5 sm:py-2 border border-slate-800 group-hover:border-blue-500/30 transition-all text-left shrink-0">
              <div className="p-1 sm:p-1.5 rounded-lg bg-blue-600/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Wallet className="h-3.5 w-3.5 sm:h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase leading-none mb-0.5 sm:mb-1">
                  Saldo
                </span>
                <span className="font-black text-xs sm:text-sm text-white leading-none flex items-center">
                  <span className="truncate">
                    {((user.money || 0) + (user.cuponsMoney || 0)).toFixed(2)}
                  </span>
                  <span className="text-blue-500 text-[10px] ml-0.5 shrink-0">{moneySign}</span>
                </span>
              </div>
            </div>

            {/* SALDO KUPONÓW */}
            <div className="hidden xs:flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-slate-900/50 px-2 sm:px-4 py-1.5 sm:py-2 border border-slate-800 group-hover:border-amber-500/30 transition-all text-left shrink-0">
              <div className="p-1 sm:p-1.5 rounded-lg bg-amber-600/10 text-amber-500 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Ticket className="h-3.5 w-3.5 sm:h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase leading-none mb-0.5 sm:mb-1">
                  Kupony
                </span>
                <span className="font-black text-xs sm:text-sm text-white leading-none flex items-center">
                  <span className="truncate">{user.cuponsMoney?.toFixed(2) || '0.00'}</span>
                  <span className="text-amber-500 text-[10px] ml-0.5 shrink-0">{moneySign}</span>
                </span>
              </div>
            </div>
          </div>
        </PopoverTrigger>

        {/* ZAWARTOŚĆ POPOVERA */}
        <PopoverContent
          align="end"
          sideOffset={12}
          className="w-80 sm:w-96 p-0 bg-[#0f172a] border-slate-800 rounded-[2rem] shadow-2xl z-[100] backdrop-blur-xl overflow-hidden"
        >
          {/* Nagłówek Sekcji */}
          <div className="p-5 border-b border-white/5 bg-gradient-to-b from-slate-800/50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <History className="h-4 w-4 text-blue-400" />
              </div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                Szczegóły Portfela
              </h2>
            </div>
          </div>

          {/* Szybki podgląd sald wewnątrz Popovera */}
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex flex-col">
              <span className="text-[8px] font-bold text-blue-400 uppercase mb-1">Dostępne</span>
              <span className="text-sm font-black text-white">
                {user.money?.toFixed(2)}
                {moneySign}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex flex-col">
              <span className="text-[8px] font-bold text-amber-400 uppercase mb-1">Bonusy</span>
              <span className="text-sm font-black text-white">
                {user.cuponsMoney?.toFixed(2) || '0.00'}
                {moneySign}
              </span>
            </div>
          </div>

          {/* Lista Historii */}
          <div className="px-5 pb-6">
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar"></div>
          </div>

          {/* Footer Informacyjny */}
          <div className="p-3 bg-slate-950/50 border-t border-white/5 flex items-center justify-center gap-2">
            <span className="text-[8px] text-slate-600 font-bold uppercase italic">
              LSBet <LsBetVersion />
            </span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
