import { CollectionAfterChangeHook, CollectionConfig } from 'payload'

const sendWithdrawalNotification: CollectionAfterChangeHook = async ({
  doc, // Dokument po zmianie
  previousDoc, // Dokument przed zmianą
  req: { payload },
}) => {
  // Reagujemy tylko, gdy status uległ zmianie
  if (doc.status !== previousDoc.status) {
    let title = ''
    let message = ''
    let type: 'info' | 'win' | 'bonus' | 'alert' = 'info'

    // Scenariusz: Wypłata Zatwierdzona
    if (doc.status === 'completed') {
      title = '💸 Wypłata zrealizowana'
      message = `Twoja wypłata w wysokości ${doc.amount}$ została przetworzona pomyślnie. Środki powinny pojawić się na Twoim koncie wkrótce.`
      type = 'win'
    }
    // Scenariusz: Wypłata Odrzucona
    else if (doc.status === 'rejected') {
      title = '❌ Wypłata odrzucona'
      message = `Twoje zlecenie wypłaty (${doc.amount}$) zostało odrzucone. Środki zostały zwrócone na Twoje saldo główne.`
      type = 'alert'

      // OPCJONALNIE: Automatyczny zwrot pieniędzy na konto użytkownika w bazie
      const user = await payload.findByID({
        collection: 'users',
        id: typeof doc.user === 'object' ? doc.user.id : doc.user,
      })

      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          money: (user.money || 0) + doc.amount,
        },
      })
    }

    // Tworzenie powiadomienia w kolekcji 'notifications'
    if (title && message) {
      await payload.create({
        collection: 'notifications',
        data: {
          title,
          message,
          type,
          recipient: typeof doc.user === 'object' ? doc.user.id : doc.user,
          isRead: false,
          broadcast: false,
        },
      })
    }
  }
}

const Withdrawals: CollectionConfig = {
  slug: 'withdrawals',
  hooks: {
    afterChange: [sendWithdrawalNotification],
  },
  admin: {
    group: 'Finanse',
    useAsTitle: 'amount',
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
