'use server'

import { validateGameSession } from '@/app/actions/casino/casino-validator'
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

// ==========================================
// 2. SILNIK ANALITYCZNY GRACZA (PLAYER TRACKING)
// ==========================================

interface PlayerStats {
  netProfit: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

async function analyzePlayerRisk(payload: Payload, userId: string): Promise<PlayerStats> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Pobieramy historię wygranych, aby ocenić "szczęście" gracza
  const history = await payload.find({
    collection: 'casino-wins',
    where: {
      and: [{ user: { equals: userId } }, { createdAt: { greater_than: oneDayAgo } }],
    },
    limit: 1000,
  })

  const totalWon = history.docs.reduce((acc, doc) => acc + (doc.winAmount || 0), 0)

  let risk: PlayerStats['riskLevel'] = 'LOW'

  // Progi ryzyka (ile gracz wygrał w ostatnich 24h)
  if (totalWon > 5000) risk = 'MEDIUM'
  if (totalWon > 20000) risk = 'HIGH'
  if (totalWon > 100000) risk = 'CRITICAL'

  return {
    netProfit: totalWon,
    riskLevel: risk,
  }
}

// ==========================================
// 3. SILNIK DECYZYJNY (OUTCOME GENERATOR)
// ==========================================

type OutcomeType = 'DEAD_SPIN' | 'CHURN_WIN' | 'SMALL_WIN' | 'BIG_WIN' | 'JACKPOT'

function determineOutcome(risk: PlayerStats['riskLevel']): {
  type: OutcomeType
  targetMult: number
} {
  const roll = Math.random()

  // --- LOGIKA "KILLER" DLA GRACZY WYGRYWAJĄCYCH ---
  if (risk === 'CRITICAL') {
    // 98% szans na przegraną, 2% na zwrot 10% stawki (odzyskanie resztek)
    if (roll < 0.98) return { type: 'DEAD_SPIN', targetMult: 0 }
    return { type: 'CHURN_WIN', targetMult: 0.1 }
  }

  if (risk === 'HIGH') {
    // 90% przegranych, 8% zwrotu połowy stawki, 2% małej wygranej
    if (roll < 0.9) return { type: 'DEAD_SPIN', targetMult: 0 }
    if (roll < 0.98) return { type: 'CHURN_WIN', targetMult: 0.5 }
    return { type: 'SMALL_WIN', targetMult: 1.2 }
  }

  // --- STANDARDOWA LOGIKA DLA ZWYKŁYCH GRACZY ---
  // 70% Spiny puste (Czysty zysk kasyna)
  if (roll < 0.7) return { type: 'DEAD_SPIN', targetMult: 0 }

  // 20% "Fake wins" (Wygrywasz mniej niż postawiłeś lub minimalnie więcej - budowanie uzależnienia)
  if (roll < 0.9) {
    const mult = 0.2 + Math.random() // Mnożnik 0.2x - 1.2x
    return { type: 'CHURN_WIN', targetMult: mult }
  }

  // 9% Małe wygrane (2x - 5x)
  if (roll < 0.99) {
    const mult = 2 + Math.random() * 3
    return { type: 'SMALL_WIN', targetMult: mult }
  }

  // 1% Szans na Big Win (limitowane do 20x, a nie Max Win)
  return { type: 'BIG_WIN', targetMult: 10 + Math.random() * 10 }
}

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
  const { payload, user } = await validateGameSession('jackpot-bells', stake)

  // 2. Analiza Ryzyka (Profilowanie gracza)
  const playerStats = await analyzePlayerRisk(payload, user.id)

  // 3. Decyzja (Ile ma wygrać w tej rundzie?)
  const outcome = determineOutcome(playerStats.riskLevel)

  // 4. Konstrukcja siatki pod decyzję
  const factory = new GridFactory(stake)
  let grid: string[] = []

  if (outcome.type === 'DEAD_SPIN') {
    grid = factory.createLosingGrid()
  } else {
    grid = factory.createWinningGrid(outcome.targetMult)
  }

  // 5. Weryfikacja i Kill Switch
  const finalCalculation = factory.calculateWin(grid)

  // Jeśli wygenerowana wygrana jest podejrzanie wysoka (bug generatora), zerujemy ją.
  if (outcome.type !== 'JACKPOT' && finalCalculation > stake * 50) {
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
  const currentMoney = (user.money as number) || 0
  const newBalance = currentMoney - stake + verifiedWin

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { money: newBalance },
  })

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
    newBalance,
    winningIndices: Array.from(new Set(winningIndices)),
  }
}
