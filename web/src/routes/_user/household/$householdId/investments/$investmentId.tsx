import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  fetchQuery,
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
import { Button } from '@/components/ui/button'

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
    fetchQuery(
      environment,
      InvestmentIdQuery,
      {
        where,
      },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="secondary" onClick={() => navigate({ to: '..' })}>
          Back
        </Button>
      </div>
      <TransactionsList fragmentRef={data.household} />
    </div>
  )
}
