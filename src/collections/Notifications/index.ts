import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    group: 'System',
  },
  access: {
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    // Użytkownik widzi tylko powiadomienia, gdzie jest odbiorcą LUB broadcast jest włączony
    read: ({ req: { user } }) => {
      if (!user) return false

      return {
        or: [
          {
            recipient: {
              equals: user.id,
            },
          },
          {
            broadcast: {
              equals: true,
            },
          },
        ],
      }
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Wygrana', value: 'win' },
        { label: 'Bonus', value: 'bonus' },
        { label: 'Alert', value: 'alert' },
      ],
      defaultValue: 'info',
    },
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'users',
      admin: { condition: (data) => !data.broadcast },
    },
    { name: 'broadcast', label: 'Wyślij do wszystkich', type: 'checkbox', defaultValue: false },
    {
      name: 'isReadBy',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: { readOnly: true },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
