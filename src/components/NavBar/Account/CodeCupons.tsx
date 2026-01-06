'use client'

import { activateCouponAction } from '@/app/actions/activateCoupon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Gift, Loader2, Sparkles } from 'lucide-react'
import React, { FormEvent, useState, useTransition } from 'react'
import { toast } from 'sonner'

type Props = {}

const CodeCupons = (props: Props) => {
  const [isPending, startTransition] = useTransition()
  const [couponCode, setCouponCode] = useState('')

  const handleCouponCodeActivation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await activateCouponAction(formData)
      if (result.success) {
        toast.success(result.message)
        setCouponCode('')
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="w-full">
      <form onSubmit={handleCouponCodeActivation} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
            Kod Promocyjny
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Gift
                className={`h-4 w-4 transition-colors ${couponCode ? 'text-blue-500' : 'text-slate-600'}`}
              />
            </div>
            <Input
              name="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 h-12 pl-11 rounded-xl focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all shadow-inner font-mono tracking-widest"
              type="text"
              placeholder="NP. PROMO2024"
              disabled={isPending}
            />
            {couponCode && !isPending && (
              <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 text-blue-500/50 animate-pulse" />
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending || !couponCode}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase italic tracking-widest rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:bg-slate-800 disabled:shadow-none"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">Aktywuj Bonus</span>
          )}
        </Button>

        <p className="text-[9px] text-center text-slate-600 font-bold uppercase tracking-tighter">
          Kody są jednorazowe i przypisane do konta
        </p>
      </form>
    </div>
  )
}

export default CodeCupons
