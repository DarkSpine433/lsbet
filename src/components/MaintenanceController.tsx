// @/components/MaintenanceController.tsx
'use client'

import { usePathname } from 'next/navigation'
import MaintenancePage from '@/components/MainPage/MeintenancePage'

export default function MaintenanceController({
  children,
  maintenancePaths,
}: {
  children: React.ReactNode
  maintenancePaths: string[]
}) {
  const pathname = usePathname()

  // Sprawdzamy czy aktualna ścieżka znajduje się na liście zablokowanych
  const isMaintenance = maintenancePaths.some((path) => pathname === path)

  if (isMaintenance) {
    return <MaintenancePage />
  }

  return <>{children}</>
}
