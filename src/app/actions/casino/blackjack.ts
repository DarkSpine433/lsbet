'use server'

import { createDeck, calculateScore, Card } from '@/utilities/casino/blackjack/engine' //
import { validateGameSession, updateUserBalances } from './casino-validator' //
import { GamblingEngine } from './gambling-engine'

export async function startBlackjack(stake: number) {
  try {
    // 1. Walidacja sesji i balansu + Profil Ryzyka
    const { payload, user, riskProfile } = await validateGameSession('blackjack', stake)
    // 2. Analiza Ryzyka i Decyzja Silnika (Adaptive Difficulty)
    const deck = createDeck(1)
    // Decyzja czy ta gra powinna być wygrana (dla BJ x2.5)
    const isWinDecided = GamblingEngine.calculateChance(2.5, riskProfile)

    let pHand: Card[] = [deck.pop()!, deck.pop()!]
    let dHand: Card[] = [deck.pop()!, { ...deck.pop()!, isFlipped: false }]

    let pScore = calculateScore(pHand)

    // Rigging: Jeśli silnik chce wygranej (Blackjack), wymuszamy go rzadko
    if (isWinDecided && pScore !== 21 && Math.random() < 0.2) {
      pHand = [
        { suit: 'hearts', rank: 'A', value: 11, isFlipped: true },
        { suit: 'spades', rank: '10', value: 10, isFlipped: true },
      ]
      pScore = 21
    }

    const isBlackjack = pScore === 21
    let winAmount = isBlackjack ? Math.floor(stake * 2.5) : 0

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
      stake,
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function hitAction(pHand: Card[], dHand: Card[], stake: number) {
  try {
    const { payload, user, riskProfile } = await validateGameSession('blackjack', 0)
    const deck = createDeck(1)

    const newCard = deck.pop()!
    const updatedPHand = [...pHand, newCard]
    const pScore = calculateScore(updatedPHand)

    let isBust = pScore > 21
    let finalUpdate = null

    if (isBust) {
      // Przegrana przez bust
      finalUpdate = await updateUserBalances(
        payload,
        user.id,
        { money: user.money, cuponsMoney: user.cuponsMoney },
        0,
        0,
      )
    }

    return {
      success: true,
      card: newCard,
      playerHand: updatedPHand,
      isBust,
      newBalance: finalUpdate?.newMoney,
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function standAction(pHand: Card[], dHand: Card[], stake: number) {
  try {
    const { payload, user, riskProfile } = await validateGameSession('blackjack', 0)
    const deck = createDeck(1)

    let currentDealerHand = [...dHand]
    currentDealerHand[1].isFlipped = true // Odkrywamy kartę

    let dScore = calculateScore(currentDealerHand)
    const pScore = calculateScore(pHand)

    // Czy silnik pozwala na wygraną (x2.0)?
    const isWinAllowed = GamblingEngine.calculateChance(2.0, riskProfile)

    // Karuzela dealera: jeśli pScore jest mocny (np. 18-20), a silnik nie pozwala wygrać,
    // Dealer musi "fuksowo" dobić do lepszego wyniku lub pusha.
    while (dScore < 17 || (pScore <= 21 && dScore < pScore && !isWinAllowed)) {
      currentDealerHand.push(deck.pop()!)
      dScore = calculateScore(currentDealerHand)
      if (dScore > 21) break
    }

    let winAmount = 0
    if (pScore <= 21 && (dScore > 21 || pScore > dScore)) {
      winAmount = Math.floor(stake * 2) // Wygrana
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
      isTease: winAmount === 0 && pScore >= 18, // Tease jeśli gracz miał 18+ a przegrał
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
