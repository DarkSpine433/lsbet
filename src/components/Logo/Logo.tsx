'use client'

import clsx from 'clsx'
import React from 'react'
import { usePathname } from 'next/navigation'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props
  const pathname = usePathname()

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  // Definicja URL dla logo
  const LOGOS = {
    betting: 'https://ut91p27j9t.ufs.sh/f/CI2WZ5YUTq1b5mpQ3hTF5LkXP7DvMqtnhJY1IRlZB9uEWTOr',
    casino: 'https://ut91p27j9t.ufs.sh/f/CI2WZ5YUTq1bmB6rRKrbrT3CSkn1Ncw8VjzWI9JpLahu5teR',
  }
  const isCasino = pathname.includes('/casino')
  // Sprawdzanie aktualnej ścieżki
  const currentLogo = pathname.includes('/casino') ? LOGOS.casino : LOGOS.betting

  return (
    /* eslint-disable @next/next/no-img-element */
    <div
      className={clsx(
        'max-w-[9.375rem] w-full h-9 overflow-hidden flex items-center justify-center ',
        className,
      )}
    >
      {' '}
      <style jsx>{`
        @keyframes blurIn {
          0% {
            filter: blur(5px);
            opacity: 0;
          }
          100% {
            filter: blur(0px);
            opacity: 1;
          }
        }
        .animate-logo-change {
          animation: blurIn 0.4s ease-out forwards;
        }
      `}</style>
      <img
        key={currentLogo} // Klucz wymusza ponowne uruchomienie animacji przy zmianie źródła
        alt={isCasino ? 'Casino Logo' : 'Betting Logo'}
        width={193}
        height={34}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className={clsx(
          'w-full h-32 object-contain transition-all duration-700 animate-logo-change',
          isCasino ? 'scale-125' : 'scale-100',
        )}
        src={currentLogo}
      />
    </div>
  )
}
