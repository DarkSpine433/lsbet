'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'

const SYMBOLS = ['🔔', '🍒', '🍋', '🍇', '🍉', '7️⃣']
const PAYOUTS: Record<string, number> = {
  '7️⃣': 50, // x50 za trzy siódemki
  '🔔': 20, // x20 za trzy dzwonki
  '🍉': 10,
  '🍇': 5,
  '🍋': 3,
  '🍒': 2,
}

export async function playJackpotBells(stake: number) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await getMeUser()
  if (!user || typeof user.money !== 'number') {
    throw new Error('Brak zalogowania lub błąd konta (brak pola money)')
  }

  if (!user || user.money < stake) {
    throw new Error('Niewystarczające środki lub brak zalogowania')
  }

  // Losowanie trzech bębnów
  const reel1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
  const reel2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
  const reel3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]

  const reels = [reel1, reel2, reel3]
  let winAmount = 0
  const isWin = reel1 === reel2 && reel2 === reel3

  if (isWin) {
    winAmount = stake * (PAYOUTS[reel1] || 2)
  }

  const newBalance = user.money - stake + winAmount

  // Aktualizacja balansu w bazie danych
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { money: newBalance },
  })

  // Jeśli wygrana jest duża, zapisz w casino-wins
  if (winAmount > 0) {
    await payload.create({
      collection: 'casino-wins',
      data: {
        multiplier: winAmount / stake,
        betAmount: stake,
        user: user.id,
        gameTitle: 'Jackpot Bells',
        winAmount: winAmount,
      },
    })
  }

  return { reels, winAmount, newBalance, isWin }
}
