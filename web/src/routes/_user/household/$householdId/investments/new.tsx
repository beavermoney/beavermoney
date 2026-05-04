import { createFileRoute } from '@tanstack/react-router'
import { NewInvestment } from './-components/new-investment'
import { Item } from '@/components/ui/item'
import {
  fetchQuery,
  graphql,
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { type newInvestmentQuery } from './__generated__/newInvestmentQuery.graphql'

export const Route = createFileRoute(
  '/_user/household/$householdId/investments/new',
)({
  component: RouteComponent,
  loader: () => {
    return loadQuery<newInvestmentQuery>(
      environment,
      newInvestmentQuery,
      {},
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const newInvestmentQuery = graphql`
  query newInvestmentQuery {
    household {
      ...newInvestmentFragment
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
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <Item className="p-0">
          <NewInvestment
            newInvestmentFragmentRef={data.household}
            newInvestmentStockQuoteFragmentRef={data}
            newInvestmentCryptoQuoteFragmentRef={data}
          />
        </Item>
      </div>
    </div>
  )
}
