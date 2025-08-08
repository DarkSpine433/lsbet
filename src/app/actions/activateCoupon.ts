'use server'

import { CuponCode, User } from '@/payload-types'
import { getPayload } from 'payload'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import config from '../../payload.config'

export const activateCouponAction = async (
  formData: FormData,
): Promise<{ success: boolean; message: string; newBalance?: number }> => {
  const code = formData.get('couponCode') as string
  if (!code) {
    return { success: false, message: 'Proszę wprowadzić kod.' }
  }

  const payload = await getPayload({ config })
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  const { user } = await payload.auth({
    headers: new Headers({
      Authorization: `JWT ${token}`,
    }),
  })

  if (!user) {
    return { success: false, message: 'Musisz być zalogowany, aby aktywować kod.' }
  }

  try {
    // Find the coupon code
    const couponResult = await payload.find({
      collection: 'cupon-codes',
      where: {
        code: {
          equals: code.toUpperCase(), // Codes are case-insensitive
        },
      },
      limit: 1,
    })

    const coupon = couponResult.docs[0] as CuponCode | undefined

    if (!coupon) {
      return { success: false, message: 'Nieprawidłowy kod kuponu.' }
    }

    // Check if the user has already used this coupon
    const usersWhoUsed = (coupon['who-used'] as User[] | undefined)?.map((u) => u.id) || []
    if (usersWhoUsed.includes(user.id)) {
      return { success: false, message: 'Już wykorzystałeś/aś ten kod.' }
    }

    // Fetch the full user document to get their current balance
    const fullUser = (await payload.findByID({
      collection: 'users',
      id: user.id,
    })) as User

    const currentMoney = fullUser.money || 0
    const couponAmount = coupon['amount-of-money'] || 0
    const newBalance = parseFloat((currentMoney + couponAmount).toFixed(2))

    // Update the user's balance
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        money: newBalance,
      },
    })

    // Add the user to the list of users who have used this code
    await payload.update({
      collection: 'cupon-codes',
      id: coupon.id,
      data: {
        'who-used': [...usersWhoUsed, user.id],
      },
    })

    revalidatePath('/home')
    revalidatePath('/my-bets')

    return {
      success: true,
      message: `Dodano ${couponAmount.toFixed(2)} PLN do Twojego konta!`,
      newBalance,
    }
  } catch (error) {
    console.error('Błąd aktywacji kuponu:', error)
    return { success: false, message: 'Wystąpił błąd serwera.' }
  }
}
