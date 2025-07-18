'use server'
import { getPayload, User } from 'payload'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'

import type { signUpRetrunType } from './signUp'

export const verifyUserEmail = async ({ token }: { token: string }): Promise<signUpRetrunType> => {
  const payload = await getPayload({ config })

  try {
    const verification = await payload.verifyEmail({
      collection: 'users',
      token,
    })

    if (verification) {
      return {
        data: null,
        message: 'Pomyślnie zweryfikowano konto.',
        isSuccess: true,
        kind: 'userUpdate',
      }
    }

    return {
      data: null,
      message: 'Nie udało się zweryfikować konta. Spróbuj ponownie później.',
      isSuccess: false,
      kind: 'error',
    }
  } catch (error) {
    return {
      data: null,
      message: `Wystąpił błąd: ${error}`,
      isSuccess: false,
      kind: 'error',
    }
  }
}
