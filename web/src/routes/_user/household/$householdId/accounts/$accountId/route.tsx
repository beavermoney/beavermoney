import { presentedLocation } from '@/lib/presented-location'
import { loadRouteQuery } from '@/lib/relay/load-route-query'
import { useBackNavigation } from '@/hooks/use-back-navigation'
import { useIsMobile } from '@/hooks/use-mobile'
import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { RouteContentBoundary } from '@/components/route-content-boundary'
import { Layout, LayoutContent } from '@astryxdesign/core/Layout'
import { environment } from '@/environment'
import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { Divider } from '@astryxdesign/core/Divider'
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu'
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
import { ArchiveIcon, EditIcon, MoreHorizontalIcon } from 'lucide-react'
import { useState } from 'react'
import {
  useFragment,
  useMutation,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { fetchQuery, graphql } from 'relay-runtime'
import { match } from 'ts-pattern'

import { HouseholdContentLayout } from '@/components/layouts/household-content-layout'
import { commitMutationResult } from '@/lib/relay'
import invariant from 'tiny-invariant'
import { AccountCard } from '../-components/account-card'
import { routeAccountIdArchiveMutation } from './__generated__/routeAccountIdArchiveMutation.graphql'
import { routeAccountIdFragment$key } from './__generated__/routeAccountIdFragment.graphql'
import { routeAccountIdQuery } from './__generated__/routeAccountIdQuery.graphql'

export const Route = createFileRoute(
  '/_user/household/$householdId/accounts/$accountId',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    return loadRouteQuery<routeAccountIdQuery>(
      environment,
      RouteAccountIdQuery,
      { id: params.accountId },
      { fetchPolicy: 'store-or-network' },
    )
  },
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
  const goBack = useBackNavigation()
  const isEditing = useRouterState({
    select: (state) => presentedLocation(state).pathname.endsWith('/edit'),
  })

  const data = usePreloadedQuery<routeAccountIdQuery>(
    RouteAccountIdQuery,
    queryRef,
  )

  const isMobile = useIsMobile()
  const [archiveAlertOpen, setArchiveAlertOpen] = useState(false)

  const [commitArchiveMutation, isArchiveMutationInFlight] =
    useMutation<routeAccountIdArchiveMutation>(RouteAccountIdArchiveMutation)

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
              onClick={() =>
                goBack({
                  to: '/household/$householdId/accounts',
                  params: { householdId: params.householdId },
                  search: (previous) => previous,
                })
              }
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
              alignment="end"
              presentation={isMobile ? 'bottom-sheet' : 'popover'}
              menuWidth="max-content"
              items={[
                { label: t`Edit`, icon: EditIcon, onClick: handleEdit },
                ...(!accountData.archived
                  ? [
                      {
                        label: t`Archive`,
                        icon: ArchiveIcon,
                        onClick: () => setArchiveAlertOpen(true),
                      },
                    ]
                  : []),
              ]}
              renderTrigger={(triggerProps) => (
                <Button
                  {...triggerProps}
                  label={t`Account actions`}
                  variant="ghost"
                  isIconOnly
                  icon={<AstryxIcon icon={MoreHorizontalIcon} />}
                />
              )}
            />
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
                      list. Archive is only allowed when cash and all holdings
                      are empty. You can unarchive it later in Settings →
                      Accounts.
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
