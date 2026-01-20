import { SYMBOLS, SymbolType } from './config'

/**
 * Zwraca listę symboli (spłaszczoną tablicę 18 elementów dla siatki 6x3)
 */
export function generateGrid(outcomeType: 'LOSS' | 'WIN', multiplier: number): number[] {
  const allSymbols = Object.values(SYMBOLS)
  const totalCells = 18 // 6 wierszy * 3 kolumny

  // 1. SCENARIUSZ WYGRANEJ
  if (outcomeType === 'WIN') {
    // Znajdź symbol odpowiadający mnożnikowi
    const winningSymbol = allSymbols.find((s) => s.multiplier === multiplier) || SYMBOLS.COMMON

    // Inicjalizacja pustej siatki
    let grid = Array(totalCells).fill(null)
    // Losowanie indeksów dla całej siatki
    let indices = Array.from({ length: totalCells }, (_, i) => i).sort(() => Math.random() - 0.5)

    // Wstawiamy 3 symbole wygrywające
    grid[indices[0]] = winningSymbol.id
    grid[indices[1]] = winningSymbol.id
    grid[indices[2]] = winningSymbol.id

    // Resztę wypełniamy tak, aby nie stworzyć przypadkiem innej wygranej
    for (let i = 3; i < totalCells; i++) {
      const idx = indices[i]
      let randomSymbol = allSymbols[Math.floor(Math.random() * allSymbols.length)]

      // Zabezpieczenie:
      // 1. Nie może być taki sam jak wygrywający (żeby nie było więcej niż 3)
      // 2. Nie może stworzyć innej trójki przez przypadek
      while (
        randomSymbol.id === winningSymbol.id ||
        grid.filter((id) => id === randomSymbol.id).length >= 2
      ) {
        randomSymbol = allSymbols[Math.floor(Math.random() * allSymbols.length)]
      }
      grid[idx] = randomSymbol.id
    }
    return grid
  }

  // 2. SCENARIUSZ PRZEGRANEJ
  // Wybieramy symbol dla "Near Miss"
  const targetSymbol = allSymbols[Math.floor(Math.random() * allSymbols.length)]
  let grid = Array(totalCells).fill(null)
  let indices = Array.from({ length: totalCells }, (_, i) => i).sort(() => Math.random() - 0.5)

  // Wstawiamy 2 takie same symbole (brak wygranej o jeden symbol)
  grid[indices[0]] = targetSymbol.id
  grid[indices[1]] = targetSymbol.id

  // Wypełniamy resztę (maksymalnie po 2 takie same symbole na całą siatkę 18 pól)
  for (let i = 2; i < totalCells; i++) {
    const idx = indices[i]

    // Szukamy symbolu, którego nie ma jeszcze 2 razy w siatce
    let safeSymbol = allSymbols[Math.floor(Math.random() * allSymbols.length)]

    let attempts = 0
    while (grid.filter((id) => id === safeSymbol.id).length >= 2 && attempts < 20) {
      safeSymbol = allSymbols[Math.floor(Math.random() * allSymbols.length)]
      attempts++
    }

    // Jeśli po 20 próbach nie znaleziono (mało prawdopodobne), używamy VOID
    if (grid.filter((id) => id === safeSymbol.id).length >= 2) {
      safeSymbol = SYMBOLS.VOID
    }

    grid[idx] = safeSymbol.id
  }

  return grid
}
