export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  suit: Suit
  rank: Rank
  value: number
  isFlipped: boolean
}

export interface Hand {
  cards: Card[]
  score: number
  status: 'active' | 'stood' | 'bust' | 'blackjack'
  bet: number
}

export const createDeck = (decksCount: number = 6): Card[] => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  let deck: Card[] = []

  for (let i = 0; i < decksCount; i++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        let value = parseInt(rank)
        if (['J', 'Q', 'K'].includes(rank)) value = 10
        if (rank === 'A') value = 11
        deck.push({ suit, rank, value, isFlipped: true })
      }
    }
  }
  return deck.sort(() => Math.random() - 0.5)
}

export const calculateScore = (cards: Card[]): number => {
  let score = cards.reduce((sum, card) => sum + card.value, 0)
  let aces = cards.filter((c) => c.rank === 'A').length

  while (score > 21 && aces > 0) {
    score -= 10
    aces--
  }
  return score
}
