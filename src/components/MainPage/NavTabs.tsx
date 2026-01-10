'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronDown, Menu } from 'lucide-react'
import Image from 'next/image'

export function NavTabs() {
  const pathname = usePathname()
  const router = useRouter()

  const [isPending, setIsPending] = useState(false)
  const [loadingType, setLoadingType] = useState<'betting' | 'casino' | null>(null)
  const [isHidden, setIsHidden] = useState(false)
  const [hasNewWin, setHasNewWin] = useState(false)
  const [lastWinCount, setLastWinCount] = useState(0)

  const IMAGES = {
    casino: 'https://ut91p27j9t.ufs.sh/f/CI2WZ5YUTq1bmB6rRKrbrT3CSkn1Ncw8VjzWI9JpLahu5teR',
    betting: 'https://ut91p27j9t.ufs.sh/f/CI2WZ5YUTq1b5mpQ3hTF5LkXP7DvMqtnhJY1IRlZB9uEWTOr',
  }

  const checkWins = useCallback(async () => {
    try {
      const res = await fetch('/api/casino-wins?limit=1')
      const data = await res.json()
      const currentCount = data?.totalDocs || 0
      if (lastWinCount > 0 && currentCount > lastWinCount && !pathname.includes('/casino')) {
        setHasNewWin(true)
      }
      setLastWinCount(currentCount)
    } catch (err) {
      console.error(err)
    }
  }, [lastWinCount, pathname])

  useEffect(() => {
    const interval = setInterval(checkWins, 10000)
    return () => clearInterval(interval)
  }, [checkWins])

  useEffect(() => {
    if (pathname.includes('/casino')) setHasNewWin(false)
    setIsPending(false)
    setLoadingType(null)
  }, [pathname])

  const handleTabChange = (value: string) => {
    const targetPath = value === 'casino' ? '/casino' : '/home'
    if (pathname === targetPath) return
    setLoadingType(value as 'betting' | 'casino')
    setIsPending(true)
    router.push(targetPath)
  }

  return (
    <>
      {/* --- ULTRA PREMIUM LOADER --- */}
      {isPending && loadingType && (
        <div className="fixed inset-0 z-[50] flex flex-col items-center justify-center bg-[#020617]">
          {/* Dynamiczne poświaty w tle */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/15 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/15 blur-[120px] rounded-full animate-pulse" />
          </div>

          <div className="relative flex flex-col items-center z-10 px-6">
            {/* Logo Container z efektami High-Tech */}
            <div className="relative mb-12">
              {/* Rozchodzący się pierścień (Ripple) */}
              <div className="absolute inset-0 scale-150 bg-blue-500/5 rounded-full blur-2xl animate-ping duration-[3s]" />

              <div className="relative w-32 h-32 md:w-40 md:h-40 animate-in fade-in zoom-in duration-700">
                <div className="w-full h-full animate-[float_4s_infinite] ease-in-out">
                  <Image
                    src={IMAGES[loadingType]}
                    alt="Loading..."
                    fill
                    className="object-contain drop-shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                    priority
                    unoptimized
                  />
                </div>

                {/* Obrotowy pierścień wokół logo */}
                <div className="absolute -inset-4 border-t-2 border-blue-500/40 border-r-2 border-transparent rounded-full animate-spin duration-[1.5s]" />
                <div className="absolute -inset-4 border-b-2 border-blue-900/40 border-l-2 border-transparent rounded-full animate-spin duration-[2s] direction-reverse" />
              </div>
            </div>

            {/* Tekst ładowania */}
            <div className="space-y-3 mb-8 text-center">
              <h2 className="text-white text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
                {loadingType === 'casino' ? 'Entering the Arena' : 'Analyzing Markets'}
              </h2>
              <div className="flex items-center justify-center gap-3">
                <span className="h-[1px] w-10 bg-gradient-to-r from-transparent to-blue-500"></span>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-400/80 animate-pulse">
                  Establishing Connection
                </p>
                <span className="h-[1px] w-10 bg-gradient-to-l from-transparent to-blue-500"></span>
              </div>
            </div>

            {/* Premium Progress Bar */}
            <div className="w-64 h-1.5 bg-slate-900 border border-white/5 rounded-full overflow-hidden shadow-inner relative">
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 animate-[shimmer_2s_infinite] ease-in-out shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                style={{ width: '100%' }}
              />
            </div>

            <p className="mt-6 text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              {loadingType === 'casino' ? 'Shuffling decks...' : 'Updating live odds...'}
            </p>
          </div>
        </div>
      )}

      {/* TABS CONTAINER */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center transition-all duration-500 ease-in-out pointer-events-none ${
          isHidden ? 'translate-y-[calc(100%-20px)]' : 'translate-y-0'
        }`}
      >
        <button
          onClick={() => setIsHidden(!isHidden)}
          className="relative pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-full shadow-lg hover:bg-slate-800 transition-all mb-3 active:scale-90"
        >
          {isHidden ? (
            <>
              <Menu className="h-4 w-4 text-blue-500" />
              {hasNewWin && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </>
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </button>

        <div
          className={`transition-all duration-300 ${
            isHidden
              ? 'opacity-0 scale-75 pointer-events-none'
              : 'opacity-100 scale-100 pointer-events-auto'
          }`}
        >
          <Tabs
            value={pathname.includes('/casino') ? 'casino' : 'betting'}
            onValueChange={handleTabChange}
          >
            <TabsList className="bg-slate-900/90 backdrop-blur-xl border border-white/5 px-1.5 h-12 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <TabsTrigger
                value="betting"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(37,99,235,0.4)] h-9 px-6 rounded-xl transition-all font-black uppercase italic text-[10px] tracking-wider"
              >
                Betting
              </TabsTrigger>

              <TabsTrigger
                value="casino"
                className="relative data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(37,99,235,0.4)] h-9 px-6 rounded-xl transition-all font-black uppercase italic text-[10px] tracking-wider"
              >
                Casino
                {hasNewWin && (
                  <div className="absolute -top-1.5 -right-1.5">
                    <div className="bg-red-500 text-[8px] text-white px-1.5 py-0.5 rounded-md border-2 border-slate-900 font-bold animate-bounce shadow-lg">
                      NEW
                    </div>
                  </div>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(2deg);
          }
        }
        .direction-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </>
  )
}
