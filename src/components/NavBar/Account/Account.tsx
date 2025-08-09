'use client'

import React from 'react'
import { Button } from '../../ui/button'
import { UserIcon, History, Gift, KeyRound } from 'lucide-react'
import LogoutButton from '../../ui/logout-button'
import { User } from '@/payload-types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ChangePwd from './ChangePwd'
import CodeCupons from './CodeCupons'
import MyBets from './MyBets/MyBets'

type Props = {
  user: User
}

const Account = (props: Props) => {
  const { user } = props
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-600"
        >
          <UserIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full max-h-[90dvh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl font-bold text-slate-900">Moje konto</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Witaj, <span className="font-medium text-slate-700">{user.email.split('@')[0]}</span>!
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="bets" className="w-full flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-auto px-6 border-b">
            <TabsTrigger value="bets">
              <History className="h-4 w-4 mr-2" />
              Zakłady
            </TabsTrigger>
            <TabsTrigger value="coupons">
              <Gift className="h-4 w-4 mr-2" />
              Kupony
            </TabsTrigger>
            <TabsTrigger value="password">
              <KeyRound className="h-4 w-4 mr-2" />
              Hasło
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="bets">
              <MyBets />
            </TabsContent>
            <TabsContent value="coupons">
              <CodeCupons />
            </TabsContent>
            <TabsContent value="password">
              <ChangePwd />
            </TabsContent>
          </div>
        </Tabs>

        <div className="p-6 border-t mt-auto">
          <LogoutButton />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Account
