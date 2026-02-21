'use server'

import { updateUserBalances, validateGameSession } from '@/app/actions/casino/casino-validator'
import { Payload } from 'payload'

// ==========================================
// 1. KONFIGURACJA MATEMATYCZNA (THE CORE)
// ==========================================

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🍉', '7️⃣', '🔔'] as const
type SymbolType = (typeof SYMBOLS)[number]

const PAYLINES = [
  [5, 6, 7, 8, 9], // Środek
  [0, 1, 2, 3, 4], // Góra
  [10, 11, 12, 13, 14], // Dół
  [0, 6, 12, 8, 4], // V
  [10, 6, 0, 8, 14], // Odwrócone V
]

const PAYOUT_TABLE: Record<string, Record<number, number>> = {
  '7️⃣': { 3: 50, 4: 200, 5: 1000 },
  '🍉': { 3: 20, 4: 80, 5: 200 },
  '🍇': { 3: 15, 4: 40, 5: 100 },
  '🍊': { 3: 10, 4: 25, 5: 60 },
  '🍋': { 3: 5, 4: 15, 5: 40 },
  '🍒': { 2: 2, 3: 5, 4: 10, 5: 20 },
}

import { GamblingEngine } from './gambling-engine'

// ==========================================
// 3. SILNIK DECYZYJNY (OUTCOME GENERATOR)
// ==========================================

export type OutcomeType = 'DEAD_SPIN' | 'CHURN_WIN' | 'SMALL_WIN' | 'BIG_WIN' | 'JACKPOT'

// ==========================================
// 4. FABRYKA SIATEK (GRID CONSTRUCTOR)
// ==========================================

class GridFactory {
  private stake: number

  constructor(stake: number) {
    this.stake = stake
  }

  // Tworzy siatkę, która GWARANTOWANIE przegrywa (0 wygranych linii)
  createLosingGrid(): string[] {
    let grid: string[] = []
    let isValid = false
    let attempts = 0

    while (!isValid && attempts < 100) {
      grid = Array(15)
        .fill(null)
        .map(() => {
          const r = Math.random()
          // Unikamy dzwonków i siódemek w przegranych spinach
          if (r < 0.4) return '🍒'
          if (r < 0.7) return '🍋'
          if (r < 0.9) return '🍊'
          return '🍇'
        })

      if (this.calculateWin(grid) === 0) isValid = true
      attempts++
    }

    // Fallback: szachownica (gdyby RNG zawiodło 100 razy)
    if (!isValid) {
      grid = [
        '🍒',
        '🍋',
        '🍒',
        '🍋',
        '🍒',
        '🍋',
        '🍒',
        '🍋',
        '🍒',
        '🍋',
        '🍒',
        '🍋',
        '🍒',
        '🍋',
        '🍒',
      ]
    }
    return grid
  }

  // Inżynieria odwrotna: Tworzy siatkę pasującą do zadanego mnożnika
  createWinningGrid(targetMultiplier: number): string[] {
    const targetAmount = this.stake * targetMultiplier
    let bestGrid: string[] = this.createLosingGrid()
    let closestDiff = Infinity

    // Brute-force: Próbujemy wstrzyknąć wygraną linię do przegranej siatki
    for (let i = 0; i < 200; i++) {
      const tempGrid = [...this.createLosingGrid()]
      const randomLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)]

      let symbol: SymbolType = '🍒'
      let count = 3

      // Dobór symboli w zależności od pożądanej wygranej
      if (targetMultiplier > 10) {
        symbol = '7️⃣'
        count = 4
      } else if (targetMultiplier > 5) {
        symbol = '🍇'
        count = 4
      } else if (targetMultiplier > 2) {
        symbol = '🍊'
        count = 4
      } else if (targetMultiplier < 0.5) {
        symbol = '🍒'
        count = 2
      } else {
        symbol = '🍋'
        count = 3
      }

      for (let k = 0; k < count; k++) {
        tempGrid[randomLine[k]] = symbol
      }

      const currentWin = this.calculateWin(tempGrid)
      const diff = Math.abs(currentWin - targetAmount)

      if (diff < closestDiff) {
        closestDiff = diff
        bestGrid = tempGrid
      }

      if (diff < targetAmount * 0.1) break
    }
    return bestGrid
  }

  // Tworzy siatkę "Near Miss" - bliska wygrana
  createTeaseGrid(): string[] {
    const grid = this.createLosingGrid()
    const line = PAYLINES[Math.floor(Math.random() * PAYLINES.length)]
    const symbol = Math.random() < 0.3 ? '7️⃣' : '🔔'

    // Wstrzykujemy tylko 2 symbole na linii (potrzeba min. 3)
    grid[line[0]] = symbol
    grid[line[1]] = symbol
    return grid
  }

  calculateWin(grid: string[]): number {
    let totalWin = 0
    const stakePerLine = this.stake / PAYLINES.length

    PAYLINES.forEach((line) => {
      const symbolsOnLine = line.map((idx) => grid[idx])
      const firstSym = symbolsOnLine[0]

      if (symbolsOnLine.every((s) => s === '🔔')) return // Jackpot liczony osobno

      let matches = 1
      for (let i = 1; i < symbolsOnLine.length; i++) {
        if (symbolsOnLine[i] === firstSym) matches++
        else break
      }

      const multiplier = PAYOUT_TABLE[firstSym]?.[matches] || 0
      if (multiplier > 0) {
        totalWin += stakePerLine * multiplier
      }
    })
    return totalWin
  }
}

// ==========================================
// 5. GŁÓWNA AKCJA (MAIN ACTION)
// ==========================================

export async function playJackpotBellsAction(stake: number) {
  // 1. Walidacja sesji
  const { payload, user, riskProfile } = await validateGameSession('jackpot-bells', stake)

  // 2. Decyzja Silnika (Outcome Mapping)
  const scenario = GamblingEngine.determineScenario(riskProfile)

  let outcomeType: OutcomeType = 'DEAD_SPIN'
  let targetMult = 0

  switch (scenario) {
    case 'JACKPOT':
      outcomeType = 'JACKPOT'
      targetMult = 1000
      break
    case 'BIG_WIN':
      outcomeType = 'BIG_WIN'
      targetMult = 10 + Math.random() * 40
      break
    case 'MEDIUM_WIN':
      outcomeType = 'SMALL_WIN'
      targetMult = 3 + Math.random() * 7
      break
    case 'SMALL_WIN':
      outcomeType = 'CHURN_WIN'
      targetMult = 1.1 + Math.random()
      break
    case 'CHURN_WIN':
    case 'PUSH':
      outcomeType = 'CHURN_WIN'
      targetMult = 0.5 + Math.random() * 0.5
      break
    case 'TEASE':
      outcomeType = 'DEAD_SPIN'
      targetMult = 0 // Wizualna przegrana
      break
    default:
      outcomeType = 'DEAD_SPIN'
      targetMult = 0
  }

  // 4. Konstrukcja siatki pod decyzję
  const factory = new GridFactory(stake)
  let grid: string[] = []

  if (scenario === 'TEASE') {
    // Tease: Generujemy siatkę, która ma np. 2 siódemki na linii (blisko wygranej)
    grid = factory.createTeaseGrid()
  } else if (outcomeType === 'DEAD_SPIN') {
    grid = factory.createLosingGrid()
  } else {
    grid = factory.createWinningGrid(targetMult)
  }

  // 5. Weryfikacja i Kill Switch
  const finalCalculation = factory.calculateWin(grid)

  // Jeśli wygenerowana wygrana jest podejrzanie wysoka (bug generatora), zerujemy ją.
  if (outcomeType !== 'JACKPOT' && finalCalculation > stake * 50) {
    grid = factory.createLosingGrid()
  }

  const verifiedWin = factory.calculateWin(grid)

  // Znajdź indeksy wygrywających linii (dla UI)
  const winningIndices: number[] = []
  if (verifiedWin > 0) {
    PAYLINES.forEach((line) => {
      const symbolsOnLine = line.map((idx) => grid[idx])
      const firstSym = symbolsOnLine[0]
      let matches = 1
      for (let i = 1; i < symbolsOnLine.length; i++) {
        if (symbolsOnLine[i] === firstSym) matches++
        else break
      }
      if ((PAYOUT_TABLE[firstSym]?.[matches] || 0) > 0) {
        winningIndices.push(...line.slice(0, matches))
      }
    })
  }

  // 6. Transakcja finansowa
  const currentMoney = typeof user.money === 'number' ? user.money : 0

  const { newMoney } = await updateUserBalances(
    payload,
    user.id,
    { money: currentMoney, cuponsMoney: user.cuponsMoney || 0 },
    stake,
    verifiedWin,
  )
  // =========================================================
  // LOGOWANIE KAŻDEJ WYGRANEJ (ZGODNIE Z WYMOGIEM)
  // =========================================================
  if (verifiedWin > 0) {
    try {
      await payload.create({
        collection: 'casino-wins',
        data: {
          user: user.id,
          gameTitle: 'JACKPOT BELLS',
          betAmount: stake,
          winAmount: verifiedWin,
          multiplier: verifiedWin / stake,
          // Dodatkowe dane analityczne (opcjonalne, jeśli schema pozwala)
          // timestamp: new Date().toISOString(),
          // riskProfile: playerStats.riskLevel
        },
      })
    } catch (error) {
      // Logujemy błąd zapisu, ale nie przerywamy gry, by nie tracić płynności
      console.error('CRITICAL: Błąd zapisu wygranej do bazy danych:', error)
    }
  }

  return {
    grid,
    winAmount: verifiedWin,
    newBalance: newMoney,
    winningIndices: Array.from(new Set(winningIndices)),
  }
}
