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

type Props = {
  user: User
}

const Account = (props: Props) => {
  const { user } = props
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-600"
        >
          <UserIcon className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" side="bottom" align="end">
        <div className="flex flex-col">
          <div className="p-4 border-b">
            <p className="text-sm font-semibold text-slate-800">{user.email.split('@')[0]}</p>
          </div>
          <nav className="p-2">
            <MyBets />
          </nav>
          <Separator />
          <PopoverClose className="p-2 w-full">
            <LogoutButton />
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default Account
