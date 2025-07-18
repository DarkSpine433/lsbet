import type { Metadata } from 'next'

import React from 'react'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  return <main className="pt-16 pb-24">dev</main>
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  return {
    description: 'Payload Website Template',
    openGraph: mergeOpenGraph({
      description: '',
      images: 'https://4rnviijiwq.ufs.sh/f/W6b8gTiNTm1PUQhE6F4aRvVZOpPrGHEIxMkQCejWdhb1t943',
      url: `/`,
    }),
    title: 'Payload Website Template',
  }
}
