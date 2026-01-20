'use server'

import { createDeck, calculateScore, Card } from '@/utilities/casino/blackjack/engine' //
import { validateGameSession, updateUserBalances } from './casino-validator' //

export async function startBlackjack(stake: number) {
  try {
    // 1. Walidacja sesji i balansu
    const { payload, user } = await validateGameSession('blackjack', stake)

    // 2. Logika rozdania z engine.ts
    const deck = createDeck(1)
    const pHand: Card[] = [deck.pop()!, deck.pop()!]
    const dHand: Card[] = [deck.pop()!, { ...deck.pop()!, isFlipped: false }] // Druga karta zakryta

    const pScore = calculateScore(pHand)
    const isBlackjack = pScore === 21

    // 3. Jeśli Blackjack, od razu wypłacamy
    let winAmount = 0
    if (isBlackjack) winAmount = stake * 2.5

    const balanceUpdate = await updateUserBalances(
      payload,
      user.id,
      { money: user.money, cuponsMoney: user.cuponsMoney },
      stake,
      winAmount,
    )

    return {
      success: true,
      playerHand: pHand,
      dealerHand: dHand,
      isBlackjack,
      newBalance: balanceUpdate.newMoney,
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function standAction(pHand: Card[], dHand: Card[], stake: number) {
  try {
    const { payload, user } = await validateGameSession('blackjack', 0)
    const deck = createDeck(1)

    let currentDealerHand = [...dHand]
    currentDealerHand[1].isFlipped = true // Odkrywamy kartę

    let dScore = calculateScore(currentDealerHand)

    // Dealer dobiera do 17
    while (dScore < 17) {
      currentDealerHand.push(deck.pop()!)
      dScore = calculateScore(currentDealerHand)
    }

    const pScore = calculateScore(pHand)
    let winAmount = 0

    if (pScore <= 21 && (dScore > 21 || pScore > dScore)) {
      winAmount = stake * 2 // Wygrana
    } else if (pScore === dScore) {
      winAmount = stake // Zwrot (Push)
    }

    const update = await updateUserBalances(
      payload,
      user.id,
      { money: user.money, cuponsMoney: user.cuponsMoney },
      0,
      winAmount,
    )

    return {
      success: true,
      dealerHand: currentDealerHand,
      winAmount,
      newBalance: update.newMoney,
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
