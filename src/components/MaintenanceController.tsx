'use client'

import { usePathname } from 'next/navigation'
import MaintenancePage from '@/components/MainPage/MeintenancePage'

export default function MaintenanceController({
  children,
  maintenancePaths,
  redirectTo = '/logout',
  redirectButtonText = 'Wyloguj się',
  maintenancePagesDescription = 'Obecnie wprowadzamy nowe systemy i zabezpieczenia, aby Twoja gra była jeszcze bardziej płynna.',
}: {
  children: React.ReactNode
  maintenancePaths: string[]
  redirectTo?: string
  redirectButtonText?: string
  maintenancePagesDescription?: string
}) {
  const pathname = usePathname()

  // Sprawdzamy czy aktualna ścieżka znajduje się na liście zablokowanych
  const isMaintenance = maintenancePaths.some((path) => pathname === path)

  if (isMaintenance) {
    // Przekazujemy parametry do strony technicznej
    return (
      <MaintenancePage
        redirectTo={redirectTo}
        buttonText={redirectButtonText}
        maintenancePagesDescription={maintenancePagesDescription}
      />
    )
  }

  return <>{children}</>
}
