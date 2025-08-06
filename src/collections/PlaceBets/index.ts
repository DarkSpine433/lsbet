import { isAdmin } from '@/access/isAdmin'
import { CollectionConfig } from 'payload'

export const PlacedBets: CollectionConfig = {
  slug: 'placed-bets',
  access: {
    create: () => true, // Allow users to create bets
    read: () => true, // Allow users to read their own bets
    update: isAdmin,
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
      name: 'betType',
      type: 'radio',
      options: ['single', 'combined'],
      required: true,
    },
    {
      name: 'stake',
      type: 'number',
      required: true,
    },
    {
      name: 'totalOdds', // Combined odds for the entire coupon
      type: 'number',
      required: true,
    },
    {
      name: 'potentialWin',
      type: 'number',
      required: true,
    },
    {
      name: 'status',
      type: 'radio',
      options: ['pending', 'won', 'lost'],
      defaultValue: 'pending',
      required: true,
    },
    // This array will hold all the individual selections for the bet
    {
      name: 'selections',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'betEvent',
          type: 'relationship',
          relationTo: 'bets',
          required: true,
        },
        {
          name: 'selectedOutcomeName', // e.g., "Team A" or "Draw"
          type: 'text',
          required: true,
        },
        {
          name: 'odds',
          type: 'number',
          required: true,
        },
      ],
    },
  ],
}
