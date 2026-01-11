'use server'
import { validateGameSession } from '@/app/actions/casino/casino-validator'

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🍉', '7️⃣', '🔔']

const BASE_WEIGHTS: Record<string, number> = {
  '🍒': 40,
  '🍋': 30,
  '🍊': 20,
  '🍇': 15,
  '🍉': 10,
  '7️⃣': 5,
  '🔔': 3,
}

const PAYOUT_TABLE: Record<string, { [key: number]: number }> = {
  '7️⃣': { 3: 100, 4: 500, 5: 2500 },
  '🍉': { 3: 50, 4: 200, 5: 500 },
  '🍇': { 3: 40, 4: 90, 5: 200 },
  '🍊': { 2: 20, 3: 40, 4: 100 },
  '🍋': { 3: 10, 4: 20, 5: 80 },
  '🍒': { 2: 4, 3: 10, 4: 20, 5: 60 },
}

const PAYLINES = [
  [5, 6, 7, 8, 9],
  [0, 1, 2, 3, 4],
  [10, 11, 12, 13, 14],
  [0, 6, 12, 8, 4],
  [10, 6, 0, 8, 14],
]

function getRandomSymbol(weights: Record<string, number>) {
  const pool = Object.entries(weights).flatMap(([symbol, weight]) =>
    Array(Math.max(1, Math.floor(weight))).fill(symbol),
  )
  return pool[Math.floor(Math.random() * pool.length)]
}

export async function playJackpotBellsAction(stake: number) {
  const { payload, user } = await validateGameSession('jackpot-bells', stake)

  const grid = new Array(15).fill(null)
  const penaltyFactor = 0.4 // Jeszcze surowsza kara (redukcja o 60%)

  let previousColumnSymbols: string[] = []

  for (let col = 0; col < 5; col++) {
    const currentColumnWeights = { ...BASE_WEIGHTS }

    if (previousColumnSymbols.length > 0) {
      previousColumnSymbols.forEach((sym) => {
        currentColumnWeights[sym] = currentColumnWeights[sym] * penaltyFactor
      })
    }

    const colSymbols: string[] = []
    for (let row = 0; row < 3; row++) {
      const symbol = getRandomSymbol(currentColumnWeights)
      const index = col + row * 5
      grid[index] = symbol
      colSymbols.push(symbol)
    }
    previousColumnSymbols = colSymbols
  }

  let totalWin = 0
  let allWinningIndices: number[] = []
  const stakePerLine = stake / PAYLINES.length

  PAYLINES.forEach((line) => {
    const symbolsOnLine = line.map((idx) => grid[idx])

    // Jackpot (5 Dzwonków)
    if (symbolsOnLine.every((s) => s === '🔔')) {
      totalWin += stake * 1000
      allWinningIndices.push(...line)
      return
    }

    let firstSym = symbolsOnLine.find((s) => s !== '🔔') || '🔔'
    let matches = 0
    for (const sym of symbolsOnLine) {
      if (sym === firstSym || sym === '🔔') matches++
      else break
    }

    const multiplier = PAYOUT_TABLE[firstSym]?.[matches] || 0
    if (multiplier > 0) {
      totalWin += stakePerLine * multiplier
      allWinningIndices.push(...line.slice(0, matches))
    }
  })

  const currentMoney = user.money as number
  const newBalance = currentMoney - stake + totalWin

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { money: newBalance },
  })

  if (totalWin > 0) {
    await payload.create({
      collection: 'casino-wins',
      data: {
        user: user.id,
        gameTitle: 'JACKPOT BELLS',
        betAmount: stake,
        winAmount: totalWin,
        multiplier: totalWin / stake,
      },
    })
  }

  return {
    grid,
    winAmount: totalWin,
    newBalance,
    winningIndices: Array.from(new Set(allWinningIndices)),
  }
}
