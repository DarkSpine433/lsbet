// collections/Coupons.ts
import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code',
    group: 'System',
  },
  access: {
    create: isAdmin,
    read: ({ req: { user } }) => !!user,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.code) {
          return {
            ...data,
            code: data.code.toUpperCase(), // Wymuszanie wielkich liter
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Kod będzie automatycznie zamieniony na WIELKIE LITERY',
      },
    },
    {
      name: 'value',
      type: 'number',
      required: true,
      admin: {
        description: 'Kwota dodawana do balansu $',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'isInfinite',
          type: 'checkbox',
          label: 'Nieskończona liczba użyć',
          defaultValue: false,
        },
        {
          name: 'neverExpires',
          type: 'checkbox',
          label: 'Nigdy nie wygasa',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: {
        condition: (data) => !data.neverExpires, // Ukryj jeśli zaznaczono "Nigdy nie wygasa"
      },
    },
    {
      name: 'maxUses',
      type: 'number',
      defaultValue: 1,
      required: true,
      admin: {
        condition: (data) => !data.isInfinite, // Ukryj jeśli zaznaczono "Nieskończona"
      },
    },
    {
      name: 'usedCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'usedBy',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}
