import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { graphql, ROOT_ID } from 'relay-runtime'
import { useState } from 'react'
import {
  EditIcon,
  ArchiveIcon,
  Trash2Icon,
  AlertTriangleIcon,
  MoreHorizontalIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { match } from 'ts-pattern'
import { useFragment, useMutation } from 'react-relay'
import { environment } from '@/environment'
import { PendingComponent } from '@/components/pending-component'
import { AccountCard } from './-components/account-card'
import { Separator } from '@/components/ui/separator'
import { CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { commitMutationResult } from '@/lib/relay'
import { AccountIdLayoutQuery } from './__generated__/AccountIdLayoutQuery.graphql'
import { AccountIdLayoutDeleteMutation } from './__generated__/AccountIdLayoutDeleteMutation.graphql'
import { AccountIdLayoutArchiveMutation } from './__generated__/AccountIdLayoutArchiveMutation.graphql'
import invariant from 'tiny-invariant'
import { AccountIdLayoutFragment$key } from './__generated__/AccountIdLayoutFragment.graphql'

export const Route = createFileRoute(
  '/_user/household/$householdId/accounts/$accountId',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadQuery<AccountIdLayoutQuery>(
      environment,
      accountIdLayoutQuery,
      { id: params.accountId },
      { fetchPolicy: 'store-or-network' },
    )
  },
  pendingComponent: PendingComponent,
})

const accountIdLayoutQuery = graphql`
  query AccountIdLayoutQuery($id: ID!) {
    node(id: $id) {
      ... on Account {
        ...accountCardFragment
        ...AccountIdLayoutFragment
      }
    }
  }
`

const accountIdLayoutFragment = graphql`
  fragment AccountIdLayoutFragment on Account {
    id
    archived
  }
`

const accountIdLayoutDeleteMutation = graphql`
  mutation AccountIdLayoutDeleteMutation($id: ID!) {
    deleteAccount(id: $id)
  }
`

const accountIdLayoutArchiveMutation = graphql`
  mutation AccountIdLayoutArchiveMutation($id: ID!) {
    archiveAccount(id: $id)
  }
`

function RouteComponent() {
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()
  const navigate = useNavigate()

  const data = usePreloadedQuery<AccountIdLayoutQuery>(
    accountIdLayoutQuery,
    queryRef,
  )

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [archiveAlertOpen, setArchiveAlertOpen] = useState(false)

  const [commitDeleteMutation, isDeleteMutationInFlight] =
    useMutation<AccountIdLayoutDeleteMutation>(accountIdLayoutDeleteMutation)

  const [commitArchiveMutation, isArchiveMutationInFlight] =
    useMutation<AccountIdLayoutArchiveMutation>(accountIdLayoutArchiveMutation)

  useSubscribeToInvalidationState([ROOT_ID], () => {
    return loadQuery<AccountIdLayoutQuery>(
      environment,
      accountIdLayoutQuery,
      { id: params.accountId },
      { fetchPolicy: 'network-only' },
    )
  })

  invariant(data.node, 'Account not found')

  const accountData = useFragment<AccountIdLayoutFragment$key>(
    accountIdLayoutFragment,
    data.node,
  )

  const handleEdit = () => {
    navigate({
      to: '/household/$householdId/accounts/$accountId/edit',
      params: { householdId: params.householdId, accountId: params.accountId },
    })
  }

  const handleDelete = async () => {
    const result = await commitMutationResult<AccountIdLayoutDeleteMutation>(
      commitDeleteMutation,
      {
        variables: { id: accountData.id },
      },
    )

    match(result)
      .with({ status: 'success' }, () => {
        navigate({
          to: '/household/$householdId/accounts',
          params: { householdId: params.householdId },
          search: (prev) => ({ ...prev }),
        })
        toast.success('Account deleted!')
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(error.toString())
      })
      .exhaustive()
  }

  const handleArchive = async () => {
    const result = await commitMutationResult<AccountIdLayoutArchiveMutation>(
      commitArchiveMutation,
      {
        variables: { id: accountData.id },
      },
    )

    match(result)
      .with({ status: 'success' }, () => {
        navigate({
          to: '/household/$householdId/accounts',
          params: { householdId: params.householdId },
          search: (prev) => ({ ...prev }),
        })
        toast.success('Account archived!')
      })
      .with({ status: 'error' }, ({ error }) => {
        toast.error(error.toString())
      })
      .exhaustive()
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => navigate({ to: '..' })}>
          Back
        </Button>
        <CardTitle>Account Detail</CardTitle>
        <div className="grow" />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
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
      <Outlet />

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
  )
}
