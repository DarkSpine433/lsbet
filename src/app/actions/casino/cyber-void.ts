'use server'

import { updateUserBalances, validateGameSession } from '@/app/actions/casino/casino-validator' // Twoja ścieżka
import { GAME_SLUG, OUTCOME_WEIGHTS, SYMBOLS } from '@/utilities/casino/cyber-void/server/config'
import { generateGrid } from '@/utilities/casino/cyber-void/server/utils'
import { revalidatePath } from 'next/cache'

export async function playCyberVoidAction(stake: number) {
  // 1. Walidacja i Profilowanie Ryzyka
  const { payload, user, riskProfile } = await validateGameSession(GAME_SLUG, stake)

  // 2. Logika Finansowa - Czy stać gracza? (Bonus First logic)
  let currentMoney = Number(user.money)
  let currentCoupons = Number(user.cuponsMoney)

  const roll = Math.random() * 10000
  let outcome: 'WIN' | 'LOSS' = 'LOSS'
  let multiplier = 0

  // Win Limiter z validatora (np. 0.1 dla graczy wygrywających)
  const difficultyMod = riskProfile.winLimiter

  // Progi są dynamicznie skalowane w dół, jeśli gracz wygrywa za dużo
  if (roll < OUTCOME_WEIGHTS.JACKPOT * difficultyMod) {
    outcome = 'WIN'
    multiplier = SYMBOLS.JACKPOT.multiplier
  } else if (roll < (OUTCOME_WEIGHTS.JACKPOT + OUTCOME_WEIGHTS.BIG_WIN) * difficultyMod) {
    outcome = 'WIN'
    multiplier = SYMBOLS.LEGENDARY.multiplier
  } else if (
    roll <
    (OUTCOME_WEIGHTS.JACKPOT + OUTCOME_WEIGHTS.BIG_WIN + OUTCOME_WEIGHTS.SMALL_WIN) * difficultyMod
  ) {
    outcome = 'WIN'
    multiplier = SYMBOLS.RARE.multiplier // lub UNCOMMON losowo
  } else if (
    roll <
    OUTCOME_WEIGHTS.JACKPOT +
      OUTCOME_WEIGHTS.BIG_WIN +
      OUTCOME_WEIGHTS.SMALL_WIN +
      OUTCOME_WEIGHTS.MONEY_BACK
  ) {
    // Money Back nie jest limitowane tak mocno (churn retention)
    outcome = 'WIN'
    multiplier = 1
  } else {
    outcome = 'LOSS'
    multiplier = 0
  }

  // 4. Generowanie Siatki (Visuals)
  const grid = generateGrid(outcome, multiplier)
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
