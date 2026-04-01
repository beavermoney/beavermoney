import { fetchQuery, graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { TransactionsList } from './transactions-list'
import type { transactionsPanelFragment$key } from './__generated__/transactionsPanelFragment.graphql'
import { DateRangeFilter } from '../../categories/-components/date-range-filter'
import { FinancialSummaryCards } from '@/components/financial-summary-cards'
import { environment } from '@/environment'
import { TransactionsQuery } from '../__generated__/TransactionsQuery.graphql'
import { transactionsQuery } from '../-transactions-query'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { Fragment } from 'react/jsx-runtime'
import { PlusButton } from '@/components/plus-button'
import type { TransactionWhereInput } from './__generated__/transactionsListRefetch.graphql'
import { parseISO } from 'date-fns'

const transactionsPanelFragment = graphql`
  fragment transactionsPanelFragment on Household
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

  const data = useFragment(transactionsPanelFragment, fragmentRef)
  const where: TransactionWhereInput = {
    datetimeGTE: startDate,
    datetimeLT: endDate,
  }

  const onDateRangeChange = async (start: string, end: string) => {
    const period = parseDateRangeFromURL(start, end)
    await fetchQuery<TransactionsQuery>(environment, transactionsQuery, {
      where,
      startDate: period.startDate,
      endDate: period.endDate,
    }).toPromise()

    // Now navigate - the route loader will read from Relay store cache
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        start,
        end,
      }),
    })
  }

  return (
    <Fragment>
      <div className="fixed right-4 bottom-4 lg:absolute">
        <PlusButton />
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
