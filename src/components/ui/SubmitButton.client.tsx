'use client'
import { Button } from '@/components/ui/button'
import { useFormStatus } from 'react-dom'
import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'
const SubmitButtonClient = ({
  text,
  isSuccess,
  className,
  loadingSize = 24,
  children,
}: {
  text?: string
  isSuccess: boolean
  className?: string
  loadingSize?: number
  children?: React.ReactNode
}) => {
  const status = useFormStatus()
  return (
    <Button type="submit" className={`${className ?? ' w-full h-11 mt-6'}`} disabled={isSuccess}>
      {status.pending ? (
        <CircularProgress size={loadingSize} className="[&>*]:text-slate-50 mr-2" />
      ) : (
        <>
          {children} {text ?? ''}
        </>
      )}
    </Button>
  )
}

export default SubmitButtonClient
