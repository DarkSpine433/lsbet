'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { Sparkles, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SignInSignUpDialog from '@/components/MainPage/SignInSignUpDialog'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname, setHeaderTheme])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/60 bg-[#020617]/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo Area */}
          <div
            className={`flex cursor-pointer items-center space-x-3 transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}
          >
            <Logo className="h-8 md:h-9 w-auto" />
            <div className="hidden lg:block h-6 w-[1px] bg-slate-800 mx-2" />
            <span className="hidden lg:block text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Pro Betting
            </span>
          </div>

          {/* Actions Area */}
          <div
            className={`flex items-center space-x-3 md:space-x-4 transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
          >
            {/* Login Button */}
            <SignInSignUpDialog>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-300 font-medium"
              >
                <LogIn className="h-4 w-4 mr-2 md:hidden" />
                <span className="hidden md:inline">Zaloguj się</span>
                <span className="md:hidden">Logowanie</span>
              </Button>
            </SignInSignUpDialog>

            {/* Register CTA */}
            <SignInSignUpDialog signUp>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 rounded-xl shadow-lg shadow-blue-600/20 transform hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Sparkles className="h-4 w-4 mr-2 text-blue-200" />
                <span>Załóż Konto</span>
              </Button>
            </SignInSignUpDialog>
          </div>
        </div>
      </div>
    </header>
  )
}
