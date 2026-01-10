import type { User } from '@/payload-types'
import { FieldAccessArgs } from 'node_modules/payload/dist/fields/config/types'

type isAdminOrItself = (args: FieldAccessArgs<User>) => boolean | { id: { equals: string } }
export const isAdminOrItself: isAdminOrItself = ({ req: { user } }) => {
  if (user) {
    if (user.role?.includes('admin')) {
      return true
    }
    return {
      id: {
        equals: user.id,
      },
    }
  }

  return false
}
