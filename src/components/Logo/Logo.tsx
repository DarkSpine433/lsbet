import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <div
      className={clsx(
        'max-w-[9.375rem] w-full h-20 overflow-hidden flex items-center justify-center',
        className,
      )}
    >
      <img
        alt="Payload Logo"
        width={193}
        height={34}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className={clsx(' w-full h-32  object-contain', className)}
        src="https://4rnviijiwq.ufs.sh/f/W6b8gTiNTm1Pb6e3NxEUQ7cfkqALeaE6wsSCJb4Zm2NlHvIt"
      />
    </div>
  )
}
