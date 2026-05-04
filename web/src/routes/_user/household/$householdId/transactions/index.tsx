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
import { readViewUserIds } from '@/hooks/view-scope-store'
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
    $viewUserIds: [ID!]
  ) {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...transactionsPanelFragment
        @arguments(
          where: $where
          startDate: $startDate
          endDate: $endDate
          viewUserIds: $viewUserIds
        )
    }
  }
`

// Filter transactions by "any entry's account is owned by one of viewUserIds"
// so cross-user transfers (Alice -> Bob) appear in BOTH users' individual
// views. Mirrors the backend predicate in gql/helpers.go::transactionCount.
function buildTransactionWhere(
  startDate: string,
  endDate: string,
  viewUserIds: ReadonlyArray<string> | null,
): TransactionWhereInput {
  const where: TransactionWhereInput = {
    datetimeGTE: startDate,
    datetimeLT: endDate,
  }
  if (viewUserIds !== null) {
    where.hasTransactionEntriesWith = [
      { hasAccountWith: [{ userIDIn: viewUserIds }] },
    ]
  }
  return where
}

export const Route = createFileRoute(
  '/_user/household/$householdId/transactions/',
)({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loaderDeps: ({ search }) => ({
    start: search.start,
    end: search.end,
  }),
  loader: ({ deps, params }) => {
    const period = parseDateRangeFromURL(deps.start, deps.end)
    const viewUserIds = readViewUserIds(params.householdId)
    const where = buildTransactionWhere(
      period.startDate,
      period.endDate,
      viewUserIds,
    )

    return loadQuery<transactionsQuery>(
      environment,
      query,
      {
        where,
        startDate: period.startDate,
        endDate: period.endDate,
        viewUserIds,
      },
      { fetchPolicy: 'store-or-network' },
    )
  },
})

function RouteComponent() {
  const search = Route.useSearch()
  const queryRef = Route.useLoaderData()
  const { household } = useHousehold()
  const { viewUserIds } = useHouseholdViewScope()

  const data = usePreloadedQuery<transactionsQuery>(query, queryRef)

  useSubscribeToInvalidationState([household.id], () => {
    const period = parseDateRangeFromURL(search.start, search.end)
    const where = buildTransactionWhere(
      period.startDate,
      period.endDate,
      viewUserIds ?? null,
    )

    fetchQuery(
      environment,
      query,
      {
        where,
        startDate: period.startDate,
        endDate: period.endDate,
        viewUserIds: viewUserIds ?? null,
      },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <TransactionsPanel fragmentRef={data.household} />
}
