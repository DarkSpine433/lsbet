import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/Logo/Logo'
import { Wallet, ShieldCheck, Ticket } from 'lucide-react'
import Link from 'next/link'
import Account from '@/components/NavBar/Account/Account'
import Notification from '@/components/NavBar/Notification'
import { NavTabs } from '@/components/MainPage/NavTabs'
import Heartbeat from '@/components/NavBar/Heartbeat'
import Status from '@/components/NavBar/Status'
import OfflineBarStatus from '@/components/MainPage/OfflineBarStatus'
import MaintenanceController from '@/components/MaintenanceController'
import { WalletStatus } from '@/components/NavBar/WalletStatus'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config })
  const headers = await nextHeaders()
  const { user } = await payload.auth({ headers })

  if (!user || !user.verified || user.banned) redirect('/')

  const moneySign = '$'

  // Parsowanie obiektu z ENV
  let maintenanceConfig = {
    maintenancePages: [],
    redirectTo: '/logout',
    redirectButtonText: 'Wyloguj się',
    maintenancePagesDescription:
      'Obecnie wprowadzamy nowe systemy i zabezpieczenia, aby Twoja gra była jeszcze bardziej płynna.',
  }

  if (process.env.MAINTENANCE_PAGES) {
    try {
      const parsed = JSON.parse(process.env.MAINTENANCE_PAGES)
      maintenanceConfig = {
        maintenancePages: parsed.maintenancePages || [],
        redirectTo: parsed.redirectTo || '/logout',
        redirectButtonText: parsed.redirectButtonText || 'Wyloguj się',
        maintenancePagesDescription: parsed.maintenancePagesDescription || '',
      }
    } catch (e) {
      console.error('Błąd parsowania MAINTENANCE_PAGES:', e)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
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

      <header className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="px-4 sm:px-8 py-3 md:py-4 max-w-screen-2xl mx-auto flex items-center justify-between">
          <Logo className="h-2 w-auto mr-2" priority="high" loading="eager" />

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* ZASTĘPUJEMY STARY KOD NOWYM KOMPONENTEM */}
            <WalletStatus user={user} moneySign={moneySign} />

            <div className="flex items-center gap-2">
              <Notification />
              <div className="h-8 w-px bg-slate-800 mx-1 hidden sm:block" />
              <div className="relative group">
                <div className="relative">
                  <Status className="absolute -top-0.5 -right-0.5 border-[1px] border-transparent " />
                  <Account user={user} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Przekazujemy rozszerzoną konfigurację do kontrolera */}
        <MaintenanceController
          maintenancePaths={maintenanceConfig.maintenancePages}
          redirectTo={maintenanceConfig.redirectTo}
          redirectButtonText={maintenanceConfig.redirectButtonText}
          maintenancePagesDescription={maintenanceConfig.maintenancePagesDescription}
        >
          {children}
        </MaintenanceController>

        <NavTabs />
      </main>
      <OfflineBarStatus />
    </div>
  )
}
