export const GAME_SLUG = 'cyber-void'

export const SYMBOLS = {
  VOID: { id: 0, icon: '🌑', multiplier: 0, name: 'Void Dust' },
  COMMON: { id: 1, icon: '🔩', multiplier: 1, name: 'Rusty Bolt' }, // Zwrot stawki
  UNCOMMON: { id: 2, icon: '🔋', multiplier: 2, name: 'Power Cell' },
  RARE: { id: 3, icon: '💎', multiplier: 5, name: 'Neon Shard' },
  EPIC: { id: 4, icon: '🔮', multiplier: 10, name: 'Void Orb' },
  LEGENDARY: { id: 5, icon: '👑', multiplier: 50, name: 'Cyber Crown' },
  JACKPOT: { id: 6, icon: '🚀', multiplier: 500, name: 'Starship' },
}

// Konfiguracja "Rigging" - szanse na konkretne scenariusze
export const OUTCOME_WEIGHTS = {
  LOSS: 7000, // 70% szans na przegraną
  MONEY_BACK: 1500, // 15% na zwrot (x1) - utrzymuje gracza w grze
  SMALL_WIN: 1000, // 10% na mały zysk (x2 - x5)
  BIG_WIN: 450, // 4.5% na dużą wygraną
  JACKPOT: 50, // 0.5% na Jackpot
}

// Scenariusze przegranej (Psychologia)
export const LOSS_SCENARIOS = {
  TOTAL_MISS: 0.4, // Kompletny chaos
  NEAR_MISS: 0.6, // Bardzo ważne! 60% przegranych to "prawie wygrana" (2 takie same symbole)
}

export type SymbolType = (typeof SYMBOLS)[keyof typeof SYMBOLS]
