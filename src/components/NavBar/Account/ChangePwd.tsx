'use client'

import { changePwd } from '@/app/actions/changePwd'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, LockKeyhole, Loader2 } from 'lucide-react'
import React, { useState, useTransition } from 'react'
import { toast } from 'sonner'

const ChangePwd = () => {
  const [isPending, startTransition] = useTransition()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handlePwdChange = async (formData: FormData) => {
    startTransition(async () => {
      const currentPassword = formData.get('currentPassword') as string
      const newPassword = formData.get('newPassword') as string
      const confirmPassword = formData.get('confirmPassword') as string

      const response = await changePwd({
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmPassword,
      })

      if (response.isSuccess) {
        toast.success(response.message || 'Hasło zostało pomyślnie zmienione.')
      } else {
        toast.error(response.message || 'Wystąpił błąd podczas zmiany hasła.')
      }
    })
  }

  return (
    <div className="w-full">
      <form action={handlePwdChange} className="space-y-5">
        {/* Aktualne Hasło */}
        <div className="space-y-2">
          <Label
            htmlFor="currentPassword"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1"
          >
            Aktualne hasło
          </Label>
          <div className="relative group">
            <Input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 h-11 pr-12 rounded-xl focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all shadow-inner"
              placeholder="••••••••"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500 hover:bg-transparent"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Nowe Hasło */}
        <div className="space-y-2">
          <Label
            htmlFor="newPassword"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1"
          >
            Nowe hasło
          </Label>
          <div className="relative group">
            <Input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 h-11 pr-12 rounded-xl focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all shadow-inner"
              placeholder="Min. 8 znaków"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500 hover:bg-transparent"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Potwierdź Hasło */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1"
          >
            Potwierdź nowe hasło
          </Label>
          <div className="relative group">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-700 h-11 pr-12 rounded-xl focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all shadow-inner"
              placeholder="Powtórz hasło"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase italic tracking-widest rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all active:scale-[0.98] group"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 group-hover:animate-pulse" />
              Zaktualizuj dane
            </div>
          )}
        </Button>
      </form>
    </div>
  )
}

export default ChangePwd
