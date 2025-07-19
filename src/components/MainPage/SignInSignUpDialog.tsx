'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import signIn from '@/app/actions/signIn'
import signUp from '@/app/actions/signUp'
import type { signUpRetrunType } from '@/app/actions/signUp'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SubmitButtonClient from '@/components/ui/SubmitButton.client'
import { CheckCircle, LogIn, UserPlus } from 'lucide-react'

import Form from 'next/form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
type Props = {
  children?: React.ReactNode
  signUp?: boolean
  isLoading?: boolean
}

const SignInSignUpDialog = (props: Props) => {
  const { children } = props
  const [response, setResponse] = useState({} as signUpRetrunType)
  const [isLoading, setIsLoading] = useState(false)

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const router = useRouter()
  const signInOrSignUp = props.signUp ? 'sign-Up' : 'sign-In'

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
    if (response.isSuccess) {
      router.refresh()
    }
    setIsLoading(false)
  }
  const handleOauthSignUp = async (FormData: FormData) => {
    const nickname = FormData.get('nickname') as string
    const email = FormData.get('email') as string
    const password = FormData.get('password') as string
    const passwordConfirm = FormData.get('passwordConfirm') as string

    const response = await signUp({
      nickname: nickname,
      email: email,
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

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader className="sr-only">
            <DialogTitle>Zaloguj się lub zarejestruj się</DialogTitle>
          </DialogHeader>
          <DialogContent className="min-h-96">
            <Tabs defaultValue={signInOrSignUp} className="w-full max-w-5xl">
              <div className="w-full flex justify-center ">
                <TabsList>
                  <TabsTrigger value="sign-In">Zaloguj się</TabsTrigger>
                  <TabsTrigger value="sign-Up">Zarejestruj się</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="sign-In">
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
                      </Form>
                    </CardContent>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="sign-Up">
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
                        <CardTitle className="text-2xl font-bold text-center">
                          Rejestracja
                        </CardTitle>
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
                            <Label htmlFor="nickname" className="text-sm font-medium">
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
                            {response.kind === 'userExists' && (
                              <p className="text-sm text-destructive mt-1">{response.message}</p>
                            )}
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

                          <SubmitButtonClient
                            text="Zarejestruj się"
                            isSuccess={response.isSuccess}
                          />
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
                        <h2 className="text-3xl font-bold tracking-tight ">
                          Dziękujemy za rejestrację
                        </h2>
                        <div className="space-y-2 text-muted-foreground">
                          Skontaktujemy się w ciągu 24h przez e-mail albo Forum, aby zweryfikować
                          twoje konto.
                        </div>
                      </CardContent>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SignInSignUpDialog
