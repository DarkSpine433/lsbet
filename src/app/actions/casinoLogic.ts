'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import { revalidatePath } from 'next/cache'

export async function runCasinoGame(bet: number, gameSlug: string, multiplier: number) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await getMeUser()

  if (!user) throw new Error('Nieautoryzowany dostęp')

  // ZABEZPIECZENIE: Max mnożnik 10
  if (bet <= 0 || isNaN(bet)) throw new Error('Nieprawidłowa stawka')
  if (multiplier < 1.1 || multiplier > 10) throw new Error('Mnożnik musi być między 1.1 a 10')

  const freshUser = await payload.findByID({
    collection: 'users',
    id: user.id,
  })

  if (!freshUser || freshUser.money == null || freshUser.money < bet) {
    return { error: 'Niewystarczające środki!' }
  }

  // Szansa: 5% przy mnożniku 2x (actualEdge = 0.90)
  const actualEdge = 0.85
  const chance = (1 / multiplier) * (1 - actualEdge)

  // Logowanie szansy tylko dla Ciebie w konsoli serwera
  console.log(
    `[lsCasino] Gra: ${gameSlug} | Stawka: ${bet} | Multi: ${multiplier}x | SZANSA: ${(chance * 100).toFixed(4)}%`,
  )

  const roll = Math.random()
  const isWin = roll < chance

  const winAmount = isWin ? Math.floor(bet * multiplier) : 0
  const netChange = winAmount - bet

  const updatedUser = await payload.update({
    collection: 'users',
    id: user.id,
    data: { money: freshUser.money + netChange },
  })
  console.log(
    `[lsCasino] Użytkownik ${user.email} ${isWin ? 'WYGRAŁ' : 'PRZEGRAŁ'} ${isWin ? winAmount : bet} PLN`,
  )
  if (isWin) {
    await payload.create({
      collection: 'casino-wins',
      data: {
        user: user.id,
        gameTitle: gameSlug.replace('-', ' ').toUpperCase(),
        betAmount: bet,
        winAmount: winAmount,
        multiplier: multiplier,
      },
    })
  }

  return {
    win: isWin,
    winAmount: winAmount,
    newBalance: updatedUser.money,
    possibleWin: (bet * multiplier).toFixed(2),
  }
}
