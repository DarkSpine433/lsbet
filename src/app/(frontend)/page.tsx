'use client'
import signIn from '@/app/actions/signIn'
import type { signUpRetrunType } from '@/app/actions/signUp'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SubmitButtonClient from '@/components/ui/SubmitButton.client'
import { CheckCircle, Home, LogIn, User } from 'lucide-react'

import Form from 'next/form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useLayoutEffect } from 'react'

const Page = () => {
  const [response, setResponse] = useState({} as signUpRetrunType)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [counter, setCounter] = useState(10)
  const router = useRouter()

  const handleLogin = async (FormData: FormData) => {
    setIsLoading(true)

    const email = FormData.get('email') as string
    const password = FormData.get('password') as string

    const response = await signIn({
      email: email,
      password: password,
    })
    if (response.isSuccess === false) {
      setEmail(email)
      setPassword(password)
    } else {
      setEmail('')
      setPassword('')
    }

    setResponse(response)
    setIsLoading(false)
  }

  useEffect(() => {
    if (response.isSuccess) {
      if (counter > 0) {
        const timer = setTimeout(() => {
          setCounter(counter - 1)
        }, 1000)

        return () => clearTimeout(timer)
      } else {
        router.push('/')
      }
    }
  }, [counter, router, response.isSuccess])

  return (
    <>
      {response.isSuccess === false || response.isSuccess === undefined ? (
        <>
          {' '}
          <div className="container flex items-center justify-center min-h-96  py-12 px-4">
            <div className="w-full max-w-md shadow-lg border-0">
              <CardHeader className="space-y-1 pb-6">
                <div className="flex justify-center mb-2">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <LogIn className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Logowanie</CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                  Zaloguj się do swojego konta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form
                  action={handleLogin}
                  onChange={() => {
                    setResponse({} as signUpRetrunType)
                  }}
                  className={`${isLoading && 'animate-pulse opacity-50'} space-y-4`}
                  formMethod="post"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      required
                      defaultValue={email}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Hasło <span className="text-destructive">*</span>
                      </Label>
                      <Link
                        href="/auth/reset-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Zapomniałeś(-aś) hasła?
                      </Link>
                    </div>
                    <Input
                      type="password"
                      name="password"
                      id="password"
                      required
                      defaultValue={password}
                      className="h-10"
                    />
                  </div>

                  {response.kind === 'error' && (
                    <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                      {response.message}
                    </div>
                  )}

                  <SubmitButtonClient text="Zaloguj się" isSuccess={response.isSuccess} />

                  <div className="text-center text-sm mt-4">
                    Nie masz konta?{' '}
                    <Link href={'/auth/sign-up'}>
                      {' '}
                      <Button
                        variant={'link'}
                        className=" p-0 text-primary font-medium hover:underline"
                      >
                        Zarejestruj się!
                      </Button>
                    </Link>
                  </div>
                </Form>
              </CardContent>
            </div>
          </div>
        </>
      ) : (
        <>
          {' '}
          <div className="container flex items-center justify-center min-h-96 py-12 px-4">
            <div className="w-full max-w-md shadow-lg border-0">
              <CardHeader className="space-y-1 pb-6">
                <div className="flex justify-center mb-2">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Logowanie udane!</CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                  Za chwilę zostaniesz przekierowany na stronę główną
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-primary">{counter}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Automatyczne przekierowanie za {counter} {counter === 1 ? 'sekundę' : 'sekund'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                  <Link href={''} className="w-full">
                    <Button className="flex items-center gap-2 text-sm justify-center w-full">
                      <Home className="h-4 w-4" />
                      Strona główna
                    </Button>
                  </Link>
                  <Link href={'/auth/account'} className="w-full">
                    <Button
                      className="flex items-center gap-2 text-sm justify-center w-full"
                      variant={'secondary'}
                    >
                      <User className="h-4 w-4" />
                      Moje konto
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Page
