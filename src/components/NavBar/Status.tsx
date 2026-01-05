'use client'
import React, { useCallback, useState } from 'react'
import { Bet } from '@/payload-types'
import { create } from 'zustand'
import {
  CONNECTION_STATUS,
  MESSAGE_TYPES,
  WSMessage,
} from '@/app/(frontend)/(authenticated)/home/types'
import { useWebSocket } from '../../app/(frontend)/(authenticated)/home/hooks/useWebSocket'
type Props = {
  className?: string
}

const Status = (props: Props) => {
  const [bets, setBets] = useState<Bet[]>([])

  const handleMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case MESSAGE_TYPES.COLLECTION_DATA:
        setBets((message as any).data.docs)
        break
      case MESSAGE_TYPES.COLLECTION_CHANGED:
        if (message.collection === 'bets') {
          switch (message.operation) {
            case 'create':
              setBets((prev) => [...prev, message.doc])
              break
            case 'update':
              setBets((prev) => prev.map((bet) => (bet.id === message.doc.id ? message.doc : bet)))
              break
            case 'delete':
              setBets((prev) => prev.filter((bet) => bet.id !== message.doc.id))
              break
          }
        }
        break
    }
  }, [])

  const { status } = useWebSocket<WSMessage>({
    collection: 'bets',
    onMessage: handleMessage,
  })
  return (
    <span
      className={`w-2.5 h-2.5 p-1 rounded-full ${status === CONNECTION_STATUS.CONNECTED ? 'bg-green-500' : CONNECTION_STATUS.CONNECTING === status ? 'bg-yellow-500' : 'bg-red-500'} ${props.className}`}
    ></span>
  )
}

export default Status
