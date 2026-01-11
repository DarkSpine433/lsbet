import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { slugField } from '@/fields/slug'

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
      name: 'description',
      label: 'Game Description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'rules',
      label: 'Game Rules',
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
    },

    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      label: 'Gra Aktywna',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    ...slugField(),
  ],
  versions: {
    drafts: true,
  },
}
