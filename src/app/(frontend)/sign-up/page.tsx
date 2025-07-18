'use client'
import signIn from '@/app/actions/signIn'
import signUp from '@/app/actions/signUp'
import type { signUpRetrunType } from '@/app/actions/signUp'
import { Card } from '@/components/Card'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SubmitButtonClient from '@/components/ui/SubmitButton.client'
import { CheckCircle, Home, LogIn, UserPlus } from 'lucide-react'

import Form from 'next/form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { email } from 'payload/shared'
import { useEffect, useState, useLayoutEffect } from 'react'

const Page = () => {
  const [response, setResponse] = useState({} as signUpRetrunType)
  const [isLoading, setIsLoading] = useState(false)
  const [loginPage, setLoginPage] = useState(false)
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const [counter, setCounter] = useState(10)
  const router = useRouter()

  const handleOauthSignUp = async (FormData: FormData) => {
    const nickname = FormData.get('nickname') as string
    const email = FormData.get('email') as string
    const password = FormData.get('password') as string
    const passwordConfirm = FormData.get('passwordConfirm') as string

    const response = await signUp({
      email: email,
      nickname: nickname,
      password: password,
      passwordConfirm: passwordConfirm,
    })
    if (response.isSuccess === false) {
      setNickname(nickname)
      setEmail(email)
      setPassword(password)
      setPasswordConfirm(passwordConfirm)
    } else {
      setNickname('')
      setEmail('')
      setPassword('')
      setPasswordConfirm('')
    }

    setResponse(response)
  }

  useEffect(() => {
    if (loginPage && response.isSuccess) {
      if (counter > 0) {
        const timer = setTimeout(() => {
          setCounter(counter - 1)
        }, 1000)

        return () => clearTimeout(timer)
      } else {
        router.push('/')
      }
    }
  }, [counter, router, loginPage, response.isSuccess])

  return (
    <>
      {response.isSuccess === false || response.isSuccess === undefined ? (
        <div
          className={`container flex items-center justify-center min-h-96 py-12 px-4 ${isLoading && 'animate-spin'}`}
        >
          <div className="w-full max-w-md shadow-lg border-0">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Rejestracja</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Utwórz nowe konto, aby rozpocząć
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form
                action={handleOauthSignUp}
                onChange={() => {
                  setResponse({} as signUpRetrunType)
                }}
                className={`${isLoading && 'animate-pulse opacity-50'} space-y-4`}
                formMethod="post"
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nickname <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="nickname"
                    id="nickname"
                    required
                    defaultValue={nickname}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
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
                    <span className="text-xs text-muted-foreground">(min. 6 znaków)</span>
                  </div>
                  <Input
                    type="password"
                    name="password"
                    id="password"
                    minLength={6}
                    defaultValue={password}
                    className="h-10"
                  />
                  {response.kind === 'passwordError' && (
                    <p className="text-sm text-destructive mt-1">{response.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm" className="text-sm font-medium">
                    Powtórz Hasło <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="password"
                    name="passwordConfirm"
                    id="passwordConfirm"
                    minLength={6}
                    defaultValue={passwordConfirm}
                    className="h-10"
                  />
                </div>

                {response.kind === 'error' && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                    {response.message}
                  </div>
                )}

                <SubmitButtonClient text="Zarejestruj się" isSuccess={response.isSuccess} />

                <div className="text-center text-sm mt-4">
                  Masz konto?{' '}
                  <Link href={'/auth/login'} replace={true}>
                    <Button
                      variant={'link'}
                      className=" p-0 text-primary font-medium hover:underline"
                      onClick={() => setLoginPage(true)}
                    >
                      Zaloguj się!
                    </Button>
                  </Link>
                </div>
              </Form>
            </CardContent>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full p-4 md:p-8">
          <div className="max-w-md w-full overflow-hidden border-0 shadow-lg">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="flex flex-col items-center pt-8 pb-2">
              <div className="rounded-full bg-emerald-100 p-3 mb-4">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="text-center px-6 pb-8 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Dziękujemy za rejestrację
              </h2>
              <div className="space-y-2 text-gray-600">
                <p className="text-base">
                  W ciągu 24h skontaktujemy się z tobą przez e-mail lub forum, aby zweryfikować
                  Twoje konto.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
              >
                Powrót do strony głównej
              </Link>
            </CardContent>
          </div>
        </div>
      )}
    </>
  )
}

export default Page
