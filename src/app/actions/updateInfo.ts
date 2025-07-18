'use server'
import { getPayload, User } from 'payload'
import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'

import type { signUpRetrunType } from './signUp'

export const updateInfo = async ({
  id,
  updatedAt = '',
  createdAt = '',
  email = '',
  name,
  surname,
  phoneNumber,
  city,
  address,
  postalCode,
}: User): Promise<signUpRetrunType> => {
  const payload = await getPayload({ config })
  const headers = await nextHeaders()
  const resultHeader = await payload.auth({ headers })
  try {
    const result = await payload.update({
      collection: 'users', // required
      id: id, // required
      data: {
        name: name,
        surname: surname,
        phoneNumber: phoneNumber,
        city: city,
        address: address,
        postalCode: postalCode,
      },
      depth: 2,
      user: resultHeader.user,
      overrideAccess: false,
      overrideLock: false,
      showHiddenFields: true,
      overwriteExistingFiles: true,
    })
    return {
      data: result,
      message: 'Pomyslnie zaktualizowano dane',
      isSuccess: true,
      kind: 'userUpdate',
    }
  } catch (error) {
    return {
      data: null,
      message:
        'Coś poszło nie tak :/, Jeżeli problem się ponawia to skontaktuj sie z nami' + error + id,
      isSuccess: false,
      kind: 'error',
    }
  }
}
