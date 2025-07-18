'use server'

import { signUpRetrunType } from './signUp'
import { getPayload, User } from 'payload'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'

export const deleteAccount = async ({
  currentPassword,
}: {
  currentPassword: string
}): Promise<signUpRetrunType> => {
  const payload = await getPayload({ config })
  const headers = await nextHeaders()
  const resultHeader = await payload.auth({ headers })

  if (!currentPassword) {
    return {
      data: null,
      kind: 'inputError',
      isSuccess: false,
      message: 'uzupełnij wszystkie pola',
    }
  }

  try {
    const result = await payload.unlock({
      collection: 'users', // required
      data: {
        // required
        email: resultHeader.user?.email as string,
        password: currentPassword,
      },

      overrideAccess: true,
    })
    if (!result) {
      return {
        data: null,
        kind: 'passwordError',
        isSuccess: false,
        message: 'Podane hasło jest niepoprawne',
      }
    }
    await payload.delete({
      collection: 'users', // required
      id: resultHeader.user?.id as string, // required
      depth: 2,
      user: resultHeader.user,
      overrideAccess: false,
    })
    return {
      data: null,
      kind: 'passwordChange',
      isSuccess: true,
      message: 'Udało sie usunąć konto',
    }
  } catch (error) {
    return {
      data: null,
      kind: 'error',
      isSuccess: false,
      message: 'Coś poszło nie tak',
    }
  }
}
