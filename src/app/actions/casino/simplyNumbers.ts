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

import { GamblingEngine } from './gambling-engine'

// ==========================================
// 3. GŁÓWNA LOGIKA GRY (SERVER ACTION)
// ==========================================
export async function playSimplyNumbersAction(bet: number, gameSlug: string, multiplier: number) {
  // 1. Walidacja sesji i pobranie profilu drenażu
  const { payload, user, riskProfile } = await validateGameSession(gameSlug, bet)

  if (multiplier < 1.1 || multiplier > 100) {
    throw new Error('Mnożnik poza dozwolonym zakresem (1.1 - 100).')
  }

  // 2. Obliczenie szansy i wykonanie rzutu przez silnik produkcyjny
  const isWin = GamblingEngine.calculateChance(multiplier, riskProfile)

  // Near-miss logic: Jeśli nie wygrał, sprawdźmy czy to Tease (retencja)
  const isTease = !isWin && Math.random() < 0.4

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
    isTease,
    winAmount,
    newBalance: newMoney,
    // Dane diagnostyczne silnika (tylko dla logów serwerowych/admina)

    success: true,
    error: null,
  }
}
