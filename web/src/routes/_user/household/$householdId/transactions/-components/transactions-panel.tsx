import { fetchQuery, graphql } from 'relay-runtime'
import { useFragment, useRelayEnvironment } from 'react-relay'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import type { LinkOptions } from '@tanstack/react-router'
import { TransactionsList } from './transactions-list'
import type { transactionsPanelFragment$key } from './__generated__/transactionsPanelFragment.graphql'
import type { transactionsPanelRefetchQuery } from './__generated__/transactionsPanelRefetchQuery.graphql'
import transactionsPanelRefetchQueryNode from './__generated__/transactionsPanelRefetchQuery.graphql'
import { DateRangeFilter } from '../../categories/-components/date-range-filter'
import { FinancialSummaryCards } from '@/components/financial-summary-cards'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { useHousehold } from '@/hooks/use-household'
import { Fragment, useMemo } from 'react'
import { PlusButton } from '@/components/plus-button'
import { useIsMobile } from '@/hooks/use-mobile'
import { parseISO } from 'date-fns'
import type { TransactionWhereInput } from './__generated__/transactionsListRefetch.graphql'

const transactionsPanelFragment = graphql`
  fragment transactionsPanelFragment on Household
  @refetchable(queryName: "transactionsPanelRefetchQuery")
  @argumentDefinitions(
    where: { type: "TransactionWhereInput" }
    startDate: { type: "Time!" }
    endDate: { type: "Time!" }
  ) {
    ...transactionsListFragment @arguments(where: $where)
    financialReport(period: { startDate: $startDate, endDate: $endDate }) {
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
  const { householdId } = useParams({ from: '/_user/household/$householdId' })
  const isMobile = useIsMobile()

  const data = useFragment(transactionsPanelFragment, fragmentRef)

  const onDateRangeChange = async (start: string, end: string) => {
    const period = parseDateRangeFromURL(start, end)
    const nextWhere: TransactionWhereInput = {
      datetimeGTE: period.startDate,
      datetimeLT: period.endDate,
    }

    await fetchQuery<transactionsPanelRefetchQuery>(
      environment,
      transactionsPanelRefetchQueryNode,
      {
        id: household.id,
        where: nextWhere,
        startDate: period.startDate,
        endDate: period.endDate,
      },
    ).toPromise()

    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        start,
        end,
      }),
    })
  }

  const plusButtonLinkOptions = useMemo<LinkOptions>(
    () =>
      isMobile
        ? {
            to: '/household/$householdId/transactions/new',
            params: { householdId },
          }
        : {
            to: '.',
            search: (prev) => ({ ...prev, log_type: 'expense' }),
          },
    [isMobile, householdId],
  )

  return (
    <Fragment>
      <div className="fixed right-4 bottom-4 lg:absolute">
        <PlusButton {...plusButtonLinkOptions} />
      </div>
      <FinancialSummaryCards fragmentRef={data.financialReport} />
      <div className="py-2"></div>
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={onDateRangeChange}
      />
      <div className="py-2"></div>
      <TransactionsList fragmentRef={data} />
    </Fragment>
  )
}
