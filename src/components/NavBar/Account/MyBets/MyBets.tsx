import React, { cache } from 'react'
import { getMeUser } from '@/utilities/getMeUser'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import dynamic from 'next/dynamic'
import CircularProgress from '@mui/material/CircularProgress'
import { redirect } from 'next/navigation'
import { Bet, PlacedBet } from '@/payload-types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { History, Wallet } from 'lucide-react'

// Dynamically import the client component with a loading state
const MyBetsPageClient = dynamic(() => import('@/components/NavBar/Account/MyBets/MyBets.client'), {
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
const MyBets = async () => {
  const { user } = await getMeUser()
  const moneySign = '$'
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
    <>
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-200 cursor-pointer">
            <History className="h-5 w-5 text-slate-500" />
            <span className="text-lg font-medium text-slate-700">Moje Zakłady</span>
          </div>
        </DialogTrigger>
        <DialogContent className="h-5/6 max-w-screen-xl overflow-y-auto w-full sm:w-11/12 px-0  m-0 sm:px-3 ">
          <DialogHeader className="max-w-screen-lg mx-auto w-full">
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-slate-800  ">
              Moje Zakłady
            </DialogTitle>
          </DialogHeader>
          <MyBetsPageClient
            nickname={user.email.split('@')[0]}
            money={user.money || 0}
            initialBets={placedBets}
            resultOfEventBeted={resultOfEventBeted}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MyBets
