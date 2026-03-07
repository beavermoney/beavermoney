import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql, ROOT_ID } from 'relay-runtime'
import type { AccountIdLayoutQuery } from './__generated__/AccountIdLayoutQuery.graphql'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { AccountCard } from './-components/account-card'
import { Separator } from '@/components/ui/separator'
import { CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute(
  '/_user/household/$householdId/accounts/$accountId',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadQuery<AccountIdLayoutQuery>(
      environment,
      AccountIdLayoutQuery,
      { id: params.accountId },
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const AccountIdLayoutQuery = graphql`
  query AccountIdLayoutQuery($id: ID!) {
    node(id: $id) {
      ... on Account {
        ...accountCardFragment
      }
    }
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()
  const navigate = useNavigate()

  const data = usePreloadedQuery<AccountIdLayoutQuery>(
    AccountIdLayoutQuery,
    queryRef,
  )

  useSubscribeToInvalidationState([ROOT_ID], () => {
    return loadQuery<AccountIdLayoutQuery>(
      environment,
      AccountIdLayoutQuery,
      { id: params.accountId },
      { fetchPolicy: 'network-only' },
    )
  })

  if (!data.node) {
    return <div>Account not found</div>
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => navigate({ to: '..' })}>
          Back
        </Button>
        <CardTitle>Account Detail</CardTitle>
        <div className="grow" />
      </div>
      <div className="bg-muted/50 rounded-md">
        <AccountCard fragmentRef={data.node} />
      </div>
      <Separator />
      <Outlet />
    </div>
  )
}
