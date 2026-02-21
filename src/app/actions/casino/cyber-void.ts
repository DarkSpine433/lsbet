'use server'

import { updateUserBalances, validateGameSession } from '@/app/actions/casino/casino-validator'
import { GAME_SLUG, OUTCOME_WEIGHTS, SYMBOLS } from '@/utilities/casino/cyber-void/server/config'
import { generateGrid } from '@/utilities/casino/cyber-void/server/utils'
import { revalidatePath } from 'next/cache'
import { GamblingEngine } from '@/app/actions/casino/gambling-engine'

export async function playCyberVoidAction(stake: number) {
  // 1. Walidacja i Profilowanie Ryzyka
  const { payload, user, riskProfile } = await validateGameSession(GAME_SLUG, stake)

  let currentMoney = Number(user.money)
  let currentCoupons = Number(user.cuponsMoney)

  // 2. Decyzja silnika o scenariuszu wygranej
  const scenario = GamblingEngine.determineScenario(riskProfile, {
    JACKPOT: OUTCOME_WEIGHTS.JACKPOT / 10000,
    BIG_WIN: OUTCOME_WEIGHTS.BIG_WIN / 10000,
    MEDIUM_WIN: OUTCOME_WEIGHTS.SMALL_WIN / 12000, // Small Win mapuje się na Medium/Small
  })

  let multiplier = 0
  switch (scenario) {
    case 'JACKPOT':
      multiplier = SYMBOLS.JACKPOT.multiplier
      break
    case 'BIG_WIN':
      multiplier = SYMBOLS.LEGENDARY.multiplier
      break
    case 'MEDIUM_WIN':
    case 'SMALL_WIN':
      multiplier = SYMBOLS.RARE.multiplier
      break
    case 'CHURN_WIN':
      multiplier = 1
      break
    case 'TEASE':
      multiplier = 0
      break
    default:
      multiplier = 0
  }

  const outcome = scenario === 'TEASE' ? 'TEASE' : multiplier > 0 ? 'WIN' : 'LOSS'

  // 4. Generowanie Siatki (Visuals)
  // generateGrid musi być zaktualizowane, by obsłużyć 'TEASE'
  const grid = generateGrid(outcome as any, multiplier)
  const winAmount = stake * multiplier

  const balanceResult = await updateUserBalances(
    payload,
    user.id,
    {
      money: currentMoney,
      cuponsMoney: currentCoupons,
    },
    stake,
    winAmount,
  )

  if (!balanceResult.success) throw new Error('Błąd operacji finansowej.')

  // 6. Logowanie
  if (winAmount > 0) {
    await payload.create({
      collection: 'casino-wins',
      data: {
        user: user.id,
        gameTitle: 'CYBER VOID',
        betAmount: stake,
        winAmount: winAmount,
        multiplier: multiplier,
      },
    })
  } else {
    // Opcjonalnie: logowanie przegranych do analizy RTP
  }

  revalidatePath('/')

  return {
    grid,
    winAmount,
    multiplier,
    newBalance: balanceResult.newMoney,
    isWin: winAmount > 0,
  }
}
