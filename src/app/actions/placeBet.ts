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

    const totalStake = selectedBets.reduce((total, bet) => total + bet.stake, 0)

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

    // Deduct money and create placed bets
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        money: fullUser.money - totalStake,
      },
    })

    for (const bet of selectedBets) {
      await payload.create({
        collection: 'placed-bets',
        data: {
          user: user.id,
          betEvent: bet.eventId,
          selectedOutcome: bet.id,
          stake: bet.stake,
          odds: bet.odds!,
          potentialWin: bet.stake * (bet.odds || 1),
          status: 'pending',
        },
      })
    }

    // Revalidate the path to update the UI with the new balance
    revalidatePath('/home')

    return { success: true, message: 'Zakład został pomyślnie postawiony!' }
  } catch (error) {
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : 'Wystąpił nieznany błąd.'
    return { success: false, message: `Wystąpił błąd podczas stawiania zakładu: ${errorMessage}` }
  }
}
