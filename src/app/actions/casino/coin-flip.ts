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
  BASE_WIN_CHANCE: 0.2, // Szansa spadła do 5%
  FAKE_WIN_CHANCE: 0.7, // Połowa przegranych to "bliskie wygrane" (Tease)
  FORCE_LOSS_THRESHOLD: 0.05,
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
 * Decyduje o wyniku gry i liczbie pasujących symboli.
 */
function determineOutcome(riskProfile: any, difficulty: keyof typeof MODES) {
  const roll = Math.random()
  const mode = MODES[difficulty]

  // Szansa na realną wygraną
  const adjustedChance = RIGGING_CONFIG.BASE_WIN_CHANCE * riskProfile.winLimiter

  if (roll < adjustedChance) {
    return { isWin: true, matchCount: mode.count }
  }

  // LOGIKA RETENCJI: Jeśli przegrał, wylosuj ile symboli ma "pasować" (od 1 do count-1)
  // To sprawia, że każda przegrana wygląda inaczej i buduje napięcie.
  const matchCount = Math.floor(Math.random() * (mode.count - 1)) + 1

  return { isWin: false, matchCount }
}

// ==========================================
// 4. FABRYKA PLANSZY (BOARD FACTORY)
// ==========================================
class BoardFactory {
  /**
   * Generuje planszę z określoną liczbą pasujących symboli w wybranych miejscach.
   */
  static create(matchCount: number, selectedIndices: number[], totalNeeded: number): string[] {
    const availableEmojis = shuffle([...EMOJIS])
    const tempBoard = new Array(20).fill(null)

    // Główny owoc, który będzie się powtarzał (ten, który "prawie" wygrał)
    const mainSymbol = availableEmojis[0]

    // Wstawiamy pasujące symbole w wybranych polach
    selectedIndices.forEach((idx, i) => {
      if (i < matchCount) {
        tempBoard[idx] = mainSymbol
      } else {
        // Pozostałe wybrane pola muszą być inne niż mainSymbol i inne od siebie nawzajem
        tempBoard[idx] = availableEmojis[i + 1]
      }
    })

    // Resztę planszy wypełniamy losowo
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
  const outcome = determineOutcome(riskProfile, difficulty)

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
