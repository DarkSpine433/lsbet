'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { Menu, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SignInSignUpDialog from '@/components/MainPage/SignInSignUpDialog'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header className="relative z-50 backdrop-blur-lg bg-white/5 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div
            className={`flex items-center space-x-3 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}
          >
            <Logo className="h-10 w-auto" />
          </div>

          <div
            className={`flex items-center space-x-4 transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
          >
            <SignInSignUpDialog>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className=" text-white  border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300 hidden md:inline-flex "
                >
                  Zaloguj się
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className=" text-white  md:border-white/20 md:hover:bg-white/10 hover:border-white/40 transition-all duration-300 md:hidden inline-flex"
                >
                  Zaloguj się
                </Button>
              </div>
            </SignInSignUpDialog>
            <SignInSignUpDialog signUp>
              <Button
                size="sm"
                className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hidden md:inline-flex"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Załóż Konto
              </Button>
            </SignInSignUpDialog>
          </div>
        </div>
      </div>
    </header>
  )
}
