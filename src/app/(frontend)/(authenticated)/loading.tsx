import CircularProgress from '@mui/material/CircularProgress'
import React from 'react'

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <CircularProgress />
    </div>
  )
}
