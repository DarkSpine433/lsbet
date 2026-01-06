'use client'

import { Button } from '@/components/ui/button'
import { useFormStatus } from 'react-dom'
import React from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'

const SubmitButtonClient = ({
  text,
  isSuccess,
  className,
  loadingSize = 20,
  children,
}: {
  text?: string
  isSuccess: boolean
  className?: string
  loadingSize?: number
  children?: React.ReactNode
}) => {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending || isSuccess}
      className={`
        ${className ?? 'w-full h-12 mt-6'} 
        relative overflow-hidden rounded-xl font-black uppercase italic tracking-widest transition-all duration-300
        ${
          isSuccess
            ? 'bg-green-500 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-[0.98]'
        }
        disabled:opacity-80 disabled:cursor-not-allowed
      `}
    >
      {/* Efekt błysku przy najechaniu */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      <div className="flex items-center justify-center gap-2">
        {pending ? (
          <Loader2 className="animate-spin" style={{ width: loadingSize, height: loadingSize }} />
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="h-5 w-5 animate-in zoom-in duration-300" />
            <span>Gotowe</span>
          </>
        ) : (
          <>
            {children}
            <span>{text ?? 'Zatwierdź'}</span>
          </>
        )}
      </div>
    </Button>
  )
}

export default SubmitButtonClient
