'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'

export async function playCasinoAction(gameId: string, betAmount: number) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await getMeUser()

  if (!user || user.money == null || user.money < betAmount) {
    return { success: false, message: 'Niewystarczające środki!' }
  }

  // Pobierz grę z bazy
  const game = await payload.findByID({
    collection: 'casino-games',
    id: gameId,
  })

  try {
    // Przygotowanie "sandboxa" dla logiki serwerowej z bazy
    // serverLogic musi zwracać obiekt wynikowy
    const runServerLogic = new Function(
      'betAmount',
      'userBalance',
      `
      ${game.serverLogic}
      return handlePlay(betAmount, userBalance);
    `,
    )

    const result = await runServerLogic(betAmount, user.money)

    if (result.error) return { success: false, message: result.error }

    // Aktualizacja salda użytkownika w bazie danych Payload
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        money: result.newBalance,
      },
    })

    return { success: true, ...result }
  } catch (error) {
    console.error('Casino Logic Error:', error)
    return { success: false, message: 'Błąd wewnętrzny gry.' }
  }
}
