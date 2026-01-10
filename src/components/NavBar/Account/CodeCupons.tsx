'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Ticket, Loader2, Sparkles, Zap } from 'lucide-react'
import { activateCoupon } from '@/app/actions/activateCoupon'

export default function CouponSection({
  onBalanceUpdate,
}: {
  onBalanceUpdate: (val: number) => void
}) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleActivate = async () => {
    if (!code) return toast.error('Wpisz kod!')

    setLoading(true)
    try {
      const res = await activateCoupon(code)

      if (res.error) {
        toast.error(res.error, {
          style: { background: '#7f1d1d', color: '#fff', border: '1px solid #ef4444' },
        })
      } else {
        toast.success(`Aktywowano! +${res.amount}$`, {
          icon: <Zap className="h-4 w-4 text-yellow-400" />,
          style: { background: '#064e3b', color: '#fff', border: '1px solid #10b981' },
        })
        if (res.newBalance !== undefined) onBalanceUpdate(res.newBalance)
        setCode('')
      }
    } catch (err) {
      toast.error('Błąd połączenia z serwerem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative group overflow-hidden bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] backdrop-blur-md">
      {/* Dekoracyjny blask w tle */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all duration-500" />

      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 rounded-xl border border-blue-500/20">
              <Ticket className="text-blue-500 h-4 w-4" />
            </div>
            <h3 className="text-[11px] font-black uppercase italic tracking-[0.2em] text-slate-300">
              Kupon <span className="text-blue-500">Bonusowy</span>
            </h3>
          </div>
          <Sparkles className="h-3 w-3 text-slate-600 animate-pulse" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
              placeholder="WPISZ KOD..."
              disabled={loading}
              className="w-full bg-black/40 border border-slate-800 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 transition-all font-black italic uppercase tracking-widest text-xs text-white placeholder:text-slate-700 disabled:opacity-50"
            />
          </div>

          <button
            onClick={handleActivate}
            disabled={loading || !code}
            className={`relative flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black uppercase italic text-[11px] tracking-widest transition-all shadow-lg overflow-hidden ${
              loading || !code
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 active:scale-95'
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 fill-current" />
                Aktywuj
              </>
            )}

            {/* Efekt połysku na przycisku */}
            {!loading && code && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            )}
          </button>
        </div>

        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest pl-2">
          Kody są jednorazowe i dodają środki bezpośrednio do Twojego{' '}
          <span className="text-blue-500/50 italic">Salda</span>
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
