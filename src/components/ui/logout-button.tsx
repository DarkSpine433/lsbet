'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { Button } from './button'
import { LogOut, Loader2 } from 'lucide-react'

type Props = {}

const LogoutButton = (props: Props) => {
  const [logoutClicked, setLogoutClicked] = useState(false)

  return (
    <Link href={'/logout'} className="w-full">
      <Button
        variant="ghost"
        size="lg"
        onClick={() => setLogoutClicked(true)}
        disabled={logoutClicked}
        className="group relative w-full flex items-center justify-center gap-3 bg-slate-950/50 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all duration-300 rounded-xl h-12 overflow-hidden"
      >
        {logoutClicked ? (
          <Loader2 className="h-5 w-5 animate-spin text-red-500" />
        ) : (
          <>
            <span className="text-xs font-black uppercase italic tracking-[0.2em] transition-transform group-hover:translate-x-1">
              Zakończ Sesję
            </span>
            <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-500 transition-colors group-hover:translate-x-1" />
          </>
        )}

        {/* Subtelny gradient przy najechaniu */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </Button>
    </Link>
  )
}

export default LogoutButton
