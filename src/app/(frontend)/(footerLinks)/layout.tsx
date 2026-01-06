import React from 'react'
import Link from 'next/link'
import { ChevronLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[80dvh] bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/home">
              <Button
                variant="ghost"
                className="group flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all rounded-xl px-4"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 text-blue-500" />
                <span className="text-xs font-black uppercase tracking-widest italic">
                  Wróć do Panelu
                </span>
              </Button>
            </Link>
          </div>

          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Strona Informacyjna <span className="text-blue-600">LS</span>Bet
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10">{children}</main>

      {/* Dekoracyjne światło w tle */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-64 bg-blue-600/5 blur-[120px] pointer-events-none" />
    </div>
  )
}
