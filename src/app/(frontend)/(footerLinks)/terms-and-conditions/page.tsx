'use client'

import React from 'react'
import { FileText, Scale, CheckCircle2 } from 'lucide-react'

export default function TermsAndConditions() {
  const sections = [
    {
      title: 'Postanowienia Ogólne',
      content:
        'Serwis LSBet działa wyłącznie w ramach uniwersum RolePlay. Wszystkie transakcje są realizowane w wirtualnej walucie serwera.',
    },
    {
      title: 'Zasady Rozliczania',
      content:
        'Zakłady rozliczane są na podstawie oficjalnych wyników sportowych dostarczanych przez zewnętrznych dostawców danych.',
    },
    {
      title: 'Nadużycia',
      content:
        'Wszelkie próby wykorzystywania błędów skryptu będą skutkować blokadą konta i konfiskatą wirtualnych środków.',
    },
  ]

  return (
    <div className="bg-[#020617] text-slate-100 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-12 w-1 w-blue-600 bg-blue-600 rounded-full" />
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Regulamin <span className="opacity-50 font-light">Serwisu</span>
          </h1>
        </div>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <div
              key={i}
              className="group p-8 bg-slate-900/30 border border-slate-800 rounded-3xl hover:bg-slate-900/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-blue-500 font-black italic text-lg opacity-30">0{i + 1}</span>
                <h2 className="text-xl font-black uppercase italic tracking-widest text-blue-500">
                  {section.title}
                </h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed border-l border-slate-800 pl-6 ml-4">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl border border-dashed border-slate-800 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
            Ostatnia aktualizacja: 06.01.2026
          </p>
        </div>
      </div>
    </div>
  )
}
