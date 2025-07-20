import type { CollectionBeforeChangeHook, FieldHook } from 'payload'

export const generateId: FieldHook = ({ data, operation, req }) => {
  if (operation === 'create' || operation === 'update') {
    if (req.data && !req.data.publishedAt) {
      const now = new Date()
      return {
        ...data,
        id: `${now.getTime()}`,
      }
    }
  }

  return data
}
