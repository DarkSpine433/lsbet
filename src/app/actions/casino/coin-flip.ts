'use server'

import { updateUserBalances, validateGameSession } from './casino-validator'
import { revalidatePath } from 'next/cache'
import { Payload } from 'payload'

// ==========================================
// 1. STAŁE I KONFIGURACJA SYSTEMU
// ==========================================
const EMOJIS = ['🍎', '🍋', '🍒', '💎', '7️⃣', '🔔', '🍇', '🍉']
const GAME_SLUG = 'coin-flip'

const MODES = {
  normal: { count: 3, mult: 2.0 },
  boost: { count: 4, mult: 3.5 },
  extra: { count: 5, mult: 5.0 },
}

// Globalne ustawienia drenażu (RTP Control)
const RIGGING_CONFIG = {
  BASE_WIN_CHANCE: 0.3, // Bazowa szansa na wygraną (30%)
  FAKE_WIN_CHANCE: 0.2, // Szansa na "bliską przegraną" (teasing)
  FORCE_LOSS_THRESHOLD: 0.05, // Szansa na wygraną przy statusie CRITICAL (5%)
}

// ==========================================
// 2. NARZĘDZIA POMOCNICZE
// ==========================================
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// ==========================================
// 3. SILNIK DECYZYJNY (DECISION ENGINE)
// ==========================================
/**
 * Decyduje o wyniku gry przed wygenerowaniem planszy wizualnej.
 * Wykorzystuje profil ryzyka dostarczony przez validator.
 */
function determineOutcome(riskProfile: any, difficulty: keyof typeof MODES) {
  const roll = Math.random()

  // Modyfikacja szansy na podstawie profilu ryzyka z validatora
  // winLimiter drastycznie obniża szanse dla wygrywających graczy
  const adjustedChance = RIGGING_CONFIG.BASE_WIN_CHANCE * riskProfile.winLimiter

  if (roll < adjustedChance) {
    return 'WIN'
  }

  // Jeśli nie wygrał, sprawdź czy pokazać "bliską przegraną" dla efektu psychologicznego
  if (Math.random() < RIGGING_CONFIG.FAKE_WIN_CHANCE) {
    return 'TEASE'
  }

  return 'LOSS'
}

// ==========================================
// 4. FABRYKA PLANSZY (BOARD FACTORY)
// ==========================================
class BoardFactory {
  /**
   * Generuje planszę wymuszającą określony wynik.
   */
  static create(outcome: string, selectedIndices: number[], count: number): string[] {
    let board: string[] = []
    const availableEmojis = shuffle([...EMOJIS])

    // Inicjalizacja pustej planszy (20 pól)
    const tempBoard = new Array(20).fill(null)

    if (outcome === 'WIN') {
      // Wstrzyknij identyczne symbole w wybrane przez gracza miejsca
      const winningSymbol = availableEmojis[0]
      selectedIndices.forEach((idx) => {
        tempBoard[idx] = winningSymbol
      })

      // Resztę wypełnij tak, aby nie stworzyć przypadkiem innej wygrywającej kombinacji
      this.fillRemaining(tempBoard, availableEmojis.slice(1))
    } else if (outcome === 'TEASE') {
      // "Bliska przegrana": Prawie wszystkie wybrane są takie same, oprócz ostatniego
      const mainSymbol = availableEmojis[0]
      const failSymbol = availableEmojis[1]

      selectedIndices.forEach((idx, i) => {
        tempBoard[idx] = i === selectedIndices.length - 1 ? failSymbol : mainSymbol
      })

      this.fillRemaining(tempBoard, availableEmojis)
    } else {
      // Całkowita porażka: wymieszaj owoce tak, aby wybrane pola były różne
      selectedIndices.forEach((idx, i) => {
        tempBoard[idx] = availableEmojis[i % availableEmojis.length]
      })

      this.fillRemaining(tempBoard, availableEmojis)
    }

    return tempBoard
  }

  private static fillRemaining(board: any[], symbols: string[]) {
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = symbols[Math.floor(Math.random() * symbols.length)]
      }
    }
  }
}

// ==========================================
// 5. GŁÓWNA AKCJA GRY (PLAY ACTION)
// ==========================================
export async function playCoinFlip(
  stake: number,
  difficulty: 'normal' | 'boost' | 'extra',
  selectedIndices: number[],
) {
  // 1. Walidacja sesji i pobranie profilu ryzyka
  // System sprawdza historię wygranych z 24h i nakłada limity
  const { payload, user, riskProfile } = await validateGameSession(GAME_SLUG, stake)

  const mode = MODES[difficulty]
  if (selectedIndices.length !== mode.count) {
    throw new Error('Nieprawidłowa liczba wybranych pól.')
  }

  // 2. Decyzja o wyniku (Outcome-First)
  // Wykorzystujemy winLimiter z validatora, aby zdusić wygrane
  const outcome = determineOutcome(riskProfile, difficulty)

  // 3. Generowanie planszy pod decyzję
  const board = BoardFactory.create(outcome, selectedIndices, mode.count)

  // 4. Weryfikacja końcowa (Double Check)
  const revealed = selectedIndices.map((i) => board[i])
  const isActuallyWin = revealed.every((s) => s === revealed[0]) && outcome === 'WIN'

  let wonAmount = 0
  if (isActuallyWin) {
    wonAmount = Math.floor(stake * mode.mult)
  }

  // 5. Aktualizacja finansowa (Atomic-like update)
  const currentMoney = typeof user.money === 'number' ? user.money : 0

  const { newMoney } = await updateUserBalances(
    payload,
    user.id,
    { money: currentMoney, cuponsMoney: user.cuponsMoney || 0 },
    stake,
    wonAmount,
  )

  // 6. Logowanie wygranej (wymagane dla przyszłego profilowania ryzyka)
  if (wonAmount > 0) {
    try {
      await payload.create({
        collection: 'casino-wins',
        data: {
          user: user.id,
          gameTitle: 'Coin Flip',
          betAmount: stake,
          winAmount: wonAmount,
          multiplier: mode.mult,
        },
      })
    } catch (dbError) {
      console.error('Critical Database Error: Could not log win', dbError)
    }
  }

  revalidatePath('/')

  return {
    board,
    isWin: isActuallyWin,
    wonAmount,
    newBalance: newMoney,
    // Dane diagnostyczne (opcjonalnie dla admina)
  }
}
