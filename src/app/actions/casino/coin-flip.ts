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

const RIGGING_CONFIG = {
  BASE_WIN_CHANCE: 0.2,
  FAKE_WIN_CHANCE: 0.7,
  FORCE_LOSS_THRESHOLD: 0.05,
}

// ==========================================
// 2. NARZĘDZIA POMOCNICZE
// ==========================================
import { GamblingEngine, secureShuffle } from './gambling-engine'

// ==========================================
// 3. SILNIK DECYZYJNY (DECISION ENGINE)
// ==========================================
/**
 * Decyduje o wyniku gry i liczbie pasujących symboli.
 */
async function determineOutcome(riskProfile: any, difficulty: keyof typeof MODES) {
  const mode = MODES[difficulty]
  const isWin = GamblingEngine.calculateChance(mode.mult, riskProfile)
  return GamblingEngine.getNearMissOutcome(isWin, { needed: mode.count })
}

// ==========================================
// 4. FABRYKA PLANSZY (BOARD FACTORY)
// ==========================================
class BoardFactory {
  /**
   * Generuje planszę z określoną liczbą pasujących symboli w wybranych miejscach.
   */
  static create(matchCount: number, selectedIndices: number[], totalNeeded: number): string[] {
    const availableEmojis = secureShuffle([...EMOJIS])
    const tempBoard = new Array(20).fill(null)

    const mainSymbol = availableEmojis[0]

    selectedIndices.forEach((idx, i) => {
      if (i < matchCount) {
        tempBoard[idx] = mainSymbol
      } else {
        tempBoard[idx] = availableEmojis[i + 1]
      }
    })

    this.fillRemaining(tempBoard, availableEmojis)
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
  const outcome = await determineOutcome(riskProfile, difficulty)

  // 3. Generowanie planszy pod decyzję
  const board = BoardFactory.create(outcome.matchCount, selectedIndices, mode.count)

  // 4. Weryfikacja końcowa (Double Check)
  const revealedValues = selectedIndices.map((i) => board[i])
  const isActuallyWin = revealedValues.every((s) => s === revealedValues[0]) && outcome.isWin

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
