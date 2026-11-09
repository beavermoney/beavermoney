import { Layout, LayoutHeader, LayoutContent } from '@astryxdesign/core/Layout'
import { FinancialSummaryCards } from '@/components/financial-summary-cards'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { parseISO } from 'date-fns'
import { useFragment, useRelayEnvironment } from 'react-relay'
import { graphql } from 'relay-runtime'
import { DatePeriodFilter as DateRangeFilter } from '@/components/date-period-filter'
import type { transactionsPanelFragment$key } from './__generated__/transactionsPanelFragment.graphql'
import {
  transactionRangeVariables,
  withPreparedTransactionRange,
} from '../-data/transaction-range'
import { TransactionsList } from './transactions-list'

const transactionsPanelFragment = graphql`
  fragment transactionsPanelFragment on Household
  @refetchable(queryName: "transactionsPanelRefetchQuery")
  @argumentDefinitions(
    where: { type: "TransactionWhereInput" }
    startDate: { type: "Time!" }
    endDate: { type: "Time!" }
    viewUserIds: { type: "[ID!]" }
  ) {
    ...transactionsListFragment @arguments(where: $where)
    financialReport(
      period: { startDate: $startDate, endDate: $endDate }
      viewUserIDs: $viewUserIds
    ) {
      ...financialSummaryCardsFragment
    }
  }
`

type TransactionsPanelProps = {
  fragmentRef: transactionsPanelFragment$key
}

export function TransactionsPanel({ fragmentRef }: TransactionsPanelProps) {
  const search = useSearch({
    from: '/_user/household/$householdId/transactions',
  })
  const startDate = parseISO(search.start).toISOString()
  const endDate = parseISO(search.end).toISOString()
  const navigate = useNavigate()
  const environment = useRelayEnvironment()
  const { viewUserIds } = useHouseholdViewScope()

  const data = useFragment(transactionsPanelFragment, fragmentRef)

  const onDateRangeChange = async (start: string, end: string) => {
    await withPreparedTransactionRange(
      environment,
      transactionRangeVariables(start, end, viewUserIds ?? null),
      () =>
        navigate({
          to: '.',
          resetScroll: false,
          search: (prev) => ({ ...prev, start, end }),
        }),
    )
  }

  const dateFilter = (
    <DateRangeFilter
      startDate={startDate}
      endDate={endDate}
      onDateRangeChange={onDateRangeChange}
    />
  )

  return (
    <Layout
      height="fill"
      padding={6}
      header={
        <LayoutHeader label="Transaction filters">
          <Stack direction="vertical" gap={6}>
            <Heading level={1}>Transactions</Heading>
            {dateFilter}
          </Stack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <Stack direction="vertical" gap={6}>
            <FinancialSummaryCards fragmentRef={data.financialReport} />
            <TransactionsList
              key={`${startDate}-${endDate}-${viewUserIds?.join(',') ?? 'all'}`}
              fragmentRef={data}
            />
          </Stack>
        </LayoutContent>
      }
    />
  )
}
