'use client'
import Link from 'next/link'
import React, { useState } from 'react'
import { Button } from './button'
import CircularProgress from '@mui/material/CircularProgress'
import { LogOut } from 'lucide-react'

type Props = {}

const LogoutButton = (props: Props) => {
  const [logoutClicked, setLogoutClicked] = useState(false)
  return (
    <Link href={'/logout'}>
      <Button variant="default" size="sm" onClick={() => setLogoutClicked(true)}>
        {logoutClicked ? (
          <CircularProgress size={16} className="[&>*]:text-slate-50" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
      </Button>
    </Link>
  )
}

export default LogoutButton
