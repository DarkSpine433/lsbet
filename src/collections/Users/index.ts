import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdminOrItself } from '@/access/isAdminOrItself'
import { anyone } from '@/access/anyone'
import { isAdmin } from '@/access/fieldAccess/isAdmin'

export const Users: CollectionConfig = {
  slug: 'users',

  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // How many seconds to keep the user logged in
    maxLoginAttempts: 20, // Automatically lock a user out after X amount of failed logins
    lockTime: 60 * 60, // Time period to allow the max login attempts
  },
  access: {
    create: anyone,
    delete: isAdminOrItself,
    admin: isAdmin,
    update: isAdminOrItself,
    read: isAdminOrItself,
  },
  admin: {
    defaultColumns: ['role', 'email'],
  },

  fields: [
    {
      access: {
        create: isAdmin,
        update: isAdmin,
        read: () => true,
      },
      name: 'verified',
      label: 'Verified',
      type: 'checkbox',
    },
    {
      access: {
        create: isAdmin,
        update: isAdmin,
        read: () => true,
      },
      name: 'banned',
      label: 'Banned',
      type: 'checkbox',
    },
    {
      access: {
        create: isAdmin,
        update: isAdmin,
        read: () => true,
      },
      name: 'role',
      type: 'select',
      options: ['admin', 'user'],
      required: true,
    },
  ],
  timestamps: true,
}
