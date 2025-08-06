'use client'

import { useState, FC } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, LogOut, Ticket, History, Trophy, Home, ScaleIcon } from 'lucide-react'
import Link from 'next/link'
import { PlacedBet, Media as MediaType, Bet } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'
import { Media } from '@/components/Media'

// --- TYPES ---
type MyBetsPageClientProps = {
  nickname: string
  money?: number
  initialBets: PlacedBet[]
  resultOfEventBeted: Bet[]
}

// --- COMPONENT: BetCard ---
const BetCard: FC<{ bet: PlacedBet; resultOfEventBeted?: Bet[] }> = ({
  bet,
  resultOfEventBeted,
}) => {
  const isCombined = bet.betType === 'combined'

  let statusText = 'W grze'
  let statusColor = 'bg-blue-500'
  let outcomeText = ''
  let outcomeColor = 'text-green-600'

  if (bet.status === 'won') {
    statusText = 'Wygrany'
    statusColor = 'bg-green-500'
    outcomeText = `+${bet.potentialWin?.toFixed(2)} PLN`
  } else if (bet.status === 'lost') {
    statusText = 'Przegrany'
    statusColor = 'bg-red-500'
    outcomeText = `-${bet.stake?.toFixed(2)} PLN`
    outcomeColor = 'text-red-500'
  }

  return (
    <Card className="w-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-slate-50 p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-slate-800 font-bold">
              {isCombined
                ? `Kupon AKO (${bet.selections.length})`
                : (bet.selections[0].betEvent as Bet)?.title}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {formatDateTime(bet.createdAt, true)}
            </CardDescription>
          </div>
          <Badge className={`${statusColor} text-white`}>{statusText}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {bet.selections.map((selection, index) => {
          const betEvent = selection.betEvent as Bet
          const betEventResult = resultOfEventBeted?.find((result) => result.id === betEvent?.id)

          let selectionStatus: 'won' | 'lost' | 'pending' = 'pending'
          if (betEventResult?.endevent) {
            if (betEventResult.typeofbet === 'draw') {
              selectionStatus = selection.selectedOutcomeName === 'Remis' ? 'won' : 'lost'
            } else {
              const winningTeam = betEventResult.team?.find((team) => team['win-lose'])
              selectionStatus = winningTeam?.name === selection.selectedOutcomeName ? 'won' : 'lost'
            }
          }

          return (
            <div key={index}>
              <div
                className={`p-4 py-3 bg-slate-100 ${index < bet.selections.length - 1 ? 'border-b border-slate-200' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base font-semibold text-slate-800">{betEvent.title}</p>
                    <p className="text-sm text-slate-500 mb-2">
                      {betEvent.team?.map((t) => t.name).join(' vs ')}
                    </p>
                  </div>
                  {betEventResult?.endevent && (
                    <Badge
                      variant={selectionStatus === 'won' ? 'default' : 'destructive'}
                      className={selectionStatus === 'won' ? 'bg-green-500' : 'bg-red-500'}
                    >
                      {selectionStatus === 'won' ? 'Wygrana' : 'Przegrana'}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm mt-2">
                  <p className="text-slate-600">
                    Twój typ:{' '}
                    <span className="font-bold text-slate-900">
                      {selection.selectedOutcomeName}
                    </span>
                  </p>
                  <p className="text-slate-600">
                    Kurs:{' '}
                    <span className="font-bold text-slate-900">{selection.odds.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
      <CardFooter className="bg-slate-50 p-4 flex justify-between text-sm border-t">
        <div>
          <p className="text-slate-500">Stawka</p>
          <p className="font-semibold text-blue-500">{bet.stake?.toFixed(2)} PLN</p>
        </div>
        {isCombined && (
          <div className="text-center">
            <p className="text-slate-500">Kurs Łączny</p>
            <p className="font-semibold text-slate-800">{bet.totalOdds?.toFixed(2)}</p>
          </div>
        )}
        <div className="text-right">
          <p className="text-slate-500">Potencjalna wygrana</p>
          <p className={`font-bold ${outcomeColor}`}>
            {bet.status === 'pending' ? `${bet.potentialWin?.toFixed(2)} PLN` : outcomeText}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

// --- MAIN PAGE COMPONENT ---
export default function MyBetsPageClient({
  nickname,
  money,
  initialBets,
  resultOfEventBeted,
}: MyBetsPageClientProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'settled'>('active')

  const activeBets = initialBets.filter((bet) => bet.status === 'pending')
  const settledBets = initialBets.filter((bet) => bet.status === 'won' || bet.status === 'lost')

  const betsToShow = activeTab === 'active' ? activeBets : settledBets

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">Moje Zakłady</h1>

        {/* Tabs for filtering */}
        <div className="flex border-b mb-6">
          <Link
            href={'/home'}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors text-slate-500 hover:text-slate-800`}
          >
            <Home className="h-4 w-4" />
            Strona Główna
          </Link>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Ticket className="h-4 w-4" />
            Aktywne ({activeBets.length})
          </button>
          <button
            onClick={() => setActiveTab('settled')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'settled' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <History className="h-4 w-4" />
            Rozliczone ({settledBets.length})
          </button>
        </div>

        {/* List of bets */}
        <div className="space-y-4">
          {betsToShow.length > 0 ? (
            betsToShow.map((bet) => (
              <BetCard key={bet.id} bet={bet} resultOfEventBeted={resultOfEventBeted} />
            ))
          ) : (
            <div className="text-center py-16 text-slate-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="font-semibold">Brak zakładów w tej sekcji</p>
              <p className="text-sm">Postaw zakład, aby zobaczyć go tutaj.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
