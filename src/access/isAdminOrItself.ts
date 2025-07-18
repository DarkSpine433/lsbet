import type { Access } from 'payload'

export const isAdminOrItself: Access = ({ req: { user } }) => {
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
