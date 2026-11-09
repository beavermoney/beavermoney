import { FinancialSummaryCards } from '@/components/financial-summary-cards'
import { useHousehold } from '@/hooks/use-household'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { parseISO } from 'date-fns'
import { useFragment, useRelayEnvironment } from 'react-relay'
import { fetchQuery, graphql } from 'relay-runtime'
import { DatePeriodFilter as DateRangeFilter } from '@/components/date-period-filter'
import type { TransactionWhereInput } from './__generated__/transactionsListRefetch.graphql'
import type { transactionsPanelFragment$key } from './__generated__/transactionsPanelFragment.graphql'
import type { transactionsPanelRefetchQuery } from './__generated__/transactionsPanelRefetchQuery.graphql'
import transactionsPanelRefetchQueryNode from './__generated__/transactionsPanelRefetchQuery.graphql'
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
  const { household } = useHousehold()
  const { viewUserIds } = useHouseholdViewScope()

  const data = useFragment(transactionsPanelFragment, fragmentRef)

  const onDateRangeChange = async (start: string, end: string) => {
    const period = parseDateRangeFromURL(start, end)
    const nextWhere: TransactionWhereInput = {
      datetimeGTE: period.startDate,
      datetimeLT: period.endDate,
      ...(viewUserIds !== null && {
        hasTransactionEntriesWith: [
          { hasAccountWith: [{ userIDIn: viewUserIds }] },
        ],
      }),
    }

    await fetchQuery<transactionsPanelRefetchQuery>(
      environment,
      transactionsPanelRefetchQueryNode,
      {
        id: household.id,
        where: nextWhere,
        startDate: period.startDate,
        endDate: period.endDate,
        viewUserIds: viewUserIds ?? null,
      },
    ).toPromise()

    await navigate({
      to: '.',
      resetScroll: false,
      search: (prev) => ({
        ...prev,
        start,
        end,
      }),
    })
  }

  const dateFilter = (
    <DateRangeFilter
      startDate={startDate}
      endDate={endDate}
      onDateRangeChange={onDateRangeChange}
    />
  )

  return (
    <Stack direction="vertical" gap={6}>
      <Stack direction="vertical" gap={1}>
        <Heading level={1}>Transactions</Heading>
      </Stack>
      {dateFilter}
      <FinancialSummaryCards fragmentRef={data.financialReport} />
      <TransactionsList
        key={`${startDate}-${endDate}-${viewUserIds?.join(',') ?? 'all'}`}
        fragmentRef={data}
      />
    </Stack>
  )
}
