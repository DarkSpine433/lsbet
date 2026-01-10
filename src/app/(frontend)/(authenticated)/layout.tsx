import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/Logo/Logo'
import { Wallet, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import Account from '@/components/NavBar/Account/Account'
import Notification from '@/components/NavBar/Notification'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { NavTabs } from '@/components/MainPage/NavTabs'
import Heartbeat from '@/components/NavBar/Heartbeat'
import Status from '@/components/NavBar/Status'
import OfflineBarStatus from '@/components/MainPage/OfflineBarStatus'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config })
  const headers = await nextHeaders()
  const { user } = await payload.auth({ headers })

  if (!user || !user.verified || user.banned) redirect('/')
  const moneySign = '$'

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {/* Pasek Administratora */}
      {user.role === 'admin' && (
        <div className="flex items-center justify-center bg-blue-900/30 border-b border-blue-500/20 text-blue-400 p-1.5 text-xs font-bold tracking-widest uppercase">
          <ShieldCheck className="h-3 w-3 mr-2" />
          <span>Admin: {user.email.split('@')[0]}</span>
          <span className="mx-3 opacity-30">|</span>
          <Link href="/admin" className="hover:text-white underline decoration-blue-500/40">
            Panel
          </Link>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="px-4 sm:px-8 py-3 md:py-4 max-w-screen-2xl mx-auto flex items-center justify-between">
          <Logo className="h-2 w-auto mr-2" priority="high" loading="eager" />

          <div className="flex items-center space-x-4">
            {/* Wallet */}
            <div className="flex items-center gap-3 rounded-2xl bg-slate-900/50 px-4 py-2 border border-slate-800 group hover:border-blue-500/30 transition-all">
              <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Wallet className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">
                  Saldo
                </span>
                <span className="font-black text-sm text-white leading-none flex items-center">
                  {user.money?.toFixed(2)}

                  <div className="text-blue-500 text-[10px] ml-0.5 "> {moneySign}</div>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Notification />
              <div className="h-8 w-px bg-slate-800 mx-1 hidden sm:block" />
              <div className="relative group">
                <Heartbeat />

                {/* ... reszta kodu paska ... */}
                <div className="relative">
                  <Status
                    lastActive={
                      user.lastActive ? new Date(user.lastActive).toISOString() : undefined
                    }
                    className="absolute -top-0.5 -right-0.5 border-[1px] border-transparent "
                  />

                  <Account user={user} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="relative">
        {children}
        {/* Nawigacja kliencka z Loaderem */}
        <NavTabs />
      </main>
      <OfflineBarStatus />
    </div>
  )
}
export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
}
