import { useNavigate, useSearch } from '@tanstack/react-router'
import { RefreshCwIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { graphql, useFragment, useMutation } from 'react-relay'
import invariant from 'tiny-invariant'

import { Button } from '@/components/ui/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrency } from '@/hooks/use-currency'
import { useHousehold } from '@/hooks/use-household'
import { calculateNextPaymentDate } from '@/lib/date-range'
import currency from 'currency.js'

import { SubscriptionCard } from './subscription-card'

import type { subscriptionsPanelFragment$key } from './__generated__/subscriptionsPanelFragment.graphql'
import type { subscriptionsPanelRefreshMutation } from './__generated__/subscriptionsPanelRefreshMutation.graphql'
import { PlusButton } from '@/components/plus-button'

const SubscriptionsPanelFragment = graphql`
  fragment subscriptionsPanelFragment on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 50 }
    cursor: { type: "Cursor" }
  )
  @refetchable(queryName: "subscriptionsPanelRefetch") {
    recurringSubscriptions(first: $count, after: $cursor)
      @connection(key: "subscriptionsPanel_recurringSubscriptions") {
      edges {
        node {
          id
          active
          cost
          fxRate
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

const SubscriptionsPanelRefreshMutation = graphql`
  mutation subscriptionsPanelRefreshMutation {
    refresh
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

type SummaryDisplay = 'monthly' | 'yearly' | 'count'

export function SubscriptionsPanel({ fragmentRef }: SubscriptionsPanelProps) {
  const data = useFragment(SubscriptionsPanelFragment, fragmentRef)
  const { household } = useHousehold()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const navigate = useNavigate()

  // Read sort_by from URL
  const search = useSearch({
    from: '/_user/household/$householdId/subscriptions',
  })
  const sortBy = search.sort_by

  const [summaryDisplay, setSummaryDisplay] =
    useState<SummaryDisplay>('monthly')

  const [commitRefresh, isRefreshing] =
    useMutation<subscriptionsPanelRefreshMutation>(
      SubscriptionsPanelRefreshMutation,
    )

  const handleRefresh = () => {
    commitRefresh({
      variables: {},
      onCompleted: () => {
        // Mutation will trigger refetch automatically
      },
    })
  }

  const handleSummaryClick = () => {
    setSummaryDisplay((prev) => {
      if (prev === 'monthly') return 'yearly'
      if (prev === 'yearly') return 'count'
      return 'monthly'
    })
  }

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
      // Filter active subscriptions and remove nulls
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
        const costInHouseholdCurrency = currency(sub.cost).multiply(sub.fxRate)
        switch (sub.interval) {
          case 'week':
            return costInHouseholdCurrency
              .divide(sub.intervalCount)
              .multiply(52)
          case 'month':
            return costInHouseholdCurrency
              .divide(sub.intervalCount)
              .multiply(12)
          case 'year':
            return costInHouseholdCurrency.divide(sub.intervalCount)
          default:
            invariant(false, `unexpected interval type: ${sub.interval}`)
        }
      }
      // Calculate total yearly cost first, then divide for monthly
      const yearlyTotal = activeSubscriptions.reduce((total, sub) => {
        return total.add(getYearlyEquivalent(sub))
      }, currency(0))

      const totalMonthly = yearlyTotal.divide(12)

      // Sort subscriptions
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
    }, [data, sortBy])

  const summaryContent = useMemo(() => {
    switch (summaryDisplay) {
      case 'monthly':
        return {
          label: 'Average Monthly Spend',
          value: formatCurrencyWithPrivacyMode({
            value: monthlyAverage,
            currencyCode: household.currency.code,
          }),
        }
      case 'yearly':
        return {
          label: 'Average Yearly Spend',
          value: formatCurrencyWithPrivacyMode({
            value: yearlyAverage,
            currencyCode: household.currency.code,
          }),
        }
      case 'count':
        return {
          label: 'Active Subscriptions',
          value: activeCount.toString(),
        }
    }
  }, [
    summaryDisplay,
    monthlyAverage,
    yearlyAverage,
    activeCount,
    formatCurrencyWithPrivacyMode,
    household.currency.code,
  ])

  return (
    <Fragment>
      <div className="fixed right-4 bottom-4 flex flex-col items-end gap-2 lg:absolute">
        <Button
          variant="outline"
          nativeButton={true}
          size="icon-xl"
          className="bg-background dark:bg-card rounded-full"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCwIcon className={isRefreshing ? 'animate-spin' : ''} />
        </Button>
        <PlusButton />
      </div>

      {/* Summary Card */}
      <Item
        variant="outline"
        className="cursor-pointer"
        onClick={handleSummaryClick}
      >
        <ItemContent>
          <ItemDescription>{summaryContent.label}</ItemDescription>
          <ItemTitle className="text-xl tabular-nums">
            {summaryContent.value}
          </ItemTitle>
        </ItemContent>
      </Item>

      <div className="py-2"></div>

      {/* Sort Dropdown */}
      <div className="flex items-center p-0">
        <Item size="xs" className="py-0">
          <ItemTitle>
            {activeCount <= 1
              ? `${activeCount.toString()} subscription`
              : `${activeCount.toString()} subscriptions`}
          </ItemTitle>
        </Item>
        <div className="grow"></div>
        <Select
          name="sort-subscriptions"
          value={sortBy}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue>{SORT_OPTIONS[sortBy]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(Object.entries(SORT_OPTIONS) as [SortOption, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="py-2"></div>

      {/* Subscriptions List */}
      <ItemGroup className="gap-0">
        {sortedSubscriptions.map((subscription, index) => (
          <Fragment key={subscription.id}>
            {index > 0 && <ItemSeparator className="my-1" />}
            <SubscriptionCard fragmentRef={subscription} />
          </Fragment>
        ))}
        {sortedSubscriptions.length === 0 && (
          <div className="text-muted-foreground py-8 text-center text-sm">
            No active subscriptions
          </div>
        )}
      </ItemGroup>
    </Fragment>
  )
}
