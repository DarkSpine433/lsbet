import React from 'react'

import type { Footer } from '@/payload-types'

import { Globe } from 'lucide-react'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  return (
    <footer className="relative pt-8 pb-32 xl:py-8 border-t border-primary">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Logo />
        </div>
        <p className="text-sm text-white/40">
          © {new Date().getFullYear()} LSBet. Wszelkie prawa zastrzeżone.
        </p>
        <p className="text-xs mt-2 text-white/30">
          {`Strona zrobiona na potrzeby gry RolePlay (VibeRP)`}
        </p>
      </div>
    </footer>
  )
}
