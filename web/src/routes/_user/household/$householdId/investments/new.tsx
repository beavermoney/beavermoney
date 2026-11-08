import { Stack } from '@astryxdesign/core/Stack'
import { createFileRoute } from '@tanstack/react-router'
import { NewInvestment } from './-components/new-investment'

import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { readViewUserIds } from '@/hooks/view-scope-store'
import {
  fetchQuery,
  graphql,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { type newInvestmentQuery } from './__generated__/newInvestmentQuery.graphql'

export const Route = createFileRoute(
  '/_user/household/$householdId/investments/new',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadQuery<newInvestmentQuery>(
      environment,
      newInvestmentQuery,
      { viewUserIds: readViewUserIds(params.householdId) },
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const newInvestmentQuery = graphql`
  query newInvestmentQuery($viewUserIds: [ID!]) {
    household {
      ...newInvestmentFragment @arguments(viewUserIds: $viewUserIds)
    }
    ...newInvestmentStockQuoteFragment
    ...newInvestmentCryptoQuoteFragment
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<newInvestmentQuery>(
    newInvestmentQuery,
    queryRef,
  )

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      newInvestmentQuery,
      { viewUserIds: readViewUserIds(params.householdId) },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return (
    <Stack direction="horizontal">
      <Stack direction="horizontal" gap={3} align="center" wrap="wrap">
        <Stack direction="horizontal" gap={3} align="center" wrap="wrap">
          <NewInvestment
            newInvestmentFragmentRef={data.household}
            newInvestmentStockQuoteFragmentRef={data}
            newInvestmentCryptoQuoteFragmentRef={data}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}
