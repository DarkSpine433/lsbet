'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { Bet, PlacedBet } from '@/payload-types'

export async function getMyBetsAction() {
  const { user } = await getMeUser()
  if (!user) return { error: 'Unauthorized' }

  const payload = await getPayload({ config: configPromise })

  // 1. Pobierz postawione zakłady
  const placedBetsRes = await payload.find({
    collection: 'placed-bets',
    where: { user: { equals: user.id } },
    depth: 3,
  })

  const placedBets = placedBetsRes.docs

  // 2. Wyciągnij ID wszystkich wydarzeń, aby pobrać ich wyniki
  const betsIds: string[] = []
  placedBets.forEach((bet) => {
    bet.selections?.forEach((selection) => {
      const eventId = (selection.betEvent as Bet)?.id
      if (eventId && !betsIds.includes(eventId)) {
        betsIds.push(eventId)
      }
    })
  })

  // 3. Pobierz wyniki tych wydarzeń
  const resultsRes = await payload.find({
    collection: 'bets',
    where: { id: { in: betsIds } },
    depth: 0,
  })

  return {
    placedBets,
    results: resultsRes.docs,
    user: {
      nickname: user.email.split('@')[0],
      money: user.money || 0,
    },
  }
}
