import { createFileRoute } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql } from 'relay-runtime'
import { TransactionsList } from '../transactions/-components/transactions-list'
import type { InvestmentIdQuery } from './__generated__/InvestmentIdQuery.graphql'
import type { TransactionWhereInput } from '../transactions/-components/__generated__/transactionsListRefetch.graphql'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'

export const Route = createFileRoute(
  '/_user/household/$householdId/investments/$investmentId',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadQuery<InvestmentIdQuery>(
      environment,
      InvestmentIdQuery,
      {
        where: {
          hasInvestmentLotsWith: [
            { hasInvestmentWith: [{ id: params.investmentId }] },
          ],
        },
      },
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const InvestmentIdQuery = graphql`
  query InvestmentIdQuery($where: TransactionWhereInput) {
    household {
      ...transactionsListFragment @arguments(where: $where)
    }
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const where: TransactionWhereInput = {
    hasInvestmentLotsWith: [
      { hasInvestmentWith: [{ id: params.investmentId }] },
    ],
  }

  const data = usePreloadedQuery<InvestmentIdQuery>(InvestmentIdQuery, queryRef)

  useSubscribeToInvalidationState([params.householdId], () => {
    return loadQuery<InvestmentIdQuery>(
      environment,
      InvestmentIdQuery,
      {
        where: {
          hasInvestmentLotsWith: [
            { hasInvestmentWith: [{ id: params.investmentId }] },
          ],
        },
      },
      { fetchPolicy: 'network-only' },
    )
  })

  return (
    <div>
      <TransactionsList fragmentRef={data.household} where={where} />
    </div>
  )
}
