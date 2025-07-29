import { CollectionAfterChangeHook } from 'payload'

export const afterChangeHook: CollectionAfterChangeHook = ({ doc, operation }) => {
  if (operation === 'update' || operation === 'create') {
    const eventType = operation === 'update' ? 'bet:updated' : 'bet:created'

    console.log(`Bet ${operation}: ${doc.id}. Broadcasting change...`)

    // Emit an event to all connected clients
  }
  return doc
}
