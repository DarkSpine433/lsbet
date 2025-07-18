import type { FieldAccess } from 'payload'
export const isAdminOrItself: FieldAccess = ({ req: { user }, id }) => {
  if (user) {
    if (user.role?.includes('admin')) {
      return true
    }
    // Allow access if the user is accessing their own record
    return id === user.id
  }

  return false
}
