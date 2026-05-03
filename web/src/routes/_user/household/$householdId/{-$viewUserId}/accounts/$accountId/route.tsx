import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { fetchQuery, graphql } from 'relay-runtime'
import { useState } from 'react'
import {
  EditIcon,
  ArchiveIcon,
  Trash2Icon,
  AlertTriangleIcon,
  MoreHorizontalIcon,
  PlusIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { match } from 'ts-pattern'
import { useFragment, useMutation } from 'react-relay'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { Separator } from '@/components/ui/separator'
import { CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import invariant from 'tiny-invariant'
import { NodeType, commitMutationResult, useDeleteNode } from '@/lib/relay'
import { identity } from 'lodash-es'
import { routeAccountIdQuery } from './__generated__/routeAccountIdQuery.graphql'
import { routeAccountIdDeleteMutation } from './__generated__/routeAccountIdDeleteMutation.graphql'
import { routeAccountIdArchiveMutation } from './__generated__/routeAccountIdArchiveMutation.graphql'
import { routeAccountIdFragment$key } from './__generated__/routeAccountIdFragment.graphql'
import { AccountCard } from '../-components/account-card'
import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'

export const Route = createFileRoute(
  '/_user/household/$householdId/{-$viewUserId}/accounts/$accountId',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadQuery<routeAccountIdQuery>(
      environment,
      RouteAccountIdQuery,
      { id: params.accountId },
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const RouteAccountIdQuery = graphql`
  query routeAccountIdQuery($id: ID!) {
    node(id: $id) {
      ... on Account {
        ...accountCardFragment
        ...routeAccountIdFragment
      }
    }
  }
`

const RouteAccountIdFragment = graphql`
  fragment routeAccountIdFragment on Account {
    id
    type
    archived
  }
`

const RouteAccountIdDeleteMutation = graphql`
  mutation routeAccountIdDeleteMutation($id: ID!, $connections: [ID!]!) {
    deleteAccount(id: $id) {
      deletedAccountId @deleteEdge(connections: $connections)
    }
  }
`

const RouteAccountIdArchiveMutation = graphql`
  mutation routeAccountIdArchiveMutation($id: ID!) {
    archiveAccount(id: $id)
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()
  const navigate = useNavigate()
  const { open: openLogTransaction } = useLogTransaction()

  const data = usePreloadedQuery<routeAccountIdQuery>(
    RouteAccountIdQuery,
    queryRef,
  )

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [archiveAlertOpen, setArchiveAlertOpen] = useState(false)

  const [commitDeleteMutation, isDeleteMutationInFlight] =
    useMutation<routeAccountIdDeleteMutation>(RouteAccountIdDeleteMutation)

  const [commitArchiveMutation, isArchiveMutationInFlight] =
    useMutation<routeAccountIdArchiveMutation>(RouteAccountIdArchiveMutation)

  const deleteNode = useDeleteNode(NodeType.Account)

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      RouteAccountIdQuery,
      { id: params.accountId },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  invariant(data.node, 'Account not found')

  const accountData = useFragment<routeAccountIdFragment$key>(
    RouteAccountIdFragment,
    data.node,
  )

  const handleEdit = () => {
    navigate({
      to: '/household/$householdId/{-$viewUserId}/accounts/$accountId/edit',
      params: { householdId: params.householdId, accountId: params.accountId },
    })
  }

  const handleDelete = async () => {
    const result = await deleteNode((connections) =>
      commitMutationResult<routeAccountIdDeleteMutation>(commitDeleteMutation, {
        variables: { id: accountData.id, connections },
      }),
    )

    match(result)
      .with({ status: 'success' }, () => {
        navigate({
          to: '/household/$householdId/{-$viewUserId}/accounts',
          params: { householdId: params.householdId },
          search: (prev) => ({
            accounts_group_by: prev.accounts_group_by as
              | 'type'
              | 'category'
              | undefined,
          }),
        })
        toast.success('Account deleted!')
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(error.toString())
      })
      .exhaustive()
  }

  const handleArchive = async () => {
    const result = await commitMutationResult<routeAccountIdArchiveMutation>(
      commitArchiveMutation,
      {
        variables: { id: accountData.id },
      },
    )

    match(result)
      .with({ status: 'success' }, () => {
        navigate({
          to: '/household/$householdId/{-$viewUserId}/accounts',
          params: { householdId: params.householdId },
          search: (prev) => ({
            accounts_group_by: prev.accounts_group_by as
              | 'type'
              | 'category'
              | undefined,
          }),
        })
        toast.success('Account archived!')
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(error.toString())
      })
      .exhaustive()
  }

  return (
    <HouseholdContentLayout>
      <div className="flex h-full flex-col">
        {/* Fixed header section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate({ to: '..', search: identity })}
            >
              Back
            </Button>
            <CardTitle>Account Detail</CardTitle>
            <div className="grow" />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" />}
              >
                <MoreHorizontalIcon className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <EditIcon className="mr-2 size-4" />
                  Edit
                </DropdownMenuItem>
                {!accountData.archived && (
                  <DropdownMenuItem onClick={() => setArchiveAlertOpen(true)}>
                    <ArchiveIcon className="mr-2 size-4" />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setDeleteAlertOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2Icon className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="bg-muted/50 rounded-md">
            <AccountCard fragmentRef={data.node} />
          </div>
          <Separator />
        </div>
        <div className="py-2"></div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </div>

        <div className="fixed right-4 bottom-4 lg:absolute">
          <Button
            nativeButton={true}
            size="icon-lg"
            onClick={() =>
              openLogTransaction(
                accountData.type === 'investment' ? 'buy' : 'expense',
                { accountId: accountData.id },
              )
            }
          >
            <PlusIcon />
          </Button>
        </div>

        {/* Delete Alert Dialog */}
        <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia>
                <AlertTriangleIcon className="text-destructive" />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                account. Delete is only allowed if there are no transactions or
                investments attached.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleteMutationInFlight}
              >
                {isDeleteMutationInFlight ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Archive Alert Dialog */}
        <AlertDialog open={archiveAlertOpen} onOpenChange={setArchiveAlertOpen}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia>
                <ArchiveIcon />
              </AlertDialogMedia>
              <AlertDialogTitle>Archive Account</AlertDialogTitle>
              <AlertDialogDescription>
                This will archive the account and hide it from the main list.
                Archive is only allowed when the account value is zero.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleArchive}
                disabled={isArchiveMutationInFlight}
              >
                {isArchiveMutationInFlight ? 'Archiving...' : 'Archive'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </HouseholdContentLayout>
  )
}
