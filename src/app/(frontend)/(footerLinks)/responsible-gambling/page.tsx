'use client'

import React from 'react'
import { ShieldCheck, Heart, AlertTriangle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const GlassCard = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-md rounded-3xl p-8 transition-all hover:border-blue-500/30">
    {children}
  </div>
)

export default function ResponsibleGambling() {
  return (
    <div className=" bg-[#020617] text-slate-100 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <Badge className="bg-blue-600 text-white uppercase tracking-widest font-black italic px-4 py-1">
            Fair Play
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white">
            Odpowiedzialna <span className="text-blue-500">Gra</span>
          </h1>
          <p className="text-slate-400 font-medium">
            Bezpieczeństwo naszych graczy jest dla nas priorytetem.
          </p>
        </div>

        <div className="grid gap-6">
          <GlassCard>
            <div className="flex gap-6">
              <div className="p-4 bg-blue-600/20 rounded-2xl h-fit border border-blue-500/30">
                <Heart className="text-blue-500 h-8 w-8" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase italic tracking-tight">
                  Graj z głową
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Pamiętaj, że zakłady na naszej platformie są formą zabawy w ramach gry RolePlay
                  (devGaming). Używana waluta jest wirtualna, jednak mechanizmy gry odzwierciedlają
                  prawdziwe zakłady. Nigdy nie przedkładaj gry nad swoje codzienne obowiązki.
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl space-y-3">
              <Clock className="text-blue-500 h-6 w-6" />
              <h4 className="font-bold uppercase tracking-widest text-xs">Limit Czasu</h4>
              <p className="text-xs text-slate-500">
                Monitoruj ile czasu spędzasz na analizowaniu kursów i stawianiu zakładów.
              </p>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl space-y-3">
              <AlertTriangle className="text-yellow-500 h-6 w-6" />
              <h4 className="font-bold uppercase tracking-widest text-xs">Samokontrola</h4>
              <p className="text-xs text-slate-500">
                Jeśli czujesz, że gra przestaje być zabawą, zrób przerwę lub skontaktuj się z
                administracją.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
