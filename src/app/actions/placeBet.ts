'use server'

import { Bet, User } from '@/payload-types'
import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import config from '../../payload.config'

type SelectedBet = {
  id: string
  eventId: string
  name: string
  stake: number
  odds?: number | null
}

export const placeBetAction = async (
  selectedBets: SelectedBet[],
): Promise<{ success: boolean; message: string }> => {
  const payload = await getPayload({ config })
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  const { user } = await payload.auth({
    headers: new Headers({ Authorization: `JWT ${token}` }),
  })

  if (!user) {
    return { success: false, message: 'Musisz być zalogowany, aby postawić zakład.' }
  }

  if (!selectedBets || selectedBets.length === 0) {
    return { success: false, message: 'Nie wybrano żadnych zakładów.' }
  }

  try {
    const fullUser = (await payload.findByID({
      collection: 'users',
      id: user.id,
    })) as User

    if (!fullUser) {
      return { success: false, message: 'Nie znaleziono użytkownika.' }
    }

    const isCombinedBet = selectedBets.length > 1
    const totalStake = isCombinedBet ? selectedBets[0].stake : selectedBets[0].stake

    if (!fullUser.money || fullUser.money < totalStake) {
      return { success: false, message: 'Niewystarczające środki.' }
    }

    // Validate each event in the coupon
    for (const bet of selectedBets) {
      const event = (await payload.findByID({
        collection: 'bets',
        id: bet.eventId,
      })) as Bet
      if (!event || event.stopbeting || event.endevent) {
        return {
          success: false,
          message: `Zakłady na wydarzenie "${event?.title}" są zamknięte.`,
        }
      }
    }

    const newBalance = parseFloat((fullUser.money - totalStake).toFixed(2))

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { money: newBalance },
    })

    // --- NEW LOGIC FOR CREATING BETS ---

    if (isCombinedBet) {
      // Create ONE entry for the combined bet
      const combinedOdds = selectedBets.reduce((total, bet) => total * (bet.odds || 1), 1)
      const potentialWin = parseFloat((totalStake * combinedOdds).toFixed(2))

      await payload.create({
        collection: 'placed-bets',
        data: {
          user: user.id,
          betType: 'combined',
          stake: totalStake,
          totalOdds: combinedOdds,
          potentialWin: potentialWin,
          status: 'pending',
          selections: selectedBets.map((bet) => ({
            betEvent: bet.eventId,
            selectedOutcomeName: bet.name,
            odds: bet.odds!,
          })),
        },
      })
    } else {
      // Create ONE entry for the single bet
      const singleBet = selectedBets[0]
      const potentialWin = parseFloat((singleBet.stake * (singleBet.odds || 1)).toFixed(2))

      await payload.create({
        collection: 'placed-bets',
        data: {
          user: user.id,
          betType: 'single',
          stake: singleBet.stake,
          totalOdds: singleBet.odds!,
          potentialWin: potentialWin,
          status: 'pending',
          selections: [
            {
              betEvent: singleBet.eventId,
              selectedOutcomeName: singleBet.name,
              odds: singleBet.odds!,
            },
          ],
        },
      })
    }

    revalidatePath('/home')
    revalidatePath('/my-bets') // Also revalidate the "My Bets" page

    return { success: true, message: 'Zakład został pomyślnie postawiony!' }
  } catch (error) {
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : 'Wystąpił nieznany błąd.'
    return { success: false, message: `Wystąpił błąd podczas stawiania zakładu: ${errorMessage}` }
  }
}
