import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { RouteContentBoundary } from '@/components/route-content-boundary'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Divider } from '@astryxdesign/core/Divider'
import { DropdownMenu, DropdownMenuItem } from '@astryxdesign/core/DropdownMenu'
import { Heading } from '@astryxdesign/core/Heading'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useToast } from '@astryxdesign/core/Toast'
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import {
  ArchiveIcon,
  EditIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from 'lucide-react'
import { useState } from 'react'
import {
  loadQuery,
  useFragment,
  useMutation,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { fetchQuery, graphql } from 'relay-runtime'
import { match } from 'ts-pattern'

import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { commitMutationResult, NodeType, useDeleteNode } from '@/lib/relay'
import { identity } from 'lodash-es'
import invariant from 'tiny-invariant'
import { AccountCard } from '../-components/account-card'
import { routeAccountIdArchiveMutation } from './__generated__/routeAccountIdArchiveMutation.graphql'
import { routeAccountIdDeleteMutation } from './__generated__/routeAccountIdDeleteMutation.graphql'
import { routeAccountIdFragment$key } from './__generated__/routeAccountIdFragment.graphql'
import { routeAccountIdQuery } from './__generated__/routeAccountIdQuery.graphql'

export const Route = createFileRoute(
  '/_user/household/$householdId/accounts/$accountId',
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
  const { t } = useLingui()
  const showToast = useToast()

  const params = Route.useParams()
  const queryRef = Route.useLoaderData()
  const navigate = useNavigate()
  const isEditing = useRouterState({
    select: (state) => state.location.pathname.endsWith('/edit'),
  })

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

  invariant(data.node, t`Account not found`)

  const accountData = useFragment<routeAccountIdFragment$key>(
    RouteAccountIdFragment,
    data.node,
  )

  const handleEdit = () => {
    navigate({
      to: '/household/$householdId/accounts/$accountId/edit',
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
          to: '/household/$householdId/accounts',
          params: { householdId: params.householdId },
          search: (prev) => ({
            accounts_group_by: prev.accounts_group_by as
              'type' | 'category' | undefined,
          }),
        })
        showToast({ type: 'info', body: t`Account deleted!` })
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: error.toString() })
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
          to: '/household/$householdId/accounts',
          params: { householdId: params.householdId },
          search: (prev) => ({
            accounts_group_by: prev.accounts_group_by as
              'type' | 'category' | undefined,
          }),
        })
        showToast({ type: 'info', body: t`Account archived!` })
      })
      .with({ status: 'error' }, ({ error }) => {
        showToast({ type: 'error', body: error.toString() })
      })
      .exhaustive()
  }

  return (
    <HouseholdContentLayout>
      <Stack direction="vertical" gap={6}>
        {/* Fixed header section */}
        <Stack direction="vertical" gap={4}>
          <Stack direction="horizontal" gap={2} align="center">
            <Button
              onClick={() => navigate({ to: '..', search: identity })}
              label={t`Back`}
              width="fit-content"
              variant={'secondary'}
            >
              <Trans>Back</Trans>
            </Button>
            <Heading level={2}>
              <Trans>Account Detail</Trans>
            </Heading>

            <DropdownMenu
              alignment={'end'}
              renderTrigger={(triggerProps) => (
                <Button
                  {...triggerProps}
                  label={t`Actions`}
                  variant={'ghost'}

                  isIconOnly
                  icon={
                    <>
                      <AstryxIcon icon={MoreHorizontalIcon} />
                    </>
                  }
                ></Button>
              )}
            >
              <DropdownMenuItem
                onClick={handleEdit}
                label={
                  <>
                    <AstryxIcon icon={EditIcon} />
                    <Trans>Edit</Trans>
                  </>
                }
              />
              {!accountData.archived && (
                <DropdownMenuItem
                  onClick={() => setArchiveAlertOpen(true)}
                  label={
                    <>
                      <AstryxIcon icon={ArchiveIcon} />
                      <Trans>Archive</Trans>
                    </>
                  }
                />
              )}
              <DropdownMenuItem
                onClick={() => setDeleteAlertOpen(true)}

                label={
                  <>
                    <AstryxIcon icon={Trash2Icon} />
                    <Trans>Delete</Trans>
                  </>
                }
              />
            </DropdownMenu>
          </Stack>
          {!isEditing && (
            <>
              <AccountCard fragmentRef={data.node} />
              <Divider />
            </>
          )}
        </Stack>

        <Stack direction="vertical" gap={4}>
          <RouteContentBoundary>
            <Outlet />
          </RouteContentBoundary>
        </Stack>

        {/* Delete Alert Dialog */}
        <>
          <Dialog
            isOpen={deleteAlertOpen}
            onOpenChange={setDeleteAlertOpen}
            purpose="info"
            role="alertdialog"
            padding={0}
          >
            <Layout
              padding={6}
              header={
                <DialogHeader
                  title={
                    <>
                      <Trans>Delete Account</Trans>
                    </>
                  }
                  onOpenChange={setDeleteAlertOpen}
                />
              }
            >
              <LayoutContent>
                <Stack direction="vertical" gap={6} paddingBlockStart={4}>
                  <Text as="div" display="block" type="supporting">
                    <Trans>
                      This action cannot be undone. This will permanently delete
                      the account. Delete is only allowed if there are no
                      transactions or investments attached.
                    </Trans>
                  </Text>
                  <Stack
                    direction="horizontal"
                    gap={3}
                    align="center"
                    wrap="wrap"
                    justify="end"
                  >
                    <Button
                      label={t`Cancel`}
                      onClick={() => setDeleteAlertOpen(false)}
                    />
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      isDisabled={isDeleteMutationInFlight}
                      label={t`Delete account`}
                    >
                      {isDeleteMutationInFlight ? t`Deleting...` : t`Delete`}
                    </Button>
                  </Stack>
                </Stack>
              </LayoutContent>
            </Layout>
          </Dialog>
        </>

        {/* Archive Alert Dialog */}
        <>
          <Dialog
            isOpen={archiveAlertOpen}
            onOpenChange={setArchiveAlertOpen}
            purpose="info"
            role="alertdialog"
            padding={0}
          >
            <Layout
              padding={6}
              header={
                <DialogHeader
                  title={
                    <>
                      <Trans>Archive Account</Trans>
                    </>
                  }
                  onOpenChange={setArchiveAlertOpen}
                />
              }
            >
              <LayoutContent>
                <Stack direction="vertical" gap={6} paddingBlockStart={4}>
                  <Text as="div" display="block" type="supporting">
                    <Trans>
                      This will archive the account and hide it from the main
                      list. Archive is only allowed when the account value is
                      zero. You can unarchive it later in Settings → Accounts.
                    </Trans>
                  </Text>
                  <Stack
                    direction="horizontal"
                    gap={3}
                    align="center"
                    wrap="wrap"
                    justify="end"
                  >
                    <Button
                      label={t`Cancel`}
                      onClick={() => setArchiveAlertOpen(false)}
                    />
                    <Button
                      onClick={handleArchive}
                      isDisabled={isArchiveMutationInFlight}
                      label={t`Archive account`}
                      variant="destructive"
                    >
                      {isArchiveMutationInFlight ? t`Archiving...` : t`Archive`}
                    </Button>
                  </Stack>
                </Stack>
              </LayoutContent>
            </Layout>
          </Dialog>
        </>
      </Stack>
    </HouseholdContentLayout>
  )
}
