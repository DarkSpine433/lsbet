import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'

import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { isAdmin } from '@/access/isAdmin'
import { generateId } from '@/hooks/generateId'
import { afterChangeHook } from './hooks/afterChangeHook'

export const Bets: CollectionConfig<'bets'> = {
  slug: 'bets',

  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticatedOrPublished,
    update: isAdmin,
  },

  defaultPopulate: {
    title: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'stopbeting',
      type: 'checkbox',
      label: 'Stop Beting',
      defaultValue: false,
      admin: {
        description:
          'If checked,  bets can not be placed. before the event ends or after the event starts',
      },
    },
    {
      name: 'endevent',
      type: 'checkbox',
      label: 'End Event',
      defaultValue: false,
      admin: { description: 'If checked, the event is ended and no more bets can be placed.' },
    },
    {
      type: 'radio',
      name: 'typeofbet',
      label: 'Result Of Event',
      options: ['win-lose', 'draw'],
      defaultValue: 'win-lose',
      required: true,
      admin: { description: 'the result how event is finished' },
    },
    {
      name: 'draw-odds',
      type: 'number',
      label: 'Draw Odds',
    },
    {
      name: 'team',
      type: 'array',
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
          unique: true,
          admin: {
            disabled: true,
          },
        },
        { name: 'name', type: 'text', required: true },
        {
          name: 'odds',
          type: 'number',
          label: 'Odds',
        },
        {
          name: 'score',
          type: 'number',
        },
        {
          name: 'win-lose',
          type: 'checkbox',
          label: 'Win',
          defaultValue: false,

          admin: {
            condition: (data) => {
              if (data.typeofbet === 'win-lose') {
                return true
              } else {
                return false
              }
            },
          },
        },
        { name: 'logo', type: 'upload', relationTo: 'media' },
      ],
    }, // Added team field

    {
      name: 'starteventdate',
      type: 'date',
      timezone: true,
      admin: {
        position: 'sidebar',
        date: {
          timeFormat: 'HH:mm',
          pickerAppearance: 'dayAndTime',
        },
      },
    },

    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    afterChange: [afterChangeHook],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
