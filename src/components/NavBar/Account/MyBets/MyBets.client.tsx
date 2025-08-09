'use client'

import { useState, FC, useMemo } from 'react'
import { Button } from '@/components/ui/button'
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
import { Logo } from '@/components/Logo/Logo'
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

// A helper function to determine the status of an individual selection
const getSelectionStatus = (
  selection: PlacedBet['selections'][0],
  result?: Bet,
): 'won' | 'lost' | 'pending' => {
  if (!result || !result.endevent) {
    return 'pending'
  }

  const { selectedOutcomeName } = selection
  const isDrawResult = result.typeofbet === 'draw'

  if (isDrawResult) {
    // Assuming 'Remis' is the designated name for a draw outcome
    return selectedOutcomeName === 'Remis' ? 'won' : 'lost'
  }

  const winningTeam = result.team?.find((team) => team['win-lose'])
  if (winningTeam) {
    return selectedOutcomeName === winningTeam.name ? 'won' : 'lost'
  }

  // Default to lost if the event is over but the outcome is unclear
  return 'lost'
}

// --- COMPONENT: BetCard ---
const BetCard: FC<{ bet: PlacedBet; resultsMap: Map<string, Bet> }> = ({ bet, resultsMap }) => {
  const isCombined = bet.betType === 'combined'

  let statusText = 'W grze'
  let statusColor = 'bg-blue-500'
  let outcomeText = ''
  let outcomeColor = 'text-green-600'

  if (bet.status === 'won') {
    statusText = 'Wygrany'
    statusColor = 'bg-green-500'
    outcomeText = `+${bet.potentialWin?.toFixed(2)} PLN`
    outcomeColor = 'text-green-600'
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
      <CardContent className="p-0 bg-slate-200">
        {bet.selections.map((selection, index) => {
          const betEvent = selection.betEvent as Bet
          // Performance fix: O(1) map lookup instead of O(n) array.find()
          const betEventResult = resultsMap.get(betEvent.id)
          const selectionStatus = getSelectionStatus(selection, betEventResult)

          return (
            <div
              key={index}
              className={`p-4 py-3 bg-slate-200 ${index < bet.selections.length - 1 ? 'border-b border-slate-200' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-base font-semibold text-slate-800 flex flex-wrap items-center">
                    {betEvent.title}
                  </div>
                  <div className="text-sm font-semibold text-slate-700 flex flex-row flex-wrap items-center ">
                    {(betEventResult?.team || betEvent.team)?.map((team, idx, arr) => (
                      <div key={team.id} className="flex items-center">
                        <span>{team.name}</span>
                        {idx < arr.length - 1 && <span className="text-blue-500 mx-1">vs</span>}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mb-3 ">bet id: {betEvent.id}</p>
                </div>
                {/* Logic fix: Display the status for each individual selection */}
                {bet.status !== 'pending' && (
                  <Badge
                    variant={
                      selectionStatus === 'won'
                        ? 'default'
                        : selectionStatus === 'lost'
                          ? 'destructive'
                          : 'outline'
                    }
                    className={
                      selectionStatus === 'won'
                        ? 'bg-green-500 text-white'
                        : selectionStatus === 'lost'
                          ? 'bg-red-500 text-white'
                          : ''
                    }
                  >
                    {selectionStatus === 'won'
                      ? 'Wygrany'
                      : selectionStatus === 'lost'
                        ? 'Przegrany'
                        : 'W grze'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-sm bg-slate-100 p-2 rounded-md">
                <p className="text-slate-600">
                  Twój typ:{' '}
                  <span className="font-bold text-slate-900">{selection.selectedOutcomeName}</span>
                </p>
                <p className="text-slate-600">
                  Kurs:{' '}
                  <span className="font-bold text-slate-900">{selection.odds.toFixed(2)}</span>
                </p>
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

  // Performance fix: Memoize filtered bets to prevent recalculation on every render
  const activeBets = useMemo(
    () => initialBets.filter((bet) => bet.status === 'pending'),
    [initialBets],
  )
  const settledBets = useMemo(
    () => initialBets.filter((bet) => bet.status === 'won' || bet.status === 'lost'),
    [initialBets],
  )

  // Performance fix: Create a lookup map for event results for fast O(1) access.
  // This prevents passing the entire results array to each card and repeatedly searching it.
  const resultsMap = useMemo(() => {
    const map = new Map<string, Bet>()
    if (resultOfEventBeted) {
      for (const result of resultOfEventBeted) {
        map.set(result.id, result)
      }
    }
    return map
  }, [resultOfEventBeted])

  const betsToShow = activeTab === 'active' ? activeBets : settledBets

  return (
    <div className="min-h-screen w-full bg-slate-50 ">
      <main className="max-w-screen-lg mx-auto w-full pb-6 px-1  ">
        {/* Tabs for filtering */}
        <div className="flex border-b mb-6">
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
            betsToShow.map((bet) => <BetCard key={bet.id} bet={bet} resultsMap={resultsMap} />)
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
