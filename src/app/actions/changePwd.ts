'use server'

import { signUpRetrunType } from './signUp'
import { getPayload, User } from 'payload'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'

export const changePwd = async ({
  currentPassword,
  newPassword,
  confirmNewPassword,
}: {
  newPassword: string
  currentPassword: string
  confirmNewPassword: string
}): Promise<signUpRetrunType> => {
  const payload = await getPayload({ config })
  const headers = await nextHeaders()
  const resultHeader = await payload.auth({ headers })
  console.log(resultHeader.user?.password, currentPassword, newPassword, confirmNewPassword)
  if (!currentPassword && !newPassword && !confirmNewPassword) {
    return {
      data: null,
      kind: 'inputError',
      isSuccess: false,
      message: 'uzupełnij wszystkie pola',
    }
  }
  if (newPassword !== confirmNewPassword) {
    return {
      data: null,
      kind: 'passwordError',
      isSuccess: false,
      message: 'Hasła nie są takie same',
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
    await payload.update({
      collection: 'users', // required
      id: resultHeader.user?.id as string, // required
      data: {
        password: newPassword,
      },
      depth: 2,
      user: resultHeader.user,
      overrideAccess: false,
    })
    return {
      data: null,
      kind: 'passwordChange',
      isSuccess: true,
      message: 'Hasło zostało zmienione',
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
