import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import { getServerSideURL } from '@/utilities/getURL'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/Logo/Logo'
import { Bell, BellRing, Wallet } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import LogoutButton from '@/components/ui/logout-button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config })
  const headers = await nextHeaders()
  const { user } = await payload.auth({ headers })

  if (!user || !user.verified || user.banned) redirect('/')
  const moneySign = '$'
  return (
    <div className="bg-white">
      {user.role === 'admin' && (
        <div className="flex items-center justify-center bg-blue-500 text-white p-1">
          <span>
            <p className="">Witaj, {user.email.split('@')[0]}!</p>
          </span>
          &nbsp;
          <span>
            <Link href="/admin" className=" underline">
              Go to Admin Dashboard
            </Link>
          </span>
        </div>
      )}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4 cursor-pointer">
              <Logo />
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge className="bg-gradient-to-r from-red-500 to-blue-500 text-white hidden sm:inline-flex">
                {user.email.split('@')[0].toString()}
              </Badge>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" side="bottom" align="center">
                  <div className="flex flex-col items-center justify-center ">
                    <BellRing className="h-4 w-4" />
                    <p className="text-sm text-slate-600">Brak powiadomień</p>
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex items-center space-x-2 bg-secondary rounded-lg px-3 py-2">
                <Wallet className="h-4 w-4 text-slate-600" />
                <span className="font-semibold text-sm">
                  {user.money?.toFixed(2)}&nbsp;{moneySign}
                </span>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
}
