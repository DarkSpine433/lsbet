import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import { Button } from '../../ui/button'
import { UserIcon, LogOut, History } from 'lucide-react'
import LogoutButton from '../../ui/logout-button'
import { User } from '@/payload-types'
import { Separator } from '../../ui/separator'
import Link from 'next/link'
import { PopoverClose } from '@radix-ui/react-popover'
import MyBets from './MyBets/MyBets'
import CodeCupons from './CodeCupons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

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
      <DialogContent className=" max-w-96  w-full h-5/6 max-h-96 ">
        <div className="flex flex-col">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-lg font-semibold text-slate-800">Moje konto</DialogTitle>
            <DialogDescription className="text-sm font-semibold text-slate-800">
              <span className="font-normal">Witaj,&nbsp;</span>
              <span>{user.email.split('@')[0]}</span>
              <span className="font-normal">!</span>
            </DialogDescription>
          </DialogHeader>
          <nav className="p-2 flex flex-col gap-2 ">
            <CodeCupons />
            <Separator />
            <MyBets />
          </nav>
          <Separator className="mb-2" />

          <LogoutButton />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Account
