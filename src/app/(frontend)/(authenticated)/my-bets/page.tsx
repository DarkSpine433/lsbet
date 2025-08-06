import React, { cache } from 'react'
import { getMeUser } from '@/utilities/getMeUser'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import dynamic from 'next/dynamic'
import CircularProgress from '@mui/material/CircularProgress'
import { redirect } from 'next/navigation'
import { Bet, PlacedBet } from '@/payload-types'

// Dynamically import the client component with a loading state
const MyBetsPageClient = dynamic(() => import('./page.client'), {
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <CircularProgress />
    </div>
  ),
})

const getCashedPlacedBets = cache(async (userId: string): Promise<PlacedBet[]> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'placed-bets',
    where: {
      user: {
        equals: userId,
      },
    },
    depth: 3, // This is correct! It should populate the team data.
  })
  return result.docs || []
})
const getCashedResultOfEventBeted = cache(async (eventId: string[]): Promise<Bet[]> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'bets',
    where: {
      id: {
        in: eventId,
      },
    },
    depth: 0, // This is correct! It should populate the team data.
  })
  return result.docs || []
})
const MyBetsPage = async () => {
  const { user } = await getMeUser()

  // Redirect to login if no user is found
  if (!user) {
    return redirect('/login')
  }

  const placedBets = await getCashedPlacedBets(user.id)
  // FIX: Changed `let` to `const` as `betsIds` is not reassigned.
  const betsIds: string[] = []
  placedBets.forEach((bet) => {
    bet.selections.forEach((selection) => {
      const eventId = (selection.betEvent as Bet)?.id
      if (eventId && !betsIds.includes(eventId)) {
        betsIds.push(eventId)
      }
    })
  })
  const resultOfEventBeted = await getCashedResultOfEventBeted(betsIds)
  return (
    <MyBetsPageClient
      nickname={user.email.split('@')[0]}
      money={user.money || 0}
      initialBets={placedBets}
      resultOfEventBeted={resultOfEventBeted}
    />
  )
}

export default MyBetsPage
