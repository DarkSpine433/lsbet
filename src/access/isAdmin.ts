import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

type isAdmin = (args: AccessArgs<User>) => boolean
export const isAdmin: isAdmin = ({ req: { user } }) => {
  if (user) {
    if (user.role?.includes('admin')) {
      return true
    }
  }
  return false
}
