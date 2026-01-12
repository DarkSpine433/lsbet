'use server'

import { validateGameSession } from './casino-validator'
import { revalidatePath } from 'next/cache'

const EMOJIS = ['🍎', '🍋', '🍒', '💎', '7️⃣', '🔔', '🍇', '🍉']
const GAME_SLUG = 'coin-flip'

function shuffle(array: any[]) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export async function playCoinFlip(
  stake: number,
  difficulty: 'normal' | 'boost' | 'extra',
  selectedIndices: number[],
) {
  // 1. Walidacja sesji i środków (Anty-cheat)
  const { payload, user } = await validateGameSession(GAME_SLUG, stake)

  const MODES = {
    normal: { count: 3, mult: 2.0 },
    boost: { count: 4, mult: 3.5 },
    extra: { count: 5, mult: 5.0 },
  }

  const mode = MODES[difficulty]

  if (selectedIndices.length !== mode.count) {
    throw new Error('Nieprawidłowa liczba wybranych pól.')
  }

  // 2. GENEROWANIE PLANSZY (Zawsze 4 rodzaje owoców po 5 sztuk)
  let board: string[] = []
  const selectedEmojis = shuffle([...EMOJIS]).slice(0, 4) // Wybieramy 4 losowe rodzaje owoców

  selectedEmojis.forEach((emoji) => {
    for (let i = 0; i < 5; i++) {
      board.push(emoji) // Każdy z 4 owoców dodajemy 5 razy (4 * 5 = 20)
    }
  })

  // Mieszamy planszę, aby owoce były rozrzucone
  board = shuffle(board)

  // 3. Sprawdzenie wygranej
  const revealed = selectedIndices.map((i) => board[i])
  const isWin = revealed.every((s) => s === revealed[0])

  let wonAmount = 0
  let newBalance = user.money - stake

  if (isWin) {
    wonAmount = stake * mode.mult
    newBalance += wonAmount
  }

  // 4. Aktualizacja bazy danych i historii
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { money: newBalance },
  })

  if (isWin) {
    await payload.create({
      collection: 'casino-wins',
      data: {
        user: user.id,
        gameTitle: 'Fruit Flip',
        betAmount: stake,
        winAmount: wonAmount,
        multiplier: mode.mult,
      },
    })
  }

  revalidatePath('/')
  return { board, isWin, wonAmount, newBalance }
}
