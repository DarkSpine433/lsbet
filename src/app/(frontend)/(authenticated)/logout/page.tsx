'use client'

import type { signUpRetrunType } from '@/app/actions/signUp' // Fixed typo in type name
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Home, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
          message: 'Wystąpił błąd podczas wylogowywania. Spróbuj ponownie.',
          isSuccess: false,
          kind: 'userLogout',
        })
      } finally {
        setIsLoading(false)
      }
    }

    handleLogout()
  }, [])

  return (
    <div className="min-h-[90dvh] bg flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md shadow-lg border-0 overflow-hidden backdrop-blur-sm bg-slate-100">
        <CardHeader className="text-center relative z-10 text-foreground">
          <div className="flex justify-center mb-2">
            {isLoading ? (
              <LogOut className="h-8 w-8 text-rose-500 animate-pulse" />
            ) : response?.isSuccess ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 text-rose-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-background">
            {isLoading ? 'Wylogowywanie' : response?.isSuccess ? 'Wylogowany' : 'Błąd'}
          </CardTitle>
          <CardDescription>
            {isLoading
              ? 'Trwa wylogowywanie z systemu...'
              : response?.isSuccess
                ? 'Dziękujemy za skorzystanie z naszych usług! Do zobaczenia!'
                : 'Wystąpił błąd podczas wylogowywania. Spróbuj ponownie.'}
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col gap-4 relative z-10 p-6">
          {!isLoading && (
            <>
              <Button variant="default" className="w-full" asChild>
                <Link
                  href="/"
                  className="flex items-center gap-2 w-full justify-center text-foreground"
                >
                  <Home size={20} />
                  Powrót do strony głównej
                </Link>
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
