'use client'

import type { signUpRetrunType } from '@/app/actions/signUp'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Home, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { logout } from '@/app/actions/logout'

export default function LogoutPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [response, setResponse] = useState<signUpRetrunType | null>(null)

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const result = await logout({})
        setResponse(result)
      } catch (error) {
        console.error('Logout failed:', error)
        setResponse({
          data: null,
          message: 'Wystąpił błąd podczas wylogowywania.',
          isSuccess: false,
          kind: 'userLogout',
        })
      } finally {
        setIsLoading(false)
        // Opcjonalne: automatyczne przekierowanie po 3 sekundach sukcesu
        setTimeout(() => router.push('/'), 3000)
      }
    }

    handleLogout()
  }, [router])

  return (
    <div className="min-h-[90dvh] flex items-center justify-center p-4 bg-[#020617]">
      {/* Dekoracyjne tło */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />

      <Card className="w-full max-w-md bg-slate-900/40 border-slate-800 backdrop-blur-md shadow-2xl overflow-hidden rounded-[2rem]">
        <div className="h-1.5 w-full bg-slate-800 overflow-hidden">
          {isLoading && (
            <div className="h-full bg-blue-600 animate-progress" style={{ width: '40%' }} />
          )}
        </div>

        <CardHeader className="text-center pt-10 pb-6">
          <div className="flex justify-center mb-6">
            <div
              className={`
              h-20 w-20 rounded-3xl flex items-center justify-center border transition-all duration-500
              ${
                isLoading
                  ? 'bg-slate-900 border-slate-800'
                  : response?.isSuccess
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
              }
            `}
            >
              {isLoading ? (
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              ) : response?.isSuccess ? (
                <CheckCircle2 className="h-10 w-10 text-green-500 animate-in zoom-in duration-300" />
              ) : (
                <XCircle className="h-10 w-10 text-red-500 animate-in zoom-in duration-300" />
              )}
            </div>
          </div>

          <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">
            {isLoading ? 'Zamykanie' : response?.isSuccess ? 'Wylogowano' : 'Błąd'}{' '}
            <span className="text-blue-500">Sesji</span>
          </CardTitle>

          <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
            {isLoading
              ? 'Trwa bezpieczne rozłączanie z serwerem...'
              : response?.isSuccess
                ? 'Twoje dane zostały zabezpieczone. Do zobaczenia!'
                : response?.message}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 py-0">
          {!isLoading && response?.isSuccess && (
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 font-medium italic">
                &quot;Pamiętaj o bezpiecznym przechowywaniu hasła do swojego konta OOC.&quot;
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-10 pt-8">
          {!isLoading && (
            <Button
              variant="default"
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase italic tracking-widest rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all group"
              asChild
            >
              <Link href="/">
                <Home className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
                Powrót na Start
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
