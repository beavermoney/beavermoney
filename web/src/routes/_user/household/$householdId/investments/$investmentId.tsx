import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  useFragment,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import currency from 'currency.js'
import invariant from 'tiny-invariant'
import { TransactionsList } from '../transactions/-components/transactions-list'
import { InvestmentCard } from './-components/investment-card'
import type { InvestmentIdQuery } from './__generated__/InvestmentIdQuery.graphql'
import type { InvestmentIdDetailFragment$key } from './__generated__/InvestmentIdDetailFragment.graphql'
import type { TransactionWhereInput } from '../transactions/-components/__generated__/transactionsListRefetch.graphql'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCurrency } from '@/hooks/use-currency'
import { cn } from '@/lib/utils'

export const Route = createFileRoute(
  '/_user/household/$householdId/investments/$investmentId',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadQuery<InvestmentIdQuery>(
      environment,
      InvestmentIdQuery,
      {
        id: params.investmentId,
        where: {
          hasInvestmentLotsWith: [
            { hasInvestmentWith: [{ id: params.investmentId }] },
          ],
        },
      },
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const InvestmentIdQuery = graphql`
  query InvestmentIdQuery($id: ID!, $where: TransactionWhereInput) {
    node(id: $id) {
      ... on Investment {
        ...investmentCardFragment
        ...InvestmentIdDetailFragment
      }
    }
    household {
      ...transactionsListFragment @arguments(where: $where)
    }
  }
`

const investmentIdDetailFragment = graphql`
  fragment InvestmentIdDetailFragment on Investment {
    householdCurrency {
      code
    }
    costBasis
    averageCost
    unrealizedReturn
    unrealizedReturnPercent
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const where: TransactionWhereInput = {
    hasInvestmentLotsWith: [
      { hasInvestmentWith: [{ id: params.investmentId }] },
    ],
  }

  const data = usePreloadedQuery<InvestmentIdQuery>(InvestmentIdQuery, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      InvestmentIdQuery,
      {
        id: params.investmentId,
        where,
      },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  invariant(data.node, 'Investment not found')

  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="secondary" onClick={() => navigate({ to: '..' })}>
          Back
        </Button>
      </div>
      <div className="bg-muted/50 rounded-md">
        <InvestmentCard fragmentRef={data.node} />
      </div>
      <InvestmentDetail fragmentRef={data.node} />
      <Separator />
      <TransactionsList fragmentRef={data.household} />
    </div>
  )
}

type InvestmentDetailProps = {
  fragmentRef: InvestmentIdDetailFragment$key
}

function InvestmentDetail({ fragmentRef }: InvestmentDetailProps) {
  const data = useFragment(investmentIdDetailFragment, fragmentRef)
  const { formatCurrency, formatCurrencyWithPrivacyMode } = useCurrency()

  const unrealizedReturn = currency(data.unrealizedReturn, { precision: 8 })
  const unrealizedReturnPercent = parseFloat(data.unrealizedReturnPercent) * 100
  const isPositive = unrealizedReturn.value > 0
  const isNegative = unrealizedReturn.value < 0

  const formattedReturn = formatCurrencyWithPrivacyMode({
    value: data.unrealizedReturn,
    currencyCode: data.householdCurrency.code,
  })
  const signedReturn = isPositive ? `+${formattedReturn}` : formattedReturn
  const formattedPercent = `${Math.abs(unrealizedReturnPercent).toFixed(2)}%`
  const signedPercent = isPositive
    ? `+${formattedPercent}`
    : isNegative
      ? `−${formattedPercent}`
      : formattedPercent

  const returnClassName = cn(
    'text-sm font-semibold tabular-nums',
    isPositive && 'text-emerald-600 dark:text-emerald-400',
    isNegative && 'text-red-600 dark:text-red-400',
    !isPositive && !isNegative && 'text-muted-foreground',
  )

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-[0.6875rem] font-medium tracking-wider uppercase">
              Cost Basis
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {formatCurrencyWithPrivacyMode({
                value: data.costBasis,
                currencyCode: data.householdCurrency.code,
              })}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-[0.6875rem] font-medium tracking-wider uppercase">
              Avg Cost / Share
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {formatCurrency({
                value: data.averageCost,
                currencyCode: data.householdCurrency.code,
              })}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-[0.6875rem] font-medium tracking-wider uppercase">
              Unrealized Return
            </span>
            <span className={returnClassName}>{signedReturn}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-[0.6875rem] font-medium tracking-wider uppercase">
              Return %
            </span>
            <span className={returnClassName}>{signedPercent}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
