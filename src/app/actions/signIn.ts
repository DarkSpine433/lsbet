'use server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { signUpRetrunType } from './signUp'
import { cookies } from 'next/headers'
type CustomerEd = {
  email: string
  password: string
}

const calculateExpiration = (days: number): Date => {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

const signIn = async <T extends CustomerEd>({ email, password }: T): Promise<signUpRetrunType> => {
  if (!email || !password) {
    return { data: null, message: 'Wypełnij wszystkie pola', isSuccess: false, kind: 'error' }
  }

  const payload = await getPayload({ config })
  const cookieStore = await cookies()
  try {
    const result = await payload.login({
      collection: 'users', // required
      data: {
        // required
        email: email,
        password: password,
      },
      depth: 2,
    })

    //add user result to local storage

    if (result.token && result.user) {
      cookieStore.set('payload-token', result.token, {
        secure: true,
        httpOnly: true,
        expires: calculateExpiration(30),
      })
      if (cookieStore.get('payload-token')) {
        return {
          data: result.user,
          message: 'Zalogowano pomyslnie',
          isSuccess: true,
          kind: 'userSignIn',
        }
      }
      return {
        data: null,
        message: 'Nie udało ci się zalogować, spróbuj ponownie pózniej',
        isSuccess: false,
        kind: 'error',
      }
    }
    return {
      data: null,
      message: 'Nie udało ci się zalogować, spróbuj ponownie pózniej',
      isSuccess: false,
      kind: 'error',
    }
  } catch (error) {
    return {
      data: null,
      message: `Nie udało się zalogować. ${String(error).split(':')[1] || 'Błąd serwera'}`,
      isSuccess: false,
      kind: 'error',
    }
  }
}

export default signIn
