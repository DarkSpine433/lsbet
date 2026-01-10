'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Heartbeat() {
  const router = useRouter()

  useEffect(() => {
    const pulse = async () => {
      try {
        const res = await fetch('/api/users/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (res.ok) {
          // Opcjonalnie: odświeżamy dane serwerowe (np. żeby Status.tsx dostał nową datę)
          // router.refresh()
        }
      } catch (error) {
        console.error('Heartbeat failed:', error)
      }
    }

    // Wyślij sygnał od razu po wejściu na stronę
    pulse()

    // Wysyłaj sygnał co 1 minutę (60000ms)
    const interval = setInterval(pulse, 60000)

    return () => clearInterval(interval)
  }, [])

  return null // Komponent jest niewidoczny
}
