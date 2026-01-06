'use client'

import React from 'react'
import { MessageSquare, HelpCircle, Mail, Zap } from 'lucide-react'

export default function Support() {
  return (
    <div className=" bg-[#020617] text-slate-100 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black italic uppercase tracking-tighter">
            Centrum{' '}
            <span className="text-blue-500 underline decoration-blue-500/20 underline-offset-8">
              Pomocy
            </span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
            Masz pytania? Jesteśmy tutaj, aby pomóc.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: MessageSquare,
              title: 'Live Chat',
              desc: 'Dostępny w godzinach szczytu serwera devGaming.',
            },
            {
              icon: Mail,
              title: 'Tickety',
              desc: 'Wyślij zgłoszenie przez oficjalny panel frakcyjny lub forum.',
            },
            {
              icon: Zap,
              title: 'Szybki Start',
              desc: 'Poradnik jak zacząć obstawiać pierwsze mecze.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl text-center space-y-4 hover:translate-y-[-4px] transition-all"
            >
              <div className="mx-auto w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20 text-blue-500">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-black uppercase italic tracking-widest">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-600 rounded-[3rem] p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <HelpCircle size={200} />
          </div>
          <div className="relative z-10 space-y-6 max-w-xl">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              Nie znalazłeś odpowiedzi na swoje pytanie?
            </h2>
            <p className="font-bold text-blue-100">
              Skontaktuj się bezpośrednio z supportem LSBet poprzez system /raport na serwerze.
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest text-sm hover:shadow-xl transition-all active:scale-95">
              Otwórz Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
