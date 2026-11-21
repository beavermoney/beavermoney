import { InvestmentArchiveAction } from '@/components/investment-archive-action'
import { useBackNavigation } from '@/hooks/use-back-navigation'
import { Suspense, useState } from 'react'
import { NetWorthChart } from '@/routes/_user/household/$householdId/accounts/-components/net-worth-chart'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { AverageCostEditor } from '@/components/average-cost-editor'
import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { Divider } from '@astryxdesign/core/Divider'
import { Grid } from '@astryxdesign/core/Grid'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { createFileRoute } from '@tanstack/react-router'
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
        ...investmentArchiveActionFragment
      }
    }
    household {
      ...transactionsListFragment @arguments(where: $where)
    }
  }
`

const investmentIdDetailFragment = graphql`
  fragment InvestmentIdDetailFragment on Investment {
    id
    householdCurrency {
      code
    }
    archived
    averageNeedsReview
    costBasis
    averageCost
    unrealizedReturn
    unrealizedReturnPercent
  }
`

function RouteComponent() {
  const { t } = useLingui()
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

  invariant(data.node, t`Investment not found`)

  const goBack = useBackNavigation()

  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="horizontal" gap={4} justify="between" wrap="wrap">
        <Button
          onClick={() =>
            goBack({
              to: '/household/$householdId/investments',
              params: { householdId: params.householdId },
              search: (previous) => previous,
            })
          }
          label={t`Back`}
          width="fit-content"
          variant={'secondary'}
        >
          <Trans>Back</Trans>
        </Button>
        <InvestmentArchiveAction fragmentRef={data.node} />
      </Stack>
      <Stack direction="vertical" gap={4}>
        <InvestmentCard fragmentRef={data.node} showReturn={false} />
      </Stack>
      <InvestmentDetail fragmentRef={data.node} />
      <NetWorthChart investmentId={params.investmentId} />
      <Divider />
      <TransactionsList fragmentRef={data.household} />
    </Stack>
  )
}

type InvestmentDetailProps = {
  fragmentRef: InvestmentIdDetailFragment$key
}

function InvestmentDetail({ fragmentRef }: InvestmentDetailProps) {
  const { t } = useLingui()
  const [editing, setEditing] = useState(false)
  const data = useFragment(investmentIdDetailFragment, fragmentRef)
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { isPrivacyModeEnabled } = usePrivacyMode()

  const unrealizedReturn = currency(data.unrealizedReturn ?? 0, {
    precision: 8,
  })
  const unrealizedReturnPercent =
    parseFloat(data.unrealizedReturnPercent ?? '0') * 100
  const isPositive = unrealizedReturn.value > 0
  const isNegative = unrealizedReturn.value < 0

  const formattedReturn = formatCurrencyWithPrivacyMode({
    value: data.unrealizedReturn ?? '0',
    currencyCode: data.householdCurrency.code,
  })
  const signedReturn =
    !isPrivacyModeEnabled && isPositive
      ? `+${formattedReturn}`
      : formattedReturn
  const formattedPercent = `${Math.abs(unrealizedReturnPercent).toFixed(2)}%`
  const signedPercent = isPrivacyModeEnabled
    ? '•••'
    : isPositive
      ? `+${formattedPercent}`
      : isNegative
        ? `−${formattedPercent}`
        : formattedPercent

  return (
    <Card>
      <Stack direction="vertical" gap={4}>
        <Stack
          direction="horizontal"
          gap={3}
          as="header"
          justify="between"
          align="center"
          wrap="wrap"
        >
          <Heading level={2}>
            <Trans>Holding details</Trans>
          </Heading>
          <Button
            isDisabled={data.archived}
            className="shrink-0"
            label={editing ? t`Close` : t`Update average`}
            onClick={() => setEditing((value) => !value)}
          />
        </Stack>
        <Stack direction="vertical" gap={4}>
          {data.averageNeedsReview && (
            <Text type="label">{t`Average cost needs review`}</Text>
          )}
          <Grid columns={{ minWidth: 140, max: 4, repeat: 'fit' }} gap={4}>
            <Stack direction="vertical" gap={1}>
              <Text type="supporting">
                <Trans>Cost Basis</Trans>
              </Text>
              <Text type="label" hasTabularNumbers>
                {data.costBasis == null
                  ? '—'
                  : formatCurrencyWithPrivacyMode({
                      value: data.costBasis,
                      currencyCode: data.householdCurrency.code,
                    })}
              </Text>
            </Stack>
            <Stack direction="vertical" gap={1}>
              <Text type="supporting">
                <Trans>Avg Cost / Share</Trans>
              </Text>
              <Text type="label" hasTabularNumbers>
                {data.averageCost == null
                  ? '—'
                  : formatCurrencyWithPrivacyMode({
                      value: data.averageCost,
                      currencyCode: data.householdCurrency.code,
                    })}
              </Text>
            </Stack>
            <Stack direction="vertical" gap={1}>
              <Text type="supporting">
                <Trans>Unrealized return</Trans>
              </Text>
              <Text type="label" hasTabularNumbers>
                {data.unrealizedReturn === null ? '—' : signedReturn}
              </Text>
            </Stack>
            <Stack direction="vertical" gap={1}>
              <Text type="supporting">
                <Trans>Unrealized return %</Trans>
              </Text>
              <Text type="label" hasTabularNumbers>
                {data.unrealizedReturnPercent === null ? '—' : signedPercent}
              </Text>
            </Stack>
          </Grid>
          {editing && (
            <Suspense fallback={<Text>{t`Loading holding…`}</Text>}>
              <AverageCostEditor
                investmentId={data.id}
                onSaved={() => setEditing(false)}
              />
            </Suspense>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}
