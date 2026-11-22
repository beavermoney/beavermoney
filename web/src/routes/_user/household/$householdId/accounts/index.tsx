import { loadRouteQuery } from '@/lib/relay/load-route-query'
import { readHistoryState } from '@/hooks/use-history-state'
import { getHistoryViewKey } from '@/lib/history-view-key'
import {
  NetWorthChartQuery,
  durationToDate,
  type Duration,
} from './-components/net-worth-chart-query'
import groupStyles from '@/components/layouts/grouped-list.module.css'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { environment } from '@/environment'
import { readViewUserIds } from '@/hooks/view-scope-store'
import { createFileRoute } from '@tanstack/react-router'
import {
  fetchQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { AccountsPanel } from './-components/accounts-panel'
import type { accountsQuery } from './__generated__/accountsQuery.graphql'

const query = graphql`
  query accountsQuery($viewUserIds: [ID!]) {
    household {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...accountsPanelFragment @arguments(viewUserIds: $viewUserIds)
    }
  }
`

export const Route = createFileRoute('/_user/household/$householdId/accounts/')(
  {
    component: RouteComponent,
    loader: ({ params, location }) => {
      const viewKey = getHistoryViewKey(location)
      const duration = readHistoryState<Duration>(
        viewKey,
        'net-worth-chart:all:duration',
        '1M',
      )
      const createTimeGTE = durationToDate(duration)
      // Begin history alongside accounts. The chart owns its loading/error UI.
      fetchQuery(
        environment,
        NetWorthChartQuery,
        {
          count: readHistoryState(viewKey, 'net-worth-chart:all:count', 500),
          where: createTimeGTE ? { createTimeGTE } : null,
          includeHoldings: false,
        },
        { fetchPolicy: 'store-or-network' },
      ).subscribe({ error: () => {} })
      return loadRouteQuery<accountsQuery>(
        environment,
        query,
        { viewUserIds: readViewUserIds(params.householdId) },
        { fetchPolicy: 'store-or-network' },
      )
    },
  },
)

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<accountsQuery>(query, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      query,
      { viewUserIds: readViewUserIds(params.householdId) },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return (
    <HouseholdContentLayout className={groupStyles['sticky-list-scrollport']}>
      <AccountsPanel fragmentRef={data.household} />
    </HouseholdContentLayout>
  )
}
