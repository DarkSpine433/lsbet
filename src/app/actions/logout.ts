'use server'
import { cookies } from 'next/headers'
import { signUpRetrunType } from './signUp'

type Props = {}

export const logout = async (props: Props): Promise<signUpRetrunType> => {
  const cookieStore = await cookies()

  if (
    cookieStore.get('payload-token')?.value !== undefined ||
    cookieStore.get('payload-token')?.value !== null ||
    cookieStore.get('payload-token')?.value !== ''
  ) {
    try {
      cookieStore.delete({
        name: 'payload-token',
        domain: process.env.COOKIES_DOMAIN,
        path: '/',
        secure: true,
        sameSite: 'none',
        httpOnly: true,
      })

      if (
        cookieStore.get('payload-token')?.value !== undefined ||
        cookieStore.get('payload-token')?.value !== null ||
        cookieStore.get('payload-token')?.value !== ''
      ) {
        cookieStore.set('payload-token', '', {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          domain: process.env.COOKIES_DOMAIN,
          path: '/',
          expires: new Date(0),
        })
      }
      if (
        cookieStore.get('payload-token')?.value === undefined ||
        cookieStore.get('payload-token')?.value === null ||
        cookieStore.get('payload-token')?.value === ''
      ) {
        return {
          data: null,
          message: 'Udało ci się wylogować pomyślnie',
          isSuccess: true,
          kind: 'userLogout',
        }
      }
      return {
        data: null,
        message:
          'Coś poszło nie tak :/, Jeżeli problem się ponawia to skontaktuj sie z nami pierwsza bramka',
        isSuccess: false,
        kind: 'userLogout',
      }
    } catch (err) {
      return {
        data: null,
        message:
          'Coś poszło nie tak :/, Jeżeli problem się ponawia to skontaktuj sie z nami druga bramka',
        isSuccess: false,
        kind: 'userLogout',
      }
    }
  }
  return {
    data: null,
    message: 'Nie jesteś zalogowany',
    isSuccess: false,
    kind: 'userLogout',
  }
}
