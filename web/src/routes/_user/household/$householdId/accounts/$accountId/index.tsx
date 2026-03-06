import { createFileRoute } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql, ROOT_ID } from 'relay-runtime'
import { TransactionsList } from '../../transactions/-components/transactions-list'
import type { AccountIdTransactionsQuery } from './__generated__/AccountIdTransactionsQuery.graphql'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'

export const Route = createFileRoute(
  '/_user/household/$householdId/accounts/$accountId/',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadQuery<AccountIdTransactionsQuery>(
      environment,
      AccountIdTransactionsQuery,
      {
        where: {
          or: [
            {
              hasTransactionEntriesWith: [
                { hasAccountWith: [{ id: params.accountId }] },
              ],
            },
            {
              hasInvestmentLotsWith: [
                {
                  hasInvestmentWith: [
                    {
                      hasAccountWith: [{ id: params.accountId }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const AccountIdTransactionsQuery = graphql`
  query AccountIdTransactionsQuery($where: TransactionWhereInput) {
    ...transactionsListFragment @arguments(where: $where)
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()

  const data = usePreloadedQuery<AccountIdTransactionsQuery>(
    AccountIdTransactionsQuery,
    queryRef,
  )

  useSubscribeToInvalidationState([ROOT_ID], () => {
    return loadQuery<AccountIdTransactionsQuery>(
      environment,
      AccountIdTransactionsQuery,
      {
        where: {
          or: [
            {
              hasTransactionEntriesWith: [
                { hasAccountWith: [{ id: params.accountId }] },
              ],
            },
            {
              hasInvestmentLotsWith: [
                {
                  hasInvestmentWith: [
                    {
                      hasAccountWith: [{ id: params.accountId }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      { fetchPolicy: 'network-only' },
    )
  })

  return <TransactionsList fragmentRef={data} />
}
