import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { TransactionsPanel } from './-components/transactions-panel'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import type { transactionsQuery } from './__generated__/transactionsQuery.graphql'
import type { TransactionWhereInput } from './-components/__generated__/transactionsListRefetch.graphql'
import { parseDateRangeFromURL } from '@/lib/date-range'
import { useHousehold } from '@/hooks/use-household'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'

const query = graphql`
  query transactionsQuery(
    $where: TransactionWhereInput
    $startDate: Time!
    $endDate: Time!
    $viewUserId: ID
  ) {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...transactionsPanelFragment
        @arguments(
          where: $where
          startDate: $startDate
          endDate: $endDate
          viewUserId: $viewUserId
        )
    }
  }
`

// Filter transactions by "any entry's account is owned by viewUserId" so
// cross-user transfers (Alice -> Bob) appear in BOTH users' individual views.
// Mirrors the backend predicate in gql/helpers.go::transactionCount.
function buildTransactionWhere(
  startDate: string,
  endDate: string,
  viewUserId: string | null,
): TransactionWhereInput {
  const where: TransactionWhereInput = {
    datetimeGTE: startDate,
    datetimeLT: endDate,
  }
  if (viewUserId !== null) {
    where.hasTransactionEntriesWith = [
      { hasAccountWith: [{ userID: viewUserId }] },
    ]
  }
  return where
}

export const Route = createFileRoute(
  '/_user/household/$householdId/transactions/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loaderDeps: ({ search }) => {
    const fullSearch = search as {
      start: string
      end: string
      view_user_id?: string | null
    }
    return {
      start: fullSearch.start,
      end: fullSearch.end,
      viewUserId: fullSearch.view_user_id ?? null,
    }
  },
  loader: ({ deps }) => {
    const period = parseDateRangeFromURL(deps.start, deps.end)
    const where = buildTransactionWhere(
      period.startDate,
      period.endDate,
      deps.viewUserId,
    )

    return loadQuery<transactionsQuery>(
      environment,
      query,
      {
        where,
        startDate: period.startDate,
        endDate: period.endDate,
        viewUserId: deps.viewUserId,
      },
      { fetchPolicy: 'store-or-network' },
    )
  },
})

function RouteComponent() {
  const search = Route.useSearch()
  const queryRef = Route.useLoaderData()
  const { household } = useHousehold()
  const { viewUserId } = useHouseholdViewScope()

  const data = usePreloadedQuery<transactionsQuery>(query, queryRef)

  useSubscribeToInvalidationState([household.id], () => {
    const period = parseDateRangeFromURL(search.start, search.end)
    const where = buildTransactionWhere(
      period.startDate,
      period.endDate,
      viewUserId ?? null,
    )

    fetchQuery(
      environment,
      query,
      {
        where,
        startDate: period.startDate,
        endDate: period.endDate,
        viewUserId: viewUserId ?? null,
      },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <TransactionsPanel fragmentRef={data.household} />
}
