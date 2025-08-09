'use client'
import { activateCouponAction } from '@/app/actions/activateCoupon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CircularProgress from '@mui/material/CircularProgress'
import { Gift } from 'lucide-react'
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
        if (result.newBalance !== undefined) {
        }
        setCouponCode('')
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div>
      <h2 className="font-semibold text-slate-900 mb-2">Kod Promocyjny</h2>
      <form onSubmit={handleCouponCodeActivation} className="space-y-2">
        <div className="relative">
          <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            name="couponCode"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="bg-slate-100 border-slate-200 shadow-inner pl-9 focus-visible:ring-1 focus-visible:ring-blue-400 text-slate-800 caret-slate-900"
            type="text"
            placeholder="Wpisz kod..."
            disabled={isPending}
          />
        </div>
        <Button variant="secondary" type="submit" className="w-full" disabled={isPending}>
          {isPending ? <CircularProgress size={20} color="inherit" /> : 'Aktywuj'}
        </Button>
      </form>
    </div>
  )
}

export default CodeCupons
