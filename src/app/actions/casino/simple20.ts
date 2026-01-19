'use server'

import { validateGameSession } from './casino-validator'
import { revalidatePath } from 'next/cache'
import { Payload } from 'payload'

// ==========================================
// 1. ZAAWANSOWANA KONFIGURACJA MATEMATYCZNA
// ==========================================
const SYMBOL_VALUES: Record<string, number> = {
  '7️⃣': 50,
  '🔔': 20,
  '🍉': 10,
  '🍇': 5,
  '🍋': 3,
  '🍒': 2,
}

const ALL_SYMBOLS = Object.keys(SYMBOL_VALUES)

/**
 * Konfiguracja "Virtual Reel" - wirtualnego bębna.
 * Im mniej wystąpień symbolu, tym trudniej go trafić przed interwencją silnika.
 */
const VIRTUAL_REEL = [
  ...Array(1).fill('7️⃣'),
  ...Array(2).fill('🔔'),
  ...Array(5).fill('🍉'),
  ...Array(10).fill('🍇'),
  ...Array(20).fill('🍋'),
  ...Array(40).fill('🍒'),
  ...Array(120).fill('BLANK'), // Puste pola lub śmieci
]

// ==========================================
// 2. SILNIK KONTROLI MATEMATYCZNEJ (MATH CORE)
// ==========================================
class SlotMathEngine {
  /**
   * Główny algorytm decyzyjny oparty na profilu ryzyka.
   * Zamiast losować symbole, losujemy scenariusz.
   */
  static determineOutcomeScenario(riskProfile: any) {
    const roll = Math.random()

    // Pobieramy winLimiter z validatora (1.0 = normal, 0.01 = killer mode)
    const limiter = riskProfile.winLimiter

    // Progi prawdopodobieństwa modyfikowane przez drenaż
    const thresholds = {
      JACKPOT: 0.001 * limiter,
      BIG_WIN: 0.01 * limiter,
      MEDIUM_WIN: 0.05 * limiter,
      SMALL_WIN: 0.15 * limiter,
      CHURN_WIN: 0.25, // Wygrana < stawka (zawsze dopuszczalna dla dopaminy)
    }

    if (roll < thresholds.JACKPOT) return 'JACKPOT'
    if (roll < thresholds.BIG_WIN) return 'BIG_WIN'
    if (roll < thresholds.MEDIUM_WIN) return 'MEDIUM_WIN'
    if (roll < thresholds.SMALL_WIN) return 'SMALL_WIN'
    if (roll < thresholds.CHURN_WIN) return 'CHURN_WIN'

    return 'LOSS'
  }

  /**
   * Generuje układ bębnów pod konkretny scenariusz.
   */
  static generateReelsForScenario(scenario: string): string[] {
    const randomSym = () => ALL_SYMBOLS[Math.floor(Math.random() * ALL_SYMBOLS.length)]

    switch (scenario) {
      case 'JACKPOT':
        return ['7️⃣', '7️⃣', '7️⃣']
      case 'BIG_WIN':
        return ['🔔', '🔔', '🔔']
      case 'MEDIUM_WIN':
        return ['🍉', '🍉', '🍉']
      case 'SMALL_WIN':
        return ['🍋', '🍋', '🍋']
      case 'CHURN_WIN':
        return ['🍒', '🍒', '🍒']
      case 'LOSS':
      default:
        // Generuj układ "Near Miss" (Bliskie trafienie) - 70% szans na 2 takie same
        if (Math.random() < 0.7) {
          const s = randomSym()
          return [s, s, ALL_SYMBOLS.find((x) => x !== s) || '🍒']
        }
        return [randomSym(), randomSym(), ALL_SYMBOLS.find((_, i) => i === 2) || '🍋']
    }
  }
}

// ==========================================
// 3. GŁÓWNA AKCJA SYSTEMOWA
// ==========================================
export async function playSimple20Action(stake: number) {
  // 1. Walidacja z użyciem Twojego nowego casino-validator
  // Validator zwraca riskProfile (level, totalWon24h, winLimiter)
  const { payload, user, riskProfile } = await validateGameSession('simple-20', stake)

  const currentMoney = user.money

  // 2. Decyzja silnika (Outcome-Driven Architecture)
  // System najpierw decyduje ile gracz ma wygrać, a potem losuje obrazki
  const scenario = SlotMathEngine.determineOutcomeScenario(riskProfile)
  const reels = SlotMathEngine.generateReelsForScenario(scenario)

  // 3. Obliczenie wygranej na podstawie wygenerowanych bębnów
  let winAmount = 0
  const isAllSame = reels[0] === reels[1] && reels[1] === reels[2]

  if (isAllSame) {
    winAmount = stake * (SYMBOL_VALUES[reels[0]] || 0)
  }

  // 4. ZABEZPIECZENIE (Kill-Switch)
  // Jeśli gracz jest w trybie CRITICAL, a jakimś cudem wygenerowano wygraną > 100x
  if (riskProfile.level === 'CRITICAL' && winAmount > stake * 10) {
    // Podmiana na stratę w ostatniej milisekundzie
    reels[2] = ALL_SYMBOLS.find((s) => s !== reels[0]) || '🍒'
    winAmount = 0
  }

  // 5. Aktualizacja finansowa (Atomic Transaction)
  const newBalance = currentMoney - stake + winAmount

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { money: newBalance },
  })

  // 6. Logowanie wygranej do bazy (niezbędne dla profilowania ryzyka)
  if (winAmount > 0) {
    try {
      await payload.create({
        collection: 'casino-wins',
        data: {
          user: user.id,
          gameTitle: 'Simple 20',
          betAmount: stake,
          winAmount: winAmount,
          multiplier: winAmount / stake,
        },
      })
    } catch (e) {
      console.error('Błąd logowania wygranej:', e)
    }
  }

  // Revalidacja ścieżki dla aktualnych danych na froncie
  revalidatePath('/')

  return {
    reels,
    winAmount,
    newBalance,
    isWin: winAmount > 0,
    riskWarning: riskProfile.level !== 'SAFE',
    // Metadane dla dewelopera (usuń na produkcji)
  }
}
