'use client'

import { useState, FC, useMemo } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ticket, History, Trophy, TrendingUp, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { PlacedBet, Bet } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'

type MyBetsPageClientProps = {
  nickname: string
  money?: number
  initialBets: PlacedBet[]
  resultOfEventBeted: Bet[]
}

const getSelectionStatus = (
  selection: PlacedBet['selections'][0],
  result?: Bet,
): 'won' | 'lost' | 'pending' => {
  if (!result || !result.endevent) return 'pending'
  const { selectedOutcomeName } = selection
  const isDrawResult = result.typeofbet === 'draw'
  if (isDrawResult) return selectedOutcomeName === 'Remis' ? 'won' : 'lost'
  const winningTeam = result.team?.find((team) => team['win-lose'])
  if (winningTeam) return selectedOutcomeName === winningTeam.name ? 'won' : 'lost'
  return 'lost'
}

const BetCard: FC<{ bet: PlacedBet; resultsMap: Map<string, Bet> }> = ({ bet, resultsMap }) => {
  const isCombined = bet.betType === 'combined'
  const isWon = bet.status === 'won'
  const isLost = bet.status === 'lost'

  return (
    <Card className="w-full bg-slate-900/40 border-slate-800 overflow-hidden backdrop-blur-sm hover:border-slate-700 transition-all duration-300">
      <CardHeader className="p-4 border-b border-slate-800/50 bg-slate-900/20">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <CardTitle className="text-white font-black italic uppercase tracking-tighter text-lg">
              {isCombined ? (
                <span className="flex items-center gap-2 text-blue-500">
                  <TrendingUp className="h-4 w-4" /> Kupon AKO ({bet.selections.length})
                </span>
              ) : (
                (bet.selections[0].betEvent as Bet)?.title
              )}
            </CardTitle>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <Clock className="h-3 w-3" /> {formatDateTime(bet.createdAt, true)}
            </div>
          </div>
          <Badge
            className={`
            ${
              isWon
                ? 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                : isLost
                  ? 'bg-red-500/20 text-red-400 border-red-500/50'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/50'
            } 
            border px-3 py-1 font-black italic uppercase text-[10px] tracking-widest
          `}
          >
            {isWon ? 'Wygrany' : isLost ? 'Przegrany' : 'W grze'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {bet.selections.map((selection, index) => {
          const betEvent = selection.betEvent as Bet
          const betEventResult = resultsMap.get(betEvent.id)
          const selectionStatus = getSelectionStatus(selection, betEventResult)

          return (
            <div
              key={index}
              className={`p-4 ${index < bet.selections.length - 1 ? 'border-b border-slate-800/30' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1">
                  <div className="text-sm font-black text-slate-100 flex items-center gap-2 uppercase italic tracking-tight">
                    {(betEventResult?.team || betEvent.team)?.map((team, idx, arr) => (
                      <span key={team.id} className="flex items-center">
                        {team.name}
                        {idx < arr.length - 1 && (
                          <span className="text-blue-600 mx-2 not-italic text-[10px]">VS</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-600 font-bold tracking-widest uppercase">
                    ID: {betEvent.id}
                  </p>
                </div>

                {selectionStatus === 'won' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {selectionStatus === 'lost' && <XCircle className="h-4 w-4 text-red-500" />}
              </div>

              <div className="flex items-center justify-between text-[11px] bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                <div className="flex flex-col">
                  <span className="text-slate-500 font-black uppercase tracking-tighter text-[9px]">
                    Twój typ
                  </span>
                  <span className="text-white font-bold uppercase italic">
                    {selection.selectedOutcomeName}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-slate-500 font-black uppercase tracking-tighter text-[9px]">
                    Kurs
                  </span>
                  <span className="text-blue-400 font-black">{selection.odds.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>

      <CardFooter className="bg-blue-600/5 p-4 flex justify-between items-end border-t border-slate-800/50">
        <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
            Stawka
          </p>
          <p className="font-black text-white text-sm">
            {bet.stake?.toFixed(2)} <span className="text-blue-500 text-[10px]">$</span>
          </p>
        </div>

        {isCombined && (
          <div className="text-center space-y-1">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
              Kurs całkowity
            </p>
            <p className="font-black text-slate-300 text-sm">{bet.totalOdds?.toFixed(2)}</p>
          </div>
        )}

        <div className="text-right space-y-1">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
            {isWon ? 'Wygrana' : 'Potencjalna wygrana'}
          </p>
          <p
            className={`font-black text-lg italic tracking-tighter leading-none ${isWon ? 'text-green-400' : isLost ? 'text-slate-600 line-through' : 'text-blue-500'}`}
          >
            {isWon ? `+${bet.potentialWin?.toFixed(2)}` : bet.potentialWin?.toFixed(2)}{' '}
            <span className="text-[10px]">$</span>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function MyBetsPageClient({
  initialBets,
  resultOfEventBeted,
}: MyBetsPageClientProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'settled'>('active')

  const activeBets = useMemo(
    () => initialBets.filter((bet) => bet.status === 'pending'),
    [initialBets],
  )
  const settledBets = useMemo(
    () => initialBets.filter((bet) => bet.status === 'won' || bet.status === 'lost'),
    [initialBets],
  )

  const resultsMap = useMemo(() => {
    const map = new Map<string, Bet>()
    resultOfEventBeted?.forEach((res) => map.set(res.id, res))
    return map
  }, [resultOfEventBeted])

  const betsToShow = activeTab === 'active' ? activeBets : settledBets

  return (
    <div className="w-full">
      {/* Segmented Control Tabs */}
      <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-8 max-w-sm mx-auto">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Ticket className="h-3.5 w-3.5" /> Aktywne ({activeBets.length})
        </button>
        <button
          onClick={() => setActiveTab('settled')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'settled'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <History className="h-3.5 w-3.5" /> Rozliczone ({settledBets.length})
        </button>
      </div>

      {/* Bets List */}
      <div className="space-y-6 pb-10">
        {betsToShow.length > 0 ? (
          betsToShow.map((bet) => <BetCard key={bet.id} bet={bet} resultsMap={resultsMap} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800">
            <div className="p-4 rounded-full bg-slate-900 border border-slate-800">
              <Trophy className="h-10 w-10 text-slate-700" />
            </div>
            <div>
              <p className="text-white font-black uppercase tracking-widest italic">
                Brak zakładów
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                Twoja historia pojawi się tutaj po rozliczeniu gier.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
