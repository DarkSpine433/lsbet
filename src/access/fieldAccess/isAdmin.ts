import type { User } from '@/payload-types'
import { FieldAccessArgs } from 'node_modules/payload/dist/fields/config/types'

type isAdminFields = (args: FieldAccessArgs<User>) => boolean
export const isAdmin: isAdminFields = ({ req: { user } }) => {
  if (user) {
    if (user.role?.includes('admin')) {
      return true
    }
  }
  return false
}
