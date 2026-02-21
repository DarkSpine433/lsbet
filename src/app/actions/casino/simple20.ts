'use server'

import { updateUserBalances, validateGameSession } from './casino-validator'
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

import { GamblingEngine } from './gambling-engine'

// ==========================================
// 2. SILNIK KONTROLI MATEMATYCZNEJ (MATH CORE)
// ==========================================
class SlotMathEngine {
  /**
   * Generuje układ bębnów pod konkretny scenariusz z uniwersalnego silnika.
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
      case 'TEASE':
        const teaseSym = randomSym()
        return [teaseSym, teaseSym, ALL_SYMBOLS.find((x) => x !== teaseSym) || '🍒']
      case 'LOSS':
      default:
        const s1 = randomSym()
        return [s1, ALL_SYMBOLS.find((x) => x !== s1) || '🍋', '🍇']
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

  // 2. Decyzja silnika (Outcome-Driven Architecture)
  // System najpierw decyduje ile gracz ma wygrać, a potem losuje obrazki
  const scenario = GamblingEngine.determineScenario(riskProfile)
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

  const currentMoney = typeof user.money === 'number' ? user.money : 0

  const { newMoney } = await updateUserBalances(
    payload,
    user.id,
    { money: currentMoney, cuponsMoney: user.cuponsMoney || 0 },
    stake,
    winAmount,
  )
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
    newBalance: newMoney,
    isWin: winAmount > 0,
    riskWarning: riskProfile.level !== 'SAFE',
    // Metadane dla dewelopera (usuń na produkcji)
  }
}
