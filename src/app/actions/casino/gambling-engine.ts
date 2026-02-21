// Production-ready gambling utility engine
import crypto from 'node:crypto'

/**
 * PRODUCTION-READY GAMBLING ENGINE
 *
 * Ten silnik integruje:
 * 1. Bezpieczne losowanie (Node Crypto)
 * 2. Logikę scenariuszy (Tiered Outcomes)
 * 3. Logikę adaptacyjną (RTP & Risk Profile)
 * 4. System "Near-Miss" (Retencja gracza)
 */

// ==========================================
// 1. TYPY I INTERFEJSY
// ==========================================

export type OutcomeScenario =
  | 'JACKPOT' // x50+
  | 'BIG_WIN' // x10 - x50
  | 'MEDIUM_WIN' // x3 - x10
  | 'SMALL_WIN' // x1.1 - x3
  | 'CHURN_WIN' // x0.1 - x1.0 (Zwrot części stawki dla dopaminy)
  | 'PUSH' // x1.0
  | 'LOSS' // x0
  | 'TEASE' // Wizualna przegrana "o włos"

export interface RiskProfile {
  level: 'SAFE' | 'MONITOR' | 'WARNING' | 'CRITICAL'
  winLimiter: number // 1.0 (normal) do 0.01 (killer)
}

export interface EngineResult {
  scenario: OutcomeScenario
  multiplier: number
  isWin: boolean
  matchCount?: number // Dla gier typu slot/matryca
  metadata?: any // Dodatkowe dane dla silników wizualnych
}

// ==========================================
// 2. BEZPIECZEŃSTWO (SECURE RNG)
// ==========================================

/**
 * Generuje bezpieczną liczbę losową od 0 do 1.
 */
function secureRandom(): number {
  // crypto.randomInt(max) zwraca liczbę od 0 do max-1
  const max = 1000000000
  return crypto.randomInt(max) / max
}

// ==========================================
// 3. SILNIK LOGICZNY
// ==========================================

export class GamblingEngine {
  /**
   * Losuje scenariusz na podstawie wag i profilu ryzyka.
   * Przeznaczone dla gier typu: Slot, Jackpot Bells, Simple 20.
   */
  static determineScenario(
    riskProfile: RiskProfile,
    customWeights?: Partial<Record<OutcomeScenario, number>>,
  ): OutcomeScenario {
    const limiter = riskProfile.winLimiter
    const roll = secureRandom()

    // Domyślne wagi (suma = 1.0)
    const weights: Record<OutcomeScenario, number> = {
      JACKPOT: (customWeights?.JACKPOT || 0.0005) * limiter,
      BIG_WIN: (customWeights?.BIG_WIN || 0.005) * limiter,
      MEDIUM_WIN: (customWeights?.MEDIUM_WIN || 0.03) * limiter,
      SMALL_WIN: (customWeights?.SMALL_WIN || 0.12) * limiter,
      CHURN_WIN: customWeights?.CHURN_WIN || 0.2, // Churn nie jest limitowany (retencja)
      PUSH: customWeights?.PUSH || 0.05,
      LOSS: 0, // Obliczane na końcu
      TEASE: 0,
    }

    // Obliczamy LOSS jako resztę
    const winSum =
      weights.JACKPOT +
      weights.BIG_WIN +
      weights.MEDIUM_WIN +
      weights.SMALL_WIN +
      weights.CHURN_WIN +
      weights.PUSH

    const lossTotal = 1 - winSum
    // 60% z puli przegranych to "Tease" (bliska wygrana)
    weights.TEASE = lossTotal * 0.6
    weights.LOSS = lossTotal - weights.TEASE

    // Wybór scenariusza
    let cumulative = 0
    if (roll < (cumulative += weights.JACKPOT)) return 'JACKPOT'
    if (roll < (cumulative += weights.BIG_WIN)) return 'BIG_WIN'
    if (roll < (cumulative += weights.MEDIUM_WIN)) return 'MEDIUM_WIN'
    if (roll < (cumulative += weights.SMALL_WIN)) return 'SMALL_WIN'
    if (roll < (cumulative += weights.CHURN_WIN)) return 'CHURN_WIN'
    if (roll < (cumulative += weights.PUSH)) return 'PUSH'
    if (roll < (cumulative += weights.TEASE)) return 'TEASE'

    return 'LOSS'
  }

  /**
   * Oblicza szansę dla gier o stałym mnożniku (np. Simply Numbers, Coin Flip).
   */
  static calculateChance(multiplier: number, riskProfile: RiskProfile): boolean {
    // Teoretyczna szansa (RTP 95%)
    const baseChance = 0.95 / multiplier

    // Aplikacja limitera
    let adjustedChance = baseChance * riskProfile.winLimiter

    // Twarde limity bezpieczeństwa
    if (riskProfile.level === 'CRITICAL') adjustedChance = Math.min(adjustedChance, 0.01)
    if (riskProfile.level === 'WARNING') adjustedChance = Math.min(adjustedChance, 0.15)

    return secureRandom() < Math.min(adjustedChance, 0.98)
  }

  /**
   * Generuje "Match Count" dla efektu Tease.
   */
  static getRetentionMatchCount(needed: number, isWin: boolean): number {
    if (isWin) return needed

    const roll = secureRandom()
    // 70% szans na "bliską przegraną" (needed - 1 lub needed - 2)
    if (roll < 0.7 && needed > 1) {
      return Math.max(1, needed - (secureRandom() < 0.5 ? 1 : 2))
    }

    // Pozostałe 30% to totalna rozsypka
    return Math.floor(secureRandom() * (needed - 1)) + 1
  }

  /**
   * Uniwersalny helper do generowania wyniku z efektem "bliskiej wygranej".
   *
   * @param isWin Czy wynik to wygrana.
   * @param config Konfiguracja (np. ile elementów potrzeba do wygranej).
   */
  static getNearMissOutcome(isWin: boolean, config: { needed: number }) {
    if (isWin) return { isWin: true, matchCount: config.needed }

    // Dla przegranych losujemy matchCount dla retencji
    const matchCount = this.getRetentionMatchCount(config.needed, false)
    return { isWin: false, matchCount }
  }
}

/**
 * PURE HELPER: Losowanie z tablicy (Secure)
 */
export function secureShuffle<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

/**
 * PURE HELPER: Pobierz losowy element (Secure)
 */
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(secureRandom() * array.length)]
}
