'use server'
import { validateGameSession } from '@/app/actions/casino/casino-validator'

export async function playSimplyNumbersAction(bet: number, gameSlug: string, multiplier: number) {
  // Walidacja sesji (zwraca payload i user)
  const { payload, user } = await validateGameSession(gameSlug, bet)

  if (multiplier < 1.1 || multiplier > 100) throw new Error('Nieprawidłowy mnożnik')

  // --- LOGIKA DRASTYCZNEJ REDUKCJI SZANS ---

  /**
   * Cel: Przy x1.1 szansa ma wynosić 40% (0.4).
   * Formuła: szansa = (P / mnożnik)
   * Obliczenie stałej P: 0.4 = P / 1.1 => P = 0.44
   */
  const baseProbabilityFactor = 0.44
  let chance = baseProbabilityFactor / multiplier

  // MECHANIZM 1: Dodatkowa kara dla wyższych mnożników (Exponential Decay)
  // Jeśli gracz celuje powyżej x2.0, szansa spada jeszcze mocniej
  if (multiplier > 2.0) {
    chance = chance * 0.75 // Dodatkowe 25% kary
  }

  // Jeśli gracz celuje powyżej x5.0, szansa jest niemal zerowa
  if (multiplier > 5.0) {
    chance = chance * 0.5 // Kolejne 50% kary
  }

  // --- LOSOWANIE ---
  const roll = Math.random()
  let isWin = roll < chance

  // MECHANIZM 2: Hard Rigging (Wymuszona Przegrana)
  // Nawet jeśli losowanie było pomyślne, rzucamy drugą kością "śmierci" (20% szans na ucięcie wygranej)
  // Działa tak samo dla każdego, w tym dla admina.
  if (isWin) {
    const riggingRoll = Math.random()
    if (riggingRoll < 0.2) {
      isWin = false
    }
  }

  const winAmount = isWin ? Math.floor(bet * multiplier) : 0

  // --- FINANSOWANIE (ADMIN PŁACI TAK SAMO) ---
  const currentMoney = user.money || 0
  const newBalance = currentMoney - bet + winAmount

  const updatedUser = await payload.update({
    collection: 'users',
    id: user.id,
    data: { money: newBalance },
  })

  // Rejestracja wygranej w bazie
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
    winAmount,
    newBalance: updatedUser.money,
    error: null,
    success: true,
  }
}
