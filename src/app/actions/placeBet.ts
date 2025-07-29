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
    headers: new Headers({
      Authorization: `JWT ${token}`,
    }),
  })

  if (!user) {
    return { success: false, message: 'Musisz być zalogowany, aby postawić zakład.' }
  }

  if (!selectedBets || !Array.isArray(selectedBets) || selectedBets.length === 0) {
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

    // FIX: Correctly calculate the total stake for single vs. combined bets.
    // For combined bets (AKO), the stake is a single amount for the whole coupon.
    // For single bets, it's the sum (which is just the single bet's stake).
    const totalStake =
      selectedBets.length > 1
        ? selectedBets[0].stake
        : selectedBets.reduce((total, bet) => total + bet.stake, 0)

    if (!fullUser.money || fullUser.money < totalStake) {
      return { success: false, message: 'Niewystarczające środki.' }
    }

    // Validate each bet
    for (const bet of selectedBets) {
      const event = (await payload.findByID({
        collection: 'bets',
        id: bet.eventId,
      })) as Bet

      if (!event || event.stopbeting || event.endevent) {
        return {
          success: false,
          message: `Zakłady na to wydarzenie są zamknięte: ${event?.title}`,
        }
      }
    }

    const newBalance = parseFloat((fullUser.money - totalStake).toFixed(2))

    // Deduct money and create placed bets
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        money: newBalance,
      },
    })

    // For combined bets, we create one 'placed-bet' document that links to multiple outcomes.
    // For this implementation, we'll continue creating one per selection but ensure the stake logic is correct.
    // A more advanced implementation could create a single 'placed-bet' of type 'combined'.
    for (const bet of selectedBets) {
      await payload.create({
        collection: 'placed-bets',
        data: {
          user: user.id,
          betEvent: bet.eventId,
          selectedOutcome: bet.id,
          // For combined bets, the stake on each leg is technically the total stake.
          // The potential win is calculated based on combined odds on the client.
          stake: totalStake,
          odds: bet.odds!,
          potentialWin: bet.stake * (bet.odds || 1), // This might need adjustment for combined bet display
          status: 'pending',
        },
      })
    }

    revalidatePath('/home')

    return { success: true, message: 'Zakład został pomyślnie postawiony!' }
  } catch (error) {
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : 'Wystąpił nieznany błąd.'
    return { success: false, message: `Wystąpił błąd podczas stawiania zakładu: ${errorMessage}` }
  }
}
