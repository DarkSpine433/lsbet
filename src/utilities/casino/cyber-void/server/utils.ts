import { SYMBOLS, SymbolType } from './config'

/**
 * Zwraca listę symboli (spłaszczoną tablicę 18 elementów dla siatki 6x3)
 */
export function generateGrid(outcomeType: 'LOSS' | 'WIN' | 'TEASE', multiplier: number): number[] {
  const allSymbols = Object.values(SYMBOLS)
  const totalCells = 18 // 6 wierszy * 3 kolumny
  let grid = Array(totalCells).fill(null)
  let indices = Array.from({ length: totalCells }, (_, i) => i).sort(() => Math.random() - 0.5)

  // 1. SCENARIUSZ WYGRANEJ
  if (outcomeType === 'WIN') {
    const winningSymbol = allSymbols.find((s) => s.multiplier === multiplier) || SYMBOLS.COMMON

    // Wstawiamy 3 symbole wygrywające
    grid[indices[0]] = winningSymbol.id
    grid[indices[1]] = winningSymbol.id
    grid[indices[2]] = winningSymbol.id

    // Wypełniamy resztę
    for (let i = 3; i < totalCells; i++) {
      const idx = indices[i]
      let sym = allSymbols[Math.floor(Math.random() * allSymbols.length)]

      let attempts = 0
      // Próbujemy znaleźć symbol, którego nie ma za dużo, ale nie blokujemy się w nieskończoność
      while (
        (sym.id === winningSymbol.id || grid.filter((id) => id === sym.id).length >= 2) &&
        attempts < 20
      ) {
        sym = allSymbols[Math.floor(Math.random() * allSymbols.length)]
        attempts++
      }

      // Jeśli nie znaleźliśmy nic "czystego", wstawiamy cokolwiek poza wygrywającym (by nie było 4)
      if (grid.filter((id) => id === sym.id).length >= 3 || sym.id === winningSymbol.id) {
        sym = allSymbols.find((s) => s.id !== winningSymbol.id) || SYMBOLS.VOID
      }

      grid[idx] = sym.id
    }
    return grid
  }

  // 2. SCENARIUSZ PRZEGRANEJ LUB TEASE
  if (outcomeType === 'TEASE') {
    const highValueSyms = allSymbols.filter((s) => s.multiplier > 5)
    const teaser = highValueSyms[Math.floor(Math.random() * highValueSyms.length)] || SYMBOLS.RARE
    grid[indices[0]] = teaser.id
    grid[indices[1]] = teaser.id
  }

  // Wypełniamy resztę (bezpiecznie)
  for (let i = outcomeType === 'TEASE' ? 2 : 0; i < totalCells; i++) {
    const idx = indices[i]
    let sym = allSymbols[Math.floor(Math.random() * allSymbols.length)]

    let attempts = 0
    while (grid.filter((id) => id === sym.id).length >= 2 && attempts < 15) {
      sym = allSymbols[Math.floor(Math.random() * allSymbols.length)]
      attempts++
    }

    // Jeśli zapchaliśmy rzadkie symbole, walimy VOID pod korek
    if (grid.filter((id) => id === sym.id).length >= 2) {
      sym = SYMBOLS.VOID
    }

    grid[idx] = sym.id
  }

  return grid
}
