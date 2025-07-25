import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { Footer } from '@/Footer/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'
import { Analytics } from '@vercel/analytics/next'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config })
  const headers = await nextHeaders()
  const { user } = await payload.auth({ headers })

  if (user?.banned) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Account Banned</title>
        </head>
        <body className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Your account has been banned</h1>
            <p className="mt-4">Please contact support for more information.</p>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link
          href="https://ut91p27j9t.ufs.sh/f/CI2WZ5YUTq1beVeh3Fwfw9glnXS4C6WAJcNBbrvIad7PD2yU"
          rel="icon"
          sizes="32x32"
        />
        <link
          href="https://ut91p27j9t.ufs.sh/f/CI2WZ5YUTq1beVeh3Fwfw9glnXS4C6WAJcNBbrvIad7PD2yU"
          rel="icon"
          type="image/jpeg"
        />
      </head>
      <body>
        <Analytics />
        <Providers>
          <Toaster richColors position="top-center" />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
}
