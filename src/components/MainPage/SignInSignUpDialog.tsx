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
import { CheckCircle, LogIn, UserPlus, ShieldCheck, Mail, Loader2 } from 'lucide-react'

import Form from 'next/form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Props = {
  children?: React.ReactNode
  signUp?: boolean
}

const SignInSignUpDialog = (props: Props) => {
  const { children } = props
  const [response, setResponse] = useState({} as signUpRetrunType)
  const [isLoading, setIsLoading] = useState(false)

  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const router = useRouter()
  const signInOrSignUp = props.signUp ? 'sign-Up' : 'sign-In'

  const handleLogin = async (FormData: FormData) => {
    setIsLoading(true)
    const nickname = FormData.get('nickname') as string
    const password = FormData.get('password') as string

    const response = await signIn({ nickname, password })
    if (response.isSuccess === false) {
      setNickname(nickname)
      setPassword(password)
    } else {
      setNickname('')
      setPassword('')
    }

    setResponse(response)
    if (response.isSuccess) {
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleOauthSignUp = async (FormData: FormData) => {
    setIsLoading(true)
    const nickname = FormData.get('nickname') as string
    const password = FormData.get('password') as string
    const passwordConfirm = FormData.get('passwordConfirm') as string

    const response = await signUp({ nickname, password, passwordConfirm })
    if (response.isSuccess === false) {
      setNickname(nickname)
      setPassword(password)
      setPasswordConfirm(passwordConfirm)
    } else {
      setNickname('')
      setPassword('')
      setPasswordConfirm('')
    }

    setResponse(response)
    setIsLoading(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md w-full bg-[#020617] border-slate-800 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 pb-4 border-b border-slate-800/50 bg-gradient-to-b from-blue-600/10 to-transparent">
          <DialogTitle className="text-2xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
            </div>
            Weryfikacja <span className="text-blue-500">Dostępu</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 bg-slate-950/20">
          <Tabs defaultValue={signInOrSignUp} className="w-full">
            <TabsList className="grid grid-cols-2 bg-slate-900 border border-slate-800 p-1 h-12 rounded-xl mb-8">
              <TabsTrigger
                value="sign-In"
                className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase italic text-[10px] tracking-widest transition-all"
              >
                Logowanie
              </TabsTrigger>
              <TabsTrigger
                value="sign-Up"
                className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase italic text-[10px] tracking-widest transition-all"
              >
                Rejestracja
              </TabsTrigger>
            </TabsList>

            {/* TAB: LOGIN */}
            <TabsContent value="sign-In" className="mt-0">
              <Form
                action={handleLogin}
                onChange={() => setResponse({} as signUpRetrunType)}
                className="space-y-5"
                formMethod="post"
              >
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Nick OOC (Forum)
                  </Label>
                  <Input
                    name="nickname"
                    required
                    defaultValue={nickname}
                    className="bg-slate-950 border-slate-800 text-white h-11 rounded-xl focus-visible:ring-blue-600 transition-all shadow-inner"
                    placeholder="Wpisz swój nick..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Hasło
                  </Label>
                  <Input
                    type="password"
                    name="password"
                    required
                    defaultValue={password}
                    className="bg-slate-950 border-slate-800 text-white h-11 rounded-xl focus-visible:ring-blue-600 transition-all shadow-inner"
                    placeholder="••••••••"
                  />
                </div>

                {response.kind === 'error' && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-tight text-center">
                    {response.message}
                  </div>
                )}

                <div className="pt-2">
                  <SubmitButtonClient text="Zaloguj do systemu" isSuccess={response.isSuccess} />
                </div>
              </Form>
            </TabsContent>

            {/* TAB: SIGN UP */}
            <TabsContent value="sign-Up" className="mt-0">
              {response.isSuccess ? (
                <div className="text-center py-8 space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center animate-bounce">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-black italic uppercase text-white">
                      Wysłano Zgłoszenie
                    </h2>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Twoje konto czeka na weryfikację. Skontaktujemy się z Tobą przez{' '}
                      <span className="text-blue-500">Forum devGaming</span> w ciągu 24h.
                    </p>
                  </div>
                </div>
              ) : (
                <Form
                  action={handleOauthSignUp}
                  onChange={() => setResponse({} as signUpRetrunType)}
                  className="space-y-4"
                  formMethod="post"
                >
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                      Nick OOC (Forum)
                    </Label>
                    <Input
                      name="nickname"
                      required
                      defaultValue={nickname}
                      className="bg-slate-950 border-slate-800 text-white h-11 rounded-xl focus-visible:ring-blue-600 transition-all"
                      placeholder="Twój nick z forum..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                      Hasło
                    </Label>
                    <Input
                      type="password"
                      name="password"
                      minLength={6}
                      defaultValue={password}
                      className="bg-slate-950 border-slate-800 text-white h-11 rounded-xl focus-visible:ring-blue-600 transition-all"
                      placeholder="Min. 6 znaków"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                      Powtórz Hasło
                    </Label>
                    <Input
                      type="password"
                      name="passwordConfirm"
                      minLength={6}
                      defaultValue={passwordConfirm}
                      className="bg-slate-950 border-slate-800 text-white h-11 rounded-xl focus-visible:ring-blue-600 transition-all"
                      placeholder="Weryfikacja hasła"
                    />
                  </div>

                  {response.kind === 'error' && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold text-center">
                      {response.message}
                    </div>
                  )}

                  <div className="pt-2">
                    <SubmitButtonClient text="Utwórz konto gracza" isSuccess={response.isSuccess} />
                  </div>
                </Form>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-6 border-t border-slate-800 bg-[#020617] text-center">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
            Zabezpieczone przez system <span className="text-blue-900">LSBet Shield</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SignInSignUpDialog
