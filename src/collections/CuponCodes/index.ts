import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'

import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { isAdmin } from '@/access/isAdmin'
import { generateId } from '@/hooks/generateId'
import { afterChangeHook } from './hooks/afterChangeHook'

export const CuponCodes: CollectionConfig<'cupon-codes'> = {
  slug: 'cupon-codes',

  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticatedOrPublished,
    update: isAdmin,
  },

  defaultPopulate: {
    code: true,
  },
  admin: {
    defaultColumns: ['id', 'code', 'slug'],
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      label: 'Code (to proper working code type in UPPERCASE letters)',
    },
    {
      name: 'amount-of-money',
      type: 'number',
      required: true,
    },
    {
      name: 'who-used',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      unique: true,
    },
  ],
}
