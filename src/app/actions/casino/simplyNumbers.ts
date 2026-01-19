'use server'

import { updateUserBalances, validateGameSession } from '@/app/actions/casino/casino-validator'
import { revalidatePath } from 'next/cache'

// ==========================================
// 1. KONFIGURACJA MATEMATYCZNA (SYSTEM CORE)
// ==========================================
const SIMPLY_CONFIG = {
  BASE_P_FACTOR: 0.64, // Realne RTP ustawione na ok. 64% przy x1.0 (agresywne)
  HOUSE_EDGE_MIN: 0.05, // Minimalna marża kasyna (5% - nigdy nie dajemy 100% szans)
  CRITICAL_THRESHOLD: 0.02, // Maksymalna szansa na wygraną w trybie CRITICAL
}

// ==========================================
// 2. ADAPTACYJNY SILNIK SZANS (ADAPTIVE ODDS)
// ==========================================
class ProbabilityEngine {
  /**
   * Oblicza dynamiczną szansę na wygraną.
   * Wykorzystuje nieliniową regresję do ustalenia szansy.
   */
  static calculateAdjustedChance(multiplier: number, riskProfile: any): number {
    // 1. Wyliczenie bazowej szansy (Krzywa wykładnicza)
    // P = Factor / Multiplier
    let baseChance = SIMPLY_CONFIG.BASE_P_FACTOR / multiplier

    // 2. Aplikacja Win Limitera z Validatora
    // winLimiter drastycznie spłaszcza krzywą dla wygrywających graczy
    let adjustedChance = baseChance * riskProfile.winLimiter

    // 3. Nakładanie twardych limitów bezpieczeństwa (Safety Guards)
    if (riskProfile.level === 'CRITICAL') {
      // W trybie CRITICAL gracz nie może mieć więcej niż 2% szans, niezależnie od mnożnika
      adjustedChance = Math.min(adjustedChance, SIMPLY_CONFIG.CRITICAL_THRESHOLD)
    }

    if (riskProfile.level === 'WARNING') {
      // W trybie WARNING ograniczamy szansę do 20%
      adjustedChance = Math.min(adjustedChance, 0.2)
    }

    // 4. Ograniczenie górne (House Edge) - gracz nigdy nie ma więcej niż 95% szans
    const maxAllowed = 1 - SIMPLY_CONFIG.HOUSE_EDGE_MIN
    return Math.min(adjustedChance, maxAllowed)
  }
}

// ==========================================
// 3. GŁÓWNA LOGIKA GRY (SERVER ACTION)
// ==========================================
export async function playSimplyNumbersAction(bet: number, gameSlug: string, multiplier: number) {
  // 1. Walidacja sesji i pobranie profilu drenażu
  // System sprawdza: sesję, środki oraz historię wygranych z 24h
  const { payload, user, riskProfile } = await validateGameSession(gameSlug, bet)

  if (multiplier < 1.1 || multiplier > 100) {
    throw new Error('Mnożnik poza dozwolonym zakresem (1.1 - 100).')
  }

  // 2. Obliczenie szansy przez silnik adaptacyjny
  // Szansa jest modyfikowana przez Win Limiter: 1.0 (Safe), 0.2 (Warning), 0.01 (Critical)
  const chance = ProbabilityEngine.calculateAdjustedChance(multiplier, riskProfile)

  // 3. Wykonanie rzutu (The Roll)
  const roll = Math.random()
  const isWin = roll < chance

  // 4. Kalkulacja finansowa
  // Uwaga: winAmount w Simply Numbers to zazwyczaj zysk netto lub brutto,
  // tutaj stosujemy system zysku brutto dla spójności z bazą danych.
  let winAmount = 0
  if (isWin) {
    winAmount = Math.floor(bet * multiplier)
  }

  const currentMoney = typeof user.money === 'number' ? user.money : 0

  const { newMoney } = await updateUserBalances(
    payload,
    user.id,
    { money: currentMoney, cuponsMoney: user.cuponsMoney || 0 },
    bet,
    winAmount,
  )
  console.log(newMoney)
  // 6. Logowanie zdarzenia (Wymagane do analizy ryzyka przy następnym ruchu)
  if (isWin) {
    try {
      await payload.create({
        collection: 'casino-wins',
        data: {
          user: user.id,
          gameTitle: gameSlug.replace('-', ' ').toUpperCase(),
          betAmount: bet,
          winAmount: winAmount,
          multiplier: multiplier,
        },
      })
    } catch (e) {
      console.error('Błąd rejestracji wygranej:', e)
    }
  }

  // Odświeżenie cache Next.js
  revalidatePath('/')

  return {
    win: isWin,
    winAmount,
    newBalance: newMoney,
    // Dane diagnostyczne silnika (tylko dla logów serwerowych/admina)

    success: true,
    error: null,
  }
}
