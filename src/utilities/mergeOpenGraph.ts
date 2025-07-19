import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'LsBet Zarabiaj Pieniądze Z Nami',
  images: [
    {
      url: `https://ut91p27j9t.ufs.sh/f/CI2WZ5YUTq1bdEX04uQDXpVt0zI3oulY6iq2RyfQ8bOh4wP7`,
    },
  ],
  siteName: 'LsBet',
  title: 'Oficialna strona LsBet',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
