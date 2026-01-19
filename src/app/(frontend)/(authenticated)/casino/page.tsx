import React, { cache } from 'react'
import { getMeUser } from '@/utilities/getMeUser'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import dynamic from 'next/dynamic'
import CircularProgress from '@mui/material/CircularProgress'

const CasinoClient = dynamic(() => import('./page.client'), {
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-[#020617]">
      <CircularProgress className="text-blue-500" />
    </div>
  ),
})

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const Page = async (props: Props) => {
  const { searchParams } = props
  const params = await searchParams
  const categoryTitle = params.category as string

  const { user } = await getMeUser()
  const categories = await getCasinoCategories()

  // Pobieramy gry dla wybranej kategorii lub pierwszej dostępnej
  const initialGames = await getCasinoGames(categoryTitle || (categories[0]?.title as string))

  return (
    <CasinoClient
      nickname={user.email.split('@')[0]}
      user={user}
      money={(user.money || 0) + (user.cuponsMoney || 0)}
    />
  )
}

const getCasinoCategories = cache(async () => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'casino-categories',
    sort: 'title',
  })
  return result.docs || []
})

const getCasinoGames = cache(async (categoryTitle: string) => {
  const payload = await getPayload({ config: configPromise })
  if (!categoryTitle) return []

  const result = await payload.find({
    collection: 'casino-games',
    where: {
      'category.title': {
        equals: categoryTitle,
      },
    },
  })
  return result.docs || []
})

export default Page
