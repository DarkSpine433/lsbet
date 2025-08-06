import React, { cache } from 'react'
import { getMeUser } from '@/utilities/getMeUser'
import Link from 'next/link'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import configPromise from '@payload-config'
import dynamic from 'next/dynamic'
import CircularProgress from '@mui/material/CircularProgress'

const PageClient = dynamic(() => import('./page.client'), {
  loading: () => <CircularProgress className="mx-auto [&>*]:text-blue-500" />,
})
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const page = async (props: Props) => {
  const { searchParams } = props
  const params = await searchParams
  const { category } = await params
  const { user } = await getMeUser()
  const getCategories = await getCashedCategories()
  const getBets = await getBetsByCategory({ category: category as string })
  return (
    <>
      <PageClient
        nickname={user.email.split('@')[0]}
        categories={getCategories}
        bets={getBets}
        money={user.money || 0}
      />
    </>
  )
}
const getCashedCategories = cache(async () => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'categories',
  })

  return result.docs || []
})
const getBetsByCategory = cache(async ({ category }: { category: string }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'bets',
    where: {
      or: [
        {
          'category.title': {
            equals: category,
          },
        },
      ],
    },
  })

  return result.docs
})
export default page

type BetOutcome = 'teamAWin' | 'draw' | 'teamBWin'

interface AnalyzeMatchBetInput {
  teamAName: string
  teamBName: string
  oddsTeamA: number
  oddsDraw: number
  oddsTeamB: number
  stake?: number
  selectedOutcome: BetOutcome
  yourProbability?: number // optional, 0-1
}

interface AnalyzeMatchBetResult {
  impliedProbabilities: Record<BetOutcome, number>
  margin: number
  grossWinnings: number
  netProfit: number
  selectedOdds: number
  valueBet: {
    expectedValue: number
    isValue: boolean
  } | null
  label: string
}

function analyzeMatchBet(input: AnalyzeMatchBetInput): AnalyzeMatchBetResult {
  const {
    teamAName,
    teamBName,
    oddsTeamA,
    oddsDraw,
    oddsTeamB,
    stake = 100,
    selectedOutcome,
    yourProbability,
  } = input

  const odds: Record<BetOutcome, number> = {
    teamAWin: oddsTeamA,
    draw: oddsDraw,
    teamBWin: oddsTeamB,
  }

  const pA = 1 / oddsTeamA
  const pX = 1 / oddsDraw
  const pB = 1 / oddsTeamB

  const totalProb = pA + pX + pB

  const impliedProbabilities: Record<BetOutcome, number> = {
    teamAWin: +(pA / totalProb).toFixed(4),
    draw: +(pX / totalProb).toFixed(4),
    teamBWin: +(pB / totalProb).toFixed(4),
  }

  const margin = +(totalProb - 1).toFixed(4) * 100

  const selectedOdds = odds[selectedOutcome]
  const grossWinnings = stake * selectedOdds
  const netProfit = grossWinnings - stake

  let valueBet: AnalyzeMatchBetResult['valueBet'] = null
  if (yourProbability !== undefined) {
    const EV = yourProbability * selectedOdds - 1
    valueBet = {
      expectedValue: +(EV * 100).toFixed(2),
      isValue: EV > 0,
    }
  }

  // Optional label for UI or logs
  const outcomeLabels: Record<BetOutcome, string> = {
    teamAWin: `${teamAName} wins`,
    draw: `Draw`,
    teamBWin: `${teamBName} wins`,
  }

  return {
    impliedProbabilities,
    margin: +margin.toFixed(2),
    grossWinnings: +grossWinnings.toFixed(2),
    netProfit: +netProfit.toFixed(2),
    selectedOdds,
    valueBet,
    label: outcomeLabels[selectedOutcome],
  }
}
