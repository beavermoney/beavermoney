import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { useHousehold } from '@/hooks/use-household'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { readViewUserIds } from '@/hooks/view-scope-store'
import { transactionRangeVariables } from './-data/transaction-range'
import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { TransactionsPanel } from './-components/transactions-panel'
import type { transactionsQuery } from './__generated__/transactionsQuery.graphql'

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
    const variables = transactionRangeVariables(
      deps.start,
      deps.end,
      readViewUserIds(params.householdId),
    )

    return loadQuery<transactionsQuery>(environment, query, variables, {
      fetchPolicy: 'store-or-network',
    })
  },
})

function RouteComponent() {
  const search = Route.useSearch()
  const queryRef = Route.useLoaderData()
  const { household } = useHousehold()
  const { viewUserIds } = useHouseholdViewScope()

  const data = usePreloadedQuery<transactionsQuery>(query, queryRef)

  useSubscribeToInvalidationState([household.id], () => {
    fetchQuery(
      environment,
      query,
      transactionRangeVariables(search.start, search.end, viewUserIds ?? null),
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return <TransactionsPanel fragmentRef={data.household} />
}
