import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrItself } from '@/access/isAdminOrItself'

export const PlacedBets: CollectionConfig = {
  slug: 'placed-bets',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'betEvent', 'status', 'stake', 'potentialWin', 'createdAt'],
  },
  access: {
    create: () => true, // Access is handled in the endpoint
    read: isAdminOrItself,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'betEvent',
      type: 'relationship',
      relationTo: 'bets',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'selectedOutcome',
      type: 'text', // Stores the ID of the team or 'draw'
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'stake',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'odds',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'potentialWin',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'won', 'lost'],
      defaultValue: 'pending',
      required: true,
    },
  ],
}
