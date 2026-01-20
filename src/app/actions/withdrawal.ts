'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'

export async function requestWithdrawal(data: { amount: number; method: string; details: string }) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await getMeUser()

  if (!user) throw new Error('Nieautoryzowany')
  if (!user.money || user.money < data.amount) throw new Error('Niewystarczające środki na koncie')

  // 1. Stwórz rekord wypłaty
  await payload.create({
    collection: 'withdrawals',
    data: {
      user: user.id,
      amount: data.amount,
      method: data.method,
      payoutDetails: data.details,
      status: 'pending',
    },
  })

  // 2. Odejmij środki z portfela (opcjonalnie - zależnie od Twojej logiki biznesowej)
  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      money: user.money - data.amount,
    },
  })

  return { success: true }
}

export async function getWithdrawalHistory() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await getMeUser()
  if (!user) return []

  const docs = await payload.find({
    collection: 'withdrawals',
    where: { user: { equals: user.id } },
    sort: '-createdAt',
  })

  return docs.docs
}
