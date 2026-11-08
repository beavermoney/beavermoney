import { Card } from '@astryxdesign/core/Card'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Grid } from '@astryxdesign/core/Grid'
import { Heading } from '@astryxdesign/core/Heading'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { List } from '@astryxdesign/core/List'
import { Section } from '@astryxdesign/core/Section'
import { Selector } from '@astryxdesign/core/Selector'
import { Text } from '@astryxdesign/core/Text'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useMemo } from 'react'
import { graphql, usePaginationFragment } from 'react-relay'
import invariant from 'tiny-invariant'

import { useIsMobile } from '@/hooks/use-mobile'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'

import { calculateNextPaymentDate } from '@/lib/date-range'
import currency from 'currency.js'

import { SubscriptionCard } from './subscription-card'

import { PageAddButton } from '@/components/page-add-button'
import { NodeType, useRegisterConnection } from '@/lib/relay'
import type { subscriptionsPanelFragment$key } from './__generated__/subscriptionsPanelFragment.graphql'

const SubscriptionsPanelFragment = graphql`
  fragment subscriptionsPanelFragment on Household
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 50 }
    cursor: { type: "Cursor" }
    viewUserIds: { type: "[ID!]" }
  )
  @refetchable(queryName: "subscriptionsPanelRefetch") {
    recurringSubscriptions(
      first: $count
      after: $cursor
      where: { userIDIn: $viewUserIds }
    ) @connection(key: "subscriptionsPanel_recurringSubscriptions") {
      __id
      edges {
        node {
          id
          active
          cost
          householdCurrency {
            code
          }
          interval
          intervalCount
          startDate
          name
          ...subscriptionCardFragment
        }
      }
    }
  }
`

type SubscriptionsPanelProps = {
  fragmentRef: subscriptionsPanelFragment$key
}

const SORT_OPTIONS = {
  cost_high: 'Cost (High to Low)',
  cost_low: 'Cost (Low to High)',
  next_payment: 'Next Payment',
  name_az: 'Name (A-Z)',
  name_za: 'Name (Z-A)',
} as const

type SortOption = keyof typeof SORT_OPTIONS

export function SubscriptionsPanel({ fragmentRef }: SubscriptionsPanelProps) {
  const isMobile = useIsMobile()
  const { data } = usePaginationFragment(
    SubscriptionsPanelFragment,
    fragmentRef,
  )
  const { displayCurrencyCode, convert } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const navigate = useNavigate()
  const { householdId } = useParams({
    from: '/_user/household/$householdId',
  })
  useRegisterConnection(
    data.recurringSubscriptions.__id,
    NodeType.RecurringSubscription,
  )

  const search = useSearch({
    from: '/_user/household/$householdId/subscriptions',
  })
  const sortBy = search.sort_by

  const handleSortChange = (newSortBy: string | null) => {
    if (!newSortBy) return
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        sort_by: newSortBy as SortOption,
      }),
    })
  }

  invariant(
    data.recurringSubscriptions,
    'recurringSubscriptions connection must be defined',
  )

  const { monthlyAverage, yearlyAverage, activeCount, sortedSubscriptions } =
    useMemo(() => {
      const edges = data.recurringSubscriptions.edges ?? []
      const activeSubscriptions = edges
        .filter((edge) => {
          return edge?.node?.active
        })
        .map((edge) => {
          invariant(edge?.node, 'subscription node must not be null')
          return edge.node
        })

      const getYearlyEquivalent = (sub: (typeof activeSubscriptions)[0]) => {
        const costInDisplayCurrency = convert(
          sub.cost,
          sub.householdCurrency.code,
        )
        switch (sub.interval) {
          case 'week':
            return costInDisplayCurrency.divide(sub.intervalCount).multiply(52)
          case 'month':
            return costInDisplayCurrency.divide(sub.intervalCount).multiply(12)
          case 'year':
            return costInDisplayCurrency.divide(sub.intervalCount)
          default:
            invariant(false, `unexpected interval type: ${sub.interval}`)
        }
      }

      const yearlyTotal = activeSubscriptions.reduce((total, sub) => {
        return total.add(getYearlyEquivalent(sub))
      }, currency(0))

      const totalMonthly = yearlyTotal.divide(12)

      const subscriptionsToSort = [...activeSubscriptions]

      subscriptionsToSort.sort((a, b) => {
        switch (sortBy) {
          case 'cost_high': {
            return getYearlyEquivalent(b).value - getYearlyEquivalent(a).value
          }
          case 'cost_low': {
            return getYearlyEquivalent(a).value - getYearlyEquivalent(b).value
          }
          case 'next_payment': {
            const aNext = calculateNextPaymentDate({
              startDate: a.startDate,
              interval: a.interval,
              intervalCount: a.intervalCount,
            })
            const bNext = calculateNextPaymentDate({
              startDate: b.startDate,
              interval: b.interval,
              intervalCount: b.intervalCount,
            })
            return aNext.getTime() - bNext.getTime()
          }
          case 'name_az':
            return a.name.localeCompare(b.name)
          case 'name_za':
            return b.name.localeCompare(a.name)
          default:
            invariant(false, `unexpected sort option: ${sortBy}`)
        }
      })

      return {
        monthlyAverage: totalMonthly,
        yearlyAverage: yearlyTotal,
        activeCount: activeSubscriptions.length,
        sortedSubscriptions: subscriptionsToSort,
      }
    }, [data, sortBy, convert])

  const inactiveSubscriptions = (
    data.recurringSubscriptions.edges ?? []
  ).flatMap((edge) => (edge?.node && !edge.node.active ? [edge.node] : []))

  return (
    <VStack gap={6}>
      <HStack hAlign="between" vAlign="center" wrap="wrap" gap={4}>
        <VStack gap={1}>
          <Heading level={1}>Subscriptions</Heading>
        </VStack>
        <PageAddButton
          label="Add subscription"
          to="/household/$householdId/subscriptions/new"
          params={{ householdId }}
        />
      </HStack>
      {activeCount > 0 &&
        (isMobile ? (
          <Card>
            <VStack gap={3}>
              <HStack hAlign="between" vAlign="center" gap={3} wrap="wrap">
                <Text color="secondary">Monthly spend</Text>
                <Text type="label" hasTabularNumbers>
                  {formatCurrencyWithPrivacyMode({
                    value: monthlyAverage,
                    currencyCode: displayCurrencyCode,
                  })}
                </Text>
              </HStack>
              <HStack hAlign="between" vAlign="center" gap={3} wrap="wrap">
                <Text color="secondary">Yearly spend</Text>
                <Text type="label" hasTabularNumbers>
                  {formatCurrencyWithPrivacyMode({
                    value: yearlyAverage,
                    currencyCode: displayCurrencyCode,
                  })}
                </Text>
              </HStack>
            </VStack>
          </Card>
        ) : (
          <Grid columns={2} gap={4}>
            {[
              { label: 'Monthly spend', value: monthlyAverage },
              { label: 'Yearly spend', value: yearlyAverage },
            ].map((metric) => (
              <Card key={metric.label}>
                <VStack gap={3}>
                  <Text color="secondary">{metric.label}</Text>
                  <Heading level={2}>
                    {formatCurrencyWithPrivacyMode({
                      value: metric.value,
                      currencyCode: displayCurrencyCode,
                    })}
                  </Heading>
                </VStack>
              </Card>
            ))}
          </Grid>
        ))}
      <Section padding={6}>
        <VStack gap={4}>
          <HStack hAlign="between" vAlign="center" gap={3} wrap="wrap">
            <Heading level={3}>
              Recurring payments{activeCount > 0 ? ` (${activeCount})` : ''}
            </Heading>
            {activeCount > 1 && (
              <Selector
                label="Sort subscriptions"
                isLabelHidden
                value={sortBy}
                onChange={handleSortChange}
                options={Object.entries(SORT_OPTIONS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            )}
          </HStack>
          {sortedSubscriptions.length ? (
            <List hasDividers edge="outset">
              {sortedSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  fragmentRef={subscription}
                />
              ))}
            </List>
          ) : (
            <EmptyState
              title="No subscriptions yet"
              description="Add a recurring payment to see your upcoming costs."
            />
          )}
          {inactiveSubscriptions.length > 0 && (
            <VStack gap={3}>
              <Heading level={3}>
                Inactive subscriptions ({inactiveSubscriptions.length})
              </Heading>
              <List hasDividers edge="outset">
                {inactiveSubscriptions.map((subscription) => (
                  <SubscriptionCard
                    key={subscription.id}
                    fragmentRef={subscription}
                    isActive={false}
                  />
                ))}
              </List>
            </VStack>
          )}
        </VStack>
      </Section>
    </VStack>
  )
}
