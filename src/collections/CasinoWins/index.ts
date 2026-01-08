import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const CasinoWins: CollectionConfig = {
  slug: 'casino-wins',
  admin: {
    group: 'Casino',
    useAsTitle: 'user',
    defaultColumns: ['user', 'gameTitle', 'winAmount', 'createdAt'],
  },
  access: {
    read: () => true, // Każdy może widzieć wygrane (dla paska Live Wins)
    create: () => false, // Tylko system (Server Action) może tworzyć wpisy
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'gameTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'betAmount',
      type: 'number',
      required: true,
    },
    {
      name: 'winAmount',
      type: 'number',
      required: true,
    },
    {
      name: 'multiplier',
      type: 'number',
      required: true,
    },
  ],
}
