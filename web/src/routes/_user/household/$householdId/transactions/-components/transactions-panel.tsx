import { fetchQuery, graphql } from 'relay-runtime'
import { useFragment, useRelayEnvironment } from 'react-relay'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { TransactionsList } from './transactions-list'
import type { transactionsPanelFragment$key } from './__generated__/transactionsPanelFragment.graphql'
import type { transactionsPanelRefetchQuery } from './__generated__/transactionsPanelRefetchQuery.graphql'
import transactionsPanelRefetchQueryNode from './__generated__/transactionsPanelRefetchQuery.graphql'
import { DateRangeFilter } from '../../categories/-components/date-range-filter'
import { FinancialSummaryCards } from '@/components/financial-summary-cards'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { useHousehold } from '@/hooks/use-household'
import { Fragment } from 'react'
import { Button } from '@/components/ui/button'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { useUser } from '@/hooks/use-user'
import { parseISO } from 'date-fns'
import type { TransactionWhereInput } from './__generated__/transactionsListRefetch.graphql'

const transactionsPanelFragment = graphql`
  fragment transactionsPanelFragment on Household
  @refetchable(queryName: "transactionsPanelRefetchQuery")
  @argumentDefinitions(
    where: { type: "TransactionWhereInput" }
    startDate: { type: "Time!" }
    endDate: { type: "Time!" }
    viewUserId: { type: "ID", defaultValue: null }
  ) {
    ...transactionsListFragment @arguments(where: $where)
    financialReport(
      period: { startDate: $startDate, endDate: $endDate }
      viewUserID: $viewUserId
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
  const { open: openLogTransaction } = useLogTransaction()
  const { viewUserId } = useHouseholdViewScope()
  const { user } = useUser()
  const isViewingOtherUser = viewUserId !== null && viewUserId !== user.id

  const data = useFragment(transactionsPanelFragment, fragmentRef)

  const onDateRangeChange = async (start: string, end: string) => {
    const period = parseDateRangeFromURL(start, end)
    const nextWhere: TransactionWhereInput = {
      datetimeGTE: period.startDate,
      datetimeLT: period.endDate,
      ...(viewUserId !== null && {
        hasTransactionEntriesWith: [
          { hasAccountWith: [{ userID: viewUserId }] },
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
        viewUserId: viewUserId ?? null,
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

  return (
    <Fragment>
      <div className="fixed right-4 bottom-4 lg:absolute">
        <Button
          nativeButton={true}
          size="icon-xl"
          className="rounded-full"
          onClick={() => openLogTransaction('expense')}
          disabled={isViewingOtherUser}
          aria-disabled={isViewingOtherUser}
          title={
            isViewingOtherUser ? 'Switch to your view to create' : undefined
          }
          data-testid="log-transaction-button"
        >
          <PlusIcon />
        </Button>
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
