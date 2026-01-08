'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function getUserCasinoWins(email: string) {
  try {
    const payload = await getPayload({ config })

    const wins = await payload.find({
      collection: 'casino-wins',
      where: {
        'user.email': {
          equals: email,
        },
      },
      limit: 100,
      sort: '-createdAt',
    })
    console.log(JSON.parse(JSON.stringify(wins.docs)))
    return {
      success: true,
      docs: JSON.parse(JSON.stringify(wins.docs)), // Bezpieczna serializacja dla Next.js
    }
  } catch (err) {
    console.error('SERVER ACTION ERROR:', err)
    return { success: false, docs: [], error: String(err) }
  }
}
