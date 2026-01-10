import type { User } from '@/payload-types'
import { FieldAccessArgs } from 'node_modules/payload/dist/fields/config/types'

type isItSelf = (args: FieldAccessArgs<User>) => boolean | { id: { equals: string } }
export const isItSelf: isItSelf = ({ req: { user } }) => {
  if (user && user.id && user.verified) {
    return {
      id: {
        equals: user.id,
      },
    }
  }

  return false
}
