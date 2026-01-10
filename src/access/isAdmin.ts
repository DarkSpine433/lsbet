import type { User } from '@/payload-types'
import { AccessArgs } from 'payload'

type isAdmin = (args: AccessArgs<User>) => boolean
export const isAdmin: isAdmin = ({ req: { user } }) => {
  if (user) {
    if (user.role?.includes('admin')) {
      return true
    }
  }
  return false
}
