import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { Divider } from '@astryxdesign/core/Divider'
import { Grid } from '@astryxdesign/core/Grid'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import currency from 'currency.js'
import {
  fetchQuery,
  loadQuery,
  useFragment,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import type { TransactionWhereInput } from '../transactions/-components/__generated__/transactionsListRefetch.graphql'
import { TransactionsList } from '../transactions/-components/transactions-list'
import { InvestmentCard } from './-components/investment-card'
import type { InvestmentIdDetailFragment$key } from './__generated__/InvestmentIdDetailFragment.graphql'
import type { InvestmentIdQuery } from './__generated__/InvestmentIdQuery.graphql'

import { useCurrency } from '@/hooks/use-currency'

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
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={4}>
        <Button
          onClick={() => navigate({ to: '..' })}
          label={'Back'}
          width="fit-content"
          variant={'secondary'}
        >
          Back
        </Button>
      </Stack>
      <Stack direction="vertical" gap={4}>
        <InvestmentCard fragmentRef={data.node} showReturn={false} />
      </Stack>
      <InvestmentDetail fragmentRef={data.node} />
      <Divider />
      <TransactionsList fragmentRef={data.household} />
    </Stack>
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

  return (
    <Card>
      <Stack direction="vertical" gap={4}>
        <Stack direction="vertical" gap={2} as="header">
          <Heading level={2}>Performance</Heading>
        </Stack>
        <Stack direction="vertical" gap={4}>
          <Grid columns={{ minWidth: 140, max: 4, repeat: 'fit' }} gap={4}>
            <Stack direction="vertical" gap={1}>
              <Text type="supporting">Cost Basis</Text>
              <Text type="label" hasTabularNumbers>
                {formatCurrencyWithPrivacyMode({
                  value: data.costBasis,
                  currencyCode: data.householdCurrency.code,
                })}
              </Text>
            </Stack>
            <Stack direction="vertical" gap={1}>
              <Text type="supporting">Avg Cost / Share</Text>
              <Text type="label" hasTabularNumbers>
                {formatCurrency({
                  value: data.averageCost,
                  currencyCode: data.householdCurrency.code,
                })}
              </Text>
            </Stack>
            <Stack direction="vertical" gap={1}>
              <Text type="supporting">Unrealized Return</Text>
              <Text type="label" hasTabularNumbers>
                {signedReturn}
              </Text>
            </Stack>
            <Stack direction="vertical" gap={1}>
              <Text type="supporting">Return %</Text>
              <Text type="label" hasTabularNumbers>
                {signedPercent}
              </Text>
            </Stack>
          </Grid>
        </Stack>
      </Stack>
    </Card>
  )
}
