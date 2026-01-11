'use server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'

/**
 * Helper sprawdzający uprawnienia do gry:
 * 1. Czy użytkownik jest zalogowany?
 * 2. Czy użytkownik ma wystarczająco pieniędzy (chyba że jest adminem)?
 * 3. Czy gra jest zarejestrowana w bazie i aktywna?
 */
export async function validateGameSession(gameSlug: string, stake: number) {
  const payload = await getPayload({ config: configPromise })

  const gameCheck = await payload.find({
    collection: 'casino-games',
    where: {
      and: [{ slug: { equals: gameSlug } }, { isActive: { equals: true } }],
    },
    limit: 1,
  })

  const game = gameCheck.docs[0]

  const { user } = await getMeUser()

  if (!user) {
    throw new Error('Musisz być zalogowany, aby grać.')
  }

  const isAdmin = user.role?.includes('admin') || user.role === 'admin'

  if (!isAdmin) {
    if (!game) {
      throw new Error(`Gra "${gameSlug}" jest obecnie nieaktywna lub nie istnieje.`)
    }
    if (typeof user.money !== 'number') {
      throw new Error('Błąd konta: brak zdefiniowanych środków.')
    }

    if (user.money < stake) {
      throw new Error('Niewystarczające środki na koncie.')
    }
  }

  const safeUser = {
    ...user,
    money: typeof user.money === 'number' ? user.money : 0,
  }

  return { payload, user: safeUser, game, isAdmin }
}
