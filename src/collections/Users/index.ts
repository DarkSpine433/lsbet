import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/fieldAccess/isAdmin'
import { isAdminOrItself } from '@/access/isAdminOrItself'
import { anyone } from '@/access/anyone'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    read: isAdminOrItself,
    create: anyone,
    update: isAdminOrItself,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: [
      'email',
      'role',
      'money',
      'lastActive',
      'totalWinsAmount',
      'verified',
      'banned',
    ],
  },
  hooks: {
    // Logika obsługująca dodawanie/odejmowanie pieniędzy przez Admina
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        // Sprawdzamy czy admin przesłał wartość w polu adjustBalance
        if (data.adjustBalance && data.adjustBalance !== 0) {
          const currentMoney = originalDoc?.money || 0
          const adjustment = data.adjustBalance

          // Aktualizujemy główne saldo
          data.money = currentMoney + adjustment

          // Wysyłamy powiadomienie
          try {
            await req.payload.create({
              collection: 'notifications',
              data: {
                title: adjustment > 0 ? '💰 Doładowanie konta' : '💸 Korekta salda',
                message:
                  adjustment > 0
                    ? `Twoje konto zostało doładowane o kwotę ${adjustment.toFixed(2)} $ przez administratora.`
                    : `Z Twojego konta pobrano kwotę ${Math.abs(adjustment).toFixed(2)} $ (korekta administratora).`,
                type: adjustment > 0 ? 'win' : 'alert',
                recipient: originalDoc.id,
                broadcast: false,
              },
            })
          } catch (err) {
            console.error('Błąd wysyłania powiadomienia o zmianie salda:', err)
          }

          // Zerujemy pole korekty, żeby przy następnym zapisie nie dodało/odjęło ponownie
          data.adjustBalance = 0
        }
        return data
      },
    ],
  },
  endpoints: [
    {
      path: '/heartbeat',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
        }

        try {
          await req.payload.update({
            collection: 'users',
            id: req.user.id,
            data: {
              lastActive: new Date().toISOString(),
            },
          })

          return new Response(JSON.stringify({ status: 'ok' }), { status: 200 })
        } catch (err) {
          return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
        }
      },
    },
  ],
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      access: { update: isAdmin },
    },
    {
      name: 'adjustBalance',
      type: 'number',
      admin: {
        description:
          'Wpisz np. 100 aby dodać lub -100 aby zabrać pieniądze. Pole wyzeruje się po zapisie.',
      },
      access: {
        update: isAdmin,
        create: isAdmin,
        read: isAdmin,
      },
    },
    {
      name: 'money',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Aktualny stan konta użytkownika (tylko do odczytu lub korekty bezpośredniej)',
      },
      access: {
        update: isAdmin,
        create: isAdmin,
      },
    },
    {
      name: 'lastActive',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'totalWinsAmount',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'banned',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
