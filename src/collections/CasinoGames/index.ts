import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'

export const CasinoGames: CollectionConfig<'casino-games'> = {
  slug: 'casino-games',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticatedOrPublished,
    update: isAdmin,
  },
  admin: {
    group: 'Casino',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'updatedAt'],
  },
  hooks: {
    beforeChange: [populatePublishedAt],
  },
  fields: [
    {
      name: 'title',
      label: 'Game Title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
      // Możesz dodać hook do automatycznego generowania sluga z tytułu
    },
    {
      name: 'description',
      label: 'Game Description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'relationship',
      relationTo: 'casino-categories',
      required: true,
    },
    {
      name: 'gamelogo',
      label: 'Game Logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Game Logic',
          fields: [
            {
              name: 'serverLogic', // Zmienione z 'server logic' (Payload nie akceptuje spacji)
              label: 'Server Logic (Code)',
              type: 'code',
              admin: {
                language: 'javascript',
              },
              required: true,
            },
            {
              name: 'clientLogic', // Zmienione z 'client logic'
              label: 'Client Logic (Code)',
              type: 'code',
              admin: {
                language: 'javascript',
              },
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  versions: {
    drafts: true,
  },
}
