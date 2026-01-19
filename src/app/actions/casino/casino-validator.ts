'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
/**
 * Helper do bezpiecznej, systemowej aktualizacji portfela użytkownika.
 * Gwarantuje ominięcie blokad Access Control.
 */
/**
 * Helper do aktualizacji balansu z automatycznym transferem bonusu.
 * Obsługuje mapowanie pól zgodnie z Twoim CollectionConfig ('cupons-money').
 */
export async function updateUserBalances(
  payload: any,
  userId: string,
  currentBalances: { money: number; cuponsMoney: number },
  stake: number,
  winAmount: number,
) {
  // Inicjalizujemy dane do zapisu na podstawie obecnych stanów
  let targetMoney = Number(currentBalances.money) || 0
  let targetCoupons = Number(currentBalances.cuponsMoney) || 0

  // LOGIKA TRANSFERU BONUSU:
  // Jeśli użytkownik ma jakiekolwiek kupony, "przepalamy" je na gotówkę przed grą
  if (targetCoupons > 0 && stake > 0) {
    // Ile możemy zabrać z kuponów? (Albo cały stake, albo tyle ile jest dostępne)
    const amountFromCoupons = Math.min(targetCoupons, stake)

    targetCoupons = Number((targetCoupons - amountFromCoupons).toFixed(2))
    targetMoney = Number((targetMoney + amountFromCoupons).toFixed(2))

    console.log(
      `[SYSTEM-PAYMENT] Przeniesiono ${amountFromCoupons}$ z bonusu do portfela głównego dla: ${userId}`,
    )
  }
  targetMoney =
    winAmount > 0
      ? Number((targetMoney + winAmount).toFixed(2))
      : Number((targetMoney - stake).toFixed(2))
  // Wykonujemy jedną, atomową aktualizację w bazie danych
  const updatedUser = await payload.update({
    collection: 'users',
    id: userId,
    data: {
      money: targetMoney,
      cuponsMoney: targetCoupons,
    },
    overrideAccess: true, // Bypass dla update: isAdmin w Users.ts
    user: null, // Traktuj jako operację systemową (Root)
    showHiddenFields: true,
  })

  // Zwracamy zaktualizowane wartości, aby akcje (np. playCoinFlip) miały świeże dane
  return {
    success: !!updatedUser,
    newMoney: targetMoney + targetCoupons,
    newCoupons: targetCoupons,
  }
}
export async function validateGameSession(gameSlug: string, stake: number) {
  const payload = await getPayload({ config: configPromise })
  const { user: authUser } = await getMeUser()

  if (!authUser) throw new Error('Musisz być zalogowany, aby grać.')

  // 1. Pobranie świeżych danych (Full Document)
  const user = await payload.findByID({
    collection: 'users',
    id: authUser.id,
    overrideAccess: true,
  })

  // 2. Walidacja Gry
  const gameCheck = await payload.find({
    collection: 'casino-games',
    where: { and: [{ slug: { equals: gameSlug } }, { isActive: { equals: true } }] },
    limit: 1,
  })

  const game = gameCheck.docs[0]
  const isAdmin = user.role?.includes('admin') || user.role === 'admin'
  if (!isAdmin && !game) throw new Error('Gra jest nieaktywna.')

  // 3. LOGIKA TRANSFERU I SPRAWDZANIA SALDA
  let currentMoney = Number(user.money) || 0
  let currentCoupons = Number(user.cuponsMoney) || 0

  // Całkowita zdolność płatnicza
  const totalAvailable = currentMoney + currentCoupons

  if (!isAdmin && totalAvailable < stake) {
    throw new Error(`Niewystarczające środki. Brakuje ${(stake - totalAvailable).toFixed(2)} $`)
  }

  // Jeśli gracz ma jakiekolwiek kupony, wykorzystujemy je najpierw

  // 4. ANALIZA RYZYKA (Profilowanie wygranych)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const history = await payload.find({
    collection: 'casino-wins',
    where: { and: [{ user: { equals: user.id } }, { createdAt: { greater_than: oneDayAgo } }] },
    limit: 500,
    overrideAccess: true,
  })

  const totalWon24h = history.docs.reduce((acc, doc) => acc + (Number(doc.winAmount) || 0), 0)

  let riskProfile = { level: 'SAFE', totalWon24h, winLimiter: 1.0 }
  if (totalWon24h > 50000) riskProfile = { level: 'CRITICAL', totalWon24h, winLimiter: 0.05 }
  else if (totalWon24h > 10000) riskProfile = { level: 'WARNING', totalWon24h, winLimiter: 0.3 }

  return {
    payload,
    user: {
      ...user,
      money: currentMoney,
      cuponsMoney: currentCoupons,
    },
    game,
    isAdmin,
    riskProfile,
  }
}
