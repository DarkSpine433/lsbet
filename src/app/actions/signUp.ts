'use server'
import { getPayload } from 'payload'
import config from '@payload-config'

type CustomerEd = {
  password: string
  passwordConfirm: string
  nickname: string
}
export type signUpRetrunType = {
  data: unknown
  message: string
  isSuccess: boolean
  kind:
    | 'userExists'
    | 'userCreated'
    | 'error'
    | 'passwordError'
    | 'userSignIn'
    | 'userUpdate'
    | 'passwordChange'
    | 'inputError'
    | 'userLogout'
}
const signUp = async <T extends CustomerEd>({
  password,
  passwordConfirm,
  nickname,
}: T): Promise<signUpRetrunType> => {
  const email = nickname + '@lsbet.pl'
  if (!nickname || !password || !passwordConfirm) {
    return { data: null, message: 'Wypełnij wszystkie pola', isSuccess: false, kind: 'error' }
  }
  if (password !== passwordConfirm) {
    return {
      data: null,
      message: 'Hasła nie są takie same',
      isSuccess: false,
      kind: 'passwordError',
    }
  }
  if (password.length < 6) {
    return {
      data: null,
      message: 'Hasło musi mieć conajmniej 6 znaków',
      isSuccess: false,
      kind: 'passwordError',
    }
  }
  const payload = await getPayload({ config })
  try {
    const { docs } = await payload.find({
      collection: 'users', // required
      depth: 1,
      page: 1,
      limit: 1,
      pagination: false,
      where: {
        or: [{ email: { equals: email } }],
      },
    })
    if (docs.length > 0) {
      return {
        data: docs[0],
        message: 'Użytkownik już o takim Nicku istnieje',
        isSuccess: false,
        kind: 'userExists',
      }
    }

    const { id: getId, email: getEmail } = await payload.create({
      collection: 'users', // required
      data: {
        email: email,
        password: password,
        role: 'user',
      },
    })

    const { docs: docsToCheckIfUserCreated } = await payload.find({
      collection: 'users', // required
      depth: 1,
      page: 1,
      limit: 1,
      pagination: false,
      where: {
        and: [{ email: { equals: getEmail } }, { id: { equals: getId } }],
      },
    })

    if (docsToCheckIfUserCreated.length > 0) {
      return {
        data: docs[0],
        message:
          'Użytkownik został pomyślnie zarejestrowany. Skontaktujemy się z tobą wkrótce przez forum w celu weryfikacji konta. Dziękujemy za rejestrację!',
        isSuccess: true,
        kind: 'userCreated',
      }
    }

    return {
      data: null,
      message: 'Nie udało ci się zarejestrować, spróbuj ponownie pózniej',
      isSuccess: false,
      kind: 'error',
    }
  } catch (error) {
    return {
      data: null,
      message: 'Coś poszło nie tak :/, Jeżeli problem się ponawia to skontaktuj sie z nami' + error,
      isSuccess: false,
      kind: 'error',
    }
  }
}

export default signUp
