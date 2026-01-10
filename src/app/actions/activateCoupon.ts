// app/actions/casino/activate-coupon.ts
'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function activateCoupon(code: string) {
  const payload = await getPayload({ config })
  const headers = await nextHeaders()
  const { user } = await payload.auth({ headers })

  if (!user) throw new Error('Musisz być zalogowany')

  // 1. Znajdź kupon
  const couponRes = await payload.find({
    collection: 'coupons',
    where: {
      code: { equals: code.toUpperCase() },
    },
  })

  const coupon = couponRes.docs[0]

  // 2. Walidacja istnienia i daty
  if (!coupon) return { error: 'Kod nie istnieje' }

  const now = new Date()
  // Fragment logiki w Server Action:
  if (!coupon.neverExpires && new Date(coupon.expiresAt ?? 0) < now) {
    return { error: 'Kod wygasł' }
  }

  if (!coupon.isInfinite && (coupon.usedCount ?? 0) >= (coupon.maxUses ?? 0)) {
    return { error: 'Limit użyć wyczerpany' }
  }

  // 4. Sprawdzenie czy ten konkretny użytkownik już go użył
  const alreadyUsed = coupon.usedBy?.some(
    (u: any) => (typeof u === 'string' ? u : u.id) === user.id,
  )
  if (alreadyUsed) {
    return { error: 'Już aktywowałeś ten kod' }
  }

  try {
    // 5. Aktualizacja balansu użytkownika
    const currentMoney = user.money || 0
    const newBalance = currentMoney + coupon.value

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        money: newBalance,
      },
    })

    // 6. Aktualizacja statystyk kuponu
    await payload.update({
      collection: 'coupons',
      id: coupon.id,
      data: {
        usedCount: (coupon.usedCount ?? 0) + 1,
        usedBy: [
          ...(coupon.usedBy || []).map((u: any) => (typeof u === 'string' ? u : u.id)),
          user.id,
        ],
      },
    })

    // 7. Stworzenie powiadomienia o wygranej/bonusie
    await payload.create({
      collection: 'notifications',
      data: {
        title: 'Kod aktywowany!',
        message: `Otrzymałeś ${coupon.value} $ z kodu bonusowego: ${coupon.code}`,
        type: 'bonus',
        recipient: user.id,
        broadcast: false,
        isRead: false,
      },
    })
    revalidatePath('/')
    return { success: true, amount: coupon.value, newBalance }
  } catch (err) {
    console.error(err)
    return { error: 'Wystąpił błąd podczas aktywacji' }
  }
}
