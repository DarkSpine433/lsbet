import { CollectionConfig } from 'payload'

const Withdrawals: CollectionConfig = {
  slug: 'withdrawals',
  admin: {
    group: 'Finanse',
    useAsTitle: 'amount',
    defaultColumns: ['user', 'amount', 'status', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role?.includes('admin')) return true
      return { user: { equals: user.id } }
    },
    create: () => true,
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'amount', type: 'number', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Oczekujące', value: 'pending' },
        { label: 'Zrealizowane', value: 'completed' },
        { label: 'Odrzucone', value: 'rejected' },
      ],
    },
    { name: 'method', type: 'text', required: true },
    { name: 'payoutDetails', type: 'textarea', required: true },
  ],
}

export default Withdrawals
