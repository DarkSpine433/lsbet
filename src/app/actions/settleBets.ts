// 'use server'
// import { getPayload } from 'payload'
// import configPromise from '@payload-config'

// export async function settleBetsAction(betId: string) {
//   const payload = await getPayload({ config: configPromise })

//   console.log(`[SERVER ACTION] Rozpoczynam rozliczanie dla meczu: ${betId}`)

//   // 1. Znajdź wszystkie kupony zawierające ten mecz
//   const { docs: coupons } = await payload.find({
//     collection: 'placed-bets',
//     where: {
//       'selections.betEvent': { equals: betId },
//       status: { equals: 'pending' }, // Rozliczaj tylko te, które czekają
//     },
//     depth: 0,
//     limit: 0,
//   })

//   console.log(`[SERVER ACTION] Znaleziono ${coupons.length} kuponów.`)

//   for (const coupon of coupons) {
//     // Wymuszamy aktualizację – to odpali hook beforeChange w PlacedBets
//     await payload.update({
//       collection: 'placed-bets',
//       id: coupon.id,
//       data: {
//         _internalUpdate: Date.now(),
//       },
//     })
//   }

//   return { success: true, count: coupons.length }
// }
