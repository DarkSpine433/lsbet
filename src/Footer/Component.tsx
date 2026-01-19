import React from 'react'
import type { Footer as FooterType } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import LsBetVersion from '@/components/LsBetVersion'

export async function Footer() {
  return (
    <footer className="relative bg-[#020617] border-t border-slate-900 pt-12 pb-32 xl:pb-12 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Logo i Nazwa */}
          <div className="flex items-center justify-center mb-6 transition-transform hover:scale-105">
            <Logo />
          </div>

          {/* Glówny Copyright */}
          <p className="text-sm font-bold text-slate-400 tracking-wide uppercase">
            © {new Date().getFullYear()} <span className="text-blue-500">LS</span>Bet. Wszelkie
            prawa zastrzeżone.
          </p>

          {/* Nota RP / Disclaimer */}
          <div className="mt-6 max-w-2xl py-4 px-6 rounded-2xl bg-slate-950 border border-slate-900 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-blue-500/50">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nota Prawna</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
              Strona została stworzona wyłącznie na potrzeby gry RolePlay (devGaming). Wszystkie
              zakłady oraz waluta używana w serwisie są wirtualne i nie mają przełożenia na
              rzeczywiste środki finansowe.
            </p>
          </div>

          {/* Sub-footer Links (Opcjonalne, dla estetyki PRO) */}
          <div className="mt-8 flex gap-6 text-[10px] font-bold text-slate-700 uppercase tracking-widest">
            <Link
              href="/responsible-gambling"
              className="hover:text-blue-500 cursor-pointer transition-colors"
            >
              Odpowiedzialna Gra
            </Link>
            <Link
              href="/terms-and-conditions"
              className="hover:text-blue-500 cursor-pointer transition-colors"
            >
              Regulamin
            </Link>
            <Link href="/support" className="hover:text-blue-500 cursor-pointer transition-colors">
              Pomoc
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-12 text-[10px] text-slate-800 text-center border-b border-slate-900 relative">
        <LsBetVersion />
      </div>
      {/* Dekoracyjny Gradient na spodzie */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
    </footer>
  )
}
