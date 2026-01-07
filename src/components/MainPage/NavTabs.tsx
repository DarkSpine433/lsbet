'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export function NavTabs() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [loadingType, setLoadingType] = useState<'betting' | 'casino' | null>(null)

  const IMAGES = {
    casino: 'https://ut91p27j9t.ufs.sh/f/CI2WZ5YUTq1bmB6rRKrbrT3CSkn1Ncw8VjzWI9JpLahu5teR',
    betting: 'https://ut91p27j9t.ufs.sh/f/CI2WZ5YUTq1b5mpQ3hTF5LkXP7DvMqtnhJY1IRlZB9uEWTOr',
  }

  // Resetuj stan ładowania po zmianie ścieżki
  useEffect(() => {
    setIsPending(false)
    setLoadingType(null)
  }, [pathname])

  const handleTabChange = (value: string) => {
    const targetPath = value === 'casino' ? '/casino' : '/home'

    // Jeśli już tu jesteśmy, nie rób nic
    if (pathname === targetPath) return

    // 1. Włącz loader
    setLoadingType(value as 'betting' | 'casino')
    setIsPending(true)

    // 2. Wykonaj nawigację
    router.push(targetPath)
  }

  return (
    <>
      {/* EKRAN ŁADOWANIA */}
      {isPending && loadingType && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617] transition-opacity duration-300">
          <div className="relative w-64 h-64 mb-8">
            <div className="absolute inset-0 blur-[100px] bg-blue-600/20 rounded-full animate-pulse" />
            <Image
              src={IMAGES[loadingType]}
              alt="Loading..."
              fill
              className="object-contain relative z-10 scale-110"
              priority
              unoptimized // Zapobiega problemom z optymalizacją zewnętrznych URL
            />
          </div>

          <div className="flex flex-col items-center gap-4 relative z-20">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="text-xs font-black uppercase italic tracking-[0.5em] text-blue-400 drop-shadow-lg">
              {loadingType === 'casino' ? 'Wczytywanie kasyna...' : 'Przygotowywanie zakładów...'}
            </p>
          </div>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
        <Tabs
          value={pathname.includes('/casino') ? 'casino' : 'betting'}
          onValueChange={handleTabChange}
        >
          <TabsList className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 px-2  rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <TabsTrigger
              value="betting"
              className=" data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all font-black uppercase italic text-xs tracking-wider"
            >
              Betting
            </TabsTrigger>
            <TabsTrigger
              value="casino"
              className=" data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all font-black uppercase italic text-xs tracking-wider"
            >
              Casino
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </>
  )
}
