'use client'

import { changePwd } from '@/app/actions/changePwd'
import { signUpRetrunType } from '@/app/actions/signUp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import React, { useState, useTransition } from 'react'
import { toast } from 'sonner'
import CircularProgress from '@mui/material/CircularProgress'

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
    <div className="">
      <form action={handlePwdChange} className="space-y-6 text-slate-800">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Aktualne hasło</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              className="bg-slate-100 border-slate-200 shadow-inner pr-[2.75rem] focus-visible:ring-1 focus-visible:ring-blue-400 text-slate-800 caret-slate-900"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-0 h-full px-3"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nowe hasło</Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              className="bg-slate-100 border-slate-200 shadow-inner pr-[2.75rem] focus-visible:ring-1 focus-visible:ring-blue-400 text-slate-800 caret-slate-900"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-0 h-full px-3"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className="bg-slate-100 border-slate-200 shadow-inner pr-[2.75rem] focus-visible:ring-1 focus-visible:ring-blue-400 text-slate-800 caret-slate-900"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-0 h-full px-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <Button variant="secondary" type="submit" className="w-full" disabled={isPending}>
          {isPending ? <CircularProgress size={20} color="inherit" /> : 'Zmień hasło'}
        </Button>
      </form>
    </div>
  )
}

export default ChangePwd
