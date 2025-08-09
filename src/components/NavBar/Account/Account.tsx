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
import { Separator } from '../../ui/separator'
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

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* My Bets Section */}
          <section>
            <MyBets />
          </section>

          <Separator />

          {/* Promo Codes Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Gift className="h-5 w-5 text-slate-500" />
              <h3 className="text-lg font-semibold text-slate-800">Kody Promocyjne</h3>
            </div>
            <CodeCupons />
          </section>

          <Separator />

          {/* Change Password Section */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <KeyRound className="h-5 w-5 text-slate-500" />
              <h3 className="text-lg font-semibold text-slate-800">Zmień Hasło</h3>
            </div>
            <ChangePwd />
          </section>
        </div>

        <div className="p-6 border-t mt-auto">
          <LogoutButton />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Account
