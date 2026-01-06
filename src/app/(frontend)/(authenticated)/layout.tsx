import type { Metadata } from 'next'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/Logo/Logo'
import { Wallet, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Account from '@/components/NavBar/Account/Account'
import Notification from '@/components/NavBar/Notification'
import Status from '@/components/NavBar/Status'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config })
  const headers = await nextHeaders()
  const { user } = await payload.auth({ headers })

  if (!user || !user.verified || user.banned) redirect('/')
  const moneySign = 'PLN'

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {/* Pasek Administratora - Refined Dark Blue */}
      {user.role === 'admin' && (
        <div className="flex items-center justify-center bg-blue-900/30 border-b border-blue-500/20 text-blue-400 p-1.5 text-xs font-bold tracking-widest uppercase">
          <ShieldCheck className="h-3 w-3 mr-2" />
          <span>Tryb Admina: {user.email.split('@')[0]}</span>
          <span className="mx-3 opacity-30">|</span>
          <Link
            href="/admin"
            className="hover:text-white underline decoration-blue-500/40 underline-offset-4 transition-colors"
          >
            Panel Zarządzania
          </Link>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="px-4 sm:px-8 py-3 md:py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo Area */}
            <div className="flex items-center cursor-pointer transition-transform hover:scale-[1.02] active:scale-95">
              <Logo className="h-8 md:h-9 w-auto" />
            </div>

            {/* Right Actions Area */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Wallet Widget - Tech Styled */}
              <div className="flex items-center gap-3 rounded-2xl bg-slate-900/50 px-4 py-2 border border-slate-800 shadow-inner group hover:border-blue-500/30 transition-all">
                <div className="p-1.5 rounded-lg bg-blue-600/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-1">
                    Saldo
                  </span>
                  <span className="font-black text-sm text-white tabular-nums leading-none">
                    {user.money?.toFixed(2)}{' '}
                    <span className="text-blue-500 text-[10px] ml-0.5">{moneySign}</span>
                  </span>
                </div>
              </div>

              {/* Interaction Icons */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Notification />

                <div className="h-8 w-px bg-slate-800 mx-1 hidden sm:block" />

                <div className="relative group">
                  <Account user={user} />
                  <Status className="absolute -top-0.5 -right-0.5 border-2 border-[#020617]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="relative">{children}</main>
    </div>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
}
