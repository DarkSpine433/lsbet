'use server'
import { validateGameSession } from './casino-validator'

const PAYOUTS: Record<string, number> = {
  '7️⃣': 50,
  '🔔': 20,
  '🍉': 10,
  '🍇': 5,
  '🍋': 3,
  '🍒': 2,
}

const ALL_SYMBOLS = ['🍒', '🍋', '🍇', '🍉', '🔔', '7️⃣']

export async function playSimple20Action(stake: number) {
  const { payload, user } = await validateGameSession('simple-20', stake)
  const currentMoney = user.money as number

  // --- LOGIKA ANTY-RECIDIVIST (Sprawdzanie poprzednich wygranych) ---
  // Szukamy wygranych użytkownika z ostatnich 5 minut
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const recentWins = await payload.find({
    collection: 'casino-wins',
    where: {
      and: [{ user: { equals: user.id } }, { createdAt: { greater_than: fiveMinutesAgo } }],
    },
    limit: 1,
  })

  const hasRecentlyWon = recentWins.totalDocs > 0

  // --- NOWE SZANSE (Bazowe -5% wzglęem poprzednich) ---
  // Wiśnie: 15% (było 20)
  // Cytryny: 5% (było 10)
  // Winogrona: 0% (było 5 - technicznie wpadają teraz w rzadką grupę)

  let cherryChance = 15
  let lemonChance = 5
  let grapeChance = 2
  let jackpotGroupChance = 0.5

  // Jeśli użytkownik wygrał niedawno, tniemy szanse o połowę (Penalty Mode)
  if (hasRecentlyWon) {
    cherryChance *= 0.5
    lemonChance *= 0.5
    grapeChance *= 0.1
    jackpotGroupChance = 0.01
  }

  let reels = ['', '', '']
  let winAmount = 0
  let isWin = false
  let wonSymbol = ''

  const randomRoll = Math.random() * 100

  // --- KALKULACJA WYGRANEJ ---
  if (randomRoll <= cherryChance) {
    isWin = true
    wonSymbol = '🍒'
  } else if (randomRoll <= cherryChance + lemonChance) {
    isWin = true
    wonSymbol = '🍋'
  } else if (randomRoll <= cherryChance + lemonChance + grapeChance) {
    isWin = true
    wonSymbol = '🍇'
  } else if (randomRoll <= cherryChance + lemonChance + grapeChance + jackpotGroupChance) {
    const highSymbols = ['🍉', '🔔', '7️⃣']
    isWin = true
    wonSymbol = highSymbols[Math.floor(Math.random() * highSymbols.length)]
  }

  if (isWin) {
    reels = [wonSymbol, wonSymbol, wonSymbol]
    winAmount = stake * (PAYOUTS[wonSymbol] || 0)
  } else {
    // Generowanie przegranej
    reels[0] = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]
    reels[1] = ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]
    reels[2] = ALL_SYMBOLS.filter((s) => s !== reels[0] || s !== reels[1])[
      Math.floor(Math.random() * (ALL_SYMBOLS.length - 1))
    ]

    // Efekt "blisko" (Teasing) - częściej u osób, które wygrały, by je sprowokować
    const teaseThreshold = hasRecentlyWon ? 0.5 : 0.2
    if (Math.random() < teaseThreshold) {
      reels[1] = reels[0]
      reels[2] = ALL_SYMBOLS.find((s) => s !== reels[0]) || '🍒'
    }

    winAmount = 0
  }

  const newBalance = currentMoney - stake + winAmount

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { money: newBalance },
  })

  if (winAmount > 0) {
    await payload.create({
      collection: 'casino-wins',
      data: {
        multiplier: winAmount / stake,
        betAmount: stake,
        user: user.id,
        gameTitle: 'Simple 20',
        winAmount: winAmount,
      },
    })
  }

  return {
    reels,
    winAmount,
    newBalance,
    isWin: winAmount > 0,
    penaltyMode: hasRecentlyWon, // Informacja dla frontendu (opcjonalnie)
  }
}
