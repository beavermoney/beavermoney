import { TransactionEntry } from '@/components/transaction-composer/transaction-entry'
import safeAreaStyles from '@/components/layouts/safe-area.module.css'
import { AverageCostPrompt } from '@/components/average-cost-prompt'
import { useLingui } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { handleHouseholdError } from '@/lib/auth'
import {
  RouteContentBoundary,
  NavigationProgress,
} from '@/components/route-content-boundary'
import { MobileNavToggle } from '@astryxdesign/core/MobileNav'
import { notifyError } from '@/lib/notifications'
import { Button } from '@astryxdesign/core/Button'
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { HStack, Layout, LayoutHeader } from '@astryxdesign/core/Layout'
import { PlusIcon, Settings2Icon, EllipsisIcon } from 'lucide-react'

import { AppSidebar } from '@/components/app-sidebar'
import { useToast } from '@astryxdesign/core/Toast'
import {
  Outlet,
  createFileRoute,
  redirect,
  stripSearchParams,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useCallback } from 'react'
import {
  loadQuery,
  useMutation,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { commitLocalUpdate, fetchQuery, graphql } from 'relay-runtime'
import { z } from 'zod'
import type { routeHouseholdIdQuery } from './__generated__/routeHouseholdIdQuery.graphql'
import type { routeRefreshAccountDataMutation } from './__generated__/routeRefreshAccountDataMutation.graphql'

import { AppShell } from '@astryxdesign/core/AppShell'

import { CommandMenu } from '@/components/command-menu'
import { GenericError } from '@/components/generic-error'
import { NotFoundError } from '@/components/not-found-error'
import { PendingComponent } from '@/components/pending-component'
import { LOCAL_STORAGE_HOUSEHOLD_ID_KEY } from '@/constant'
import { environment } from '@/environment'
import {
  displayCurrencyIdStore,
  setDisplayCurrencyId,
} from '@/hooks/display-currency-store'
import { DisplayCurrencyProvider } from '@/hooks/use-display-currency'
import { HouseholdProvider } from '@/hooks/use-household'
import { HouseholdMembersProvider } from '@/hooks/use-household-members'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { UserProvider } from '@/hooks/use-user'
import { UserHouseholdProvider } from '@/hooks/use-user-household'
import {
  clearHouseholdScopedStorage,
  isMembershipRevokedError,
} from '@/lib/auth'
import Hotkeys from './-components/hotkeys'

import { identity } from 'lodash-es'
import { ViewScopeSwitcher } from './-components/view-scope-switcher'
import { HouseholdActionsMenu } from './-components/household-actions-menu'

const routeHouseholdIdQuery = graphql`
  query routeHouseholdIdQuery {
    ...appSidebarFragment
    user {
      ...useUserFragment
    }
    userHousehold {
      ...useUserHouseholdFragment
    }
    household {
      ...useHouseholdFragment
      ...useHouseholdMembersFragment
      ...useDisplayCurrencyFragment
      # eslint-disable-next-line relay/unused-fields
      householdCurrencies {
        id
        important
        code
      }
    }
  }
`

const RouteRefreshAccountDataMutation = graphql`
  mutation routeRefreshAccountDataMutation {
    refresh
  }
`

const searchSchema = z.object({
  command_open: z.boolean().optional().default(false),
  edit_transaction_id: z.string().nullable().default(null),
})

const defaultValues = {
  command_open: false,
  edit_transaction_id: null,
}

export const Route = createFileRoute('/_user/household/$householdId')({
  component: RouteComponent,
  validateSearch: searchSchema,
  staleTime: Infinity,
  notFoundComponent: NotFoundError,
  errorComponent: GenericError,
  onError: handleHouseholdError,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  loader: async ({ params }) => {
    localStorage.setItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY, params.householdId)

    const variables = {}

    try {
      await fetchQuery<routeHouseholdIdQuery>(
        environment,
        routeHouseholdIdQuery,
        variables,
      ).toPromise()
    } catch (error) {
      if (isMembershipRevokedError(error)) {
        clearHouseholdScopedStorage()
        notifyError(t`You no longer have access to this household.`)
        throw redirect({ to: '/household' })
      }
      throw error
    }

    return loadQuery<routeHouseholdIdQuery>(
      environment,
      routeHouseholdIdQuery,
      variables,
      { fetchPolicy: 'store-only' },
    )
  },
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  const { t } = useLingui()
  const showToast = useToast()

  const params = Route.useParams()
  const queryRef = Route.useLoaderData()
  const data = usePreloadedQuery<routeHouseholdIdQuery>(
    routeHouseholdIdQuery,
    queryRef,
  )
  const isMobile = useIsMobile()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { isPrivacyModeEnabled, togglePrivacyMode } = usePrivacyMode()
  const router = useRouter()
  const isOnSettingsPage = pathname.includes('/settings')
  const [commitRefresh, isRefreshInFlight] =
    useMutation<routeRefreshAccountDataMutation>(
      RouteRefreshAccountDataMutation,
    )

  const currencies = (data.household.householdCurrencies ?? []).filter(
    (hc) => hc.important,
  )
  const displayCurrencyId = useStore(displayCurrencyIdStore, identity)
  const activeCurrencyCode =
    currencies.find((c) => c.id === displayCurrencyId)?.code ??
    currencies[0]?.code ??
    ''
  const handleCurrencyChange = useCallback(
    (hcId: string) => {
      setDisplayCurrencyId(hcId)
      commitLocalUpdate(environment, (store) => {
        store.invalidateStore()
      })
      router.invalidate()
    },
    [router],
  )

  const handleRefreshAccountData = useCallback(() => {
    commitRefresh({
      variables: {},
      updater: (store, response) => {
        if (response?.refresh) {
          store.get(params.householdId)?.invalidateRecord()
        }
      },
      onCompleted: (response, errors) => {
        if (errors?.length || !response?.refresh) {
          showToast({
            type: 'error',
            body: t`Sync failed: ${errors?.[0]?.message ?? t`No data was refreshed`}`,
          })
          return
        }

        showToast({ type: 'info', body: t`Account data refreshed.` })
      },
      onError: (error) => {
        showToast({ type: 'error', body: t`Sync failed: ${error.message}` })
      },
    })
  }, [t, commitRefresh, params.householdId, showToast])

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      routeHouseholdIdQuery,
      {},
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  const preferenceItems = [
    {
      label: isPrivacyModeEnabled ? t`Show balances` : t`Hide balances`,
      onClick: togglePrivacyMode,
    },
    {
      label: t`Refresh account data`,
      onClick: handleRefreshAccountData,
      isDisabled: isRefreshInFlight,
    },
  ]

  return (
    <UserProvider userRef={data.user}>
      <HouseholdProvider householdRef={data.household}>
        <HouseholdMembersProvider householdRef={data.household}>
          <UserHouseholdProvider userHouseholdRef={data.userHousehold}>
            <DisplayCurrencyProvider householdRef={data.household}>
              <AverageCostPrompt />
              <Hotkeys />
              <CommandMenu />
              <AppShell
                className={safeAreaStyles.safeArea}
                sideNav={<AppSidebar fragmentRef={data} />}
                mobileNav={{ hasToggle: false }}
              >
                <Layout
                  height="fill"
                  header={
                    <LayoutHeader hasDivider>
                      <HStack
                        hAlign="between"
                        vAlign="center"
                        gap={3}
                        wrap="wrap"
                      >
                        <HStack gap={2} vAlign="center">
                          {currencies.length > 1 && (
                            <DropdownMenu
                              button={{
                                label: activeCurrencyCode,
                                variant: 'secondary',
                              }}
                              items={currencies.map((hc) => ({
                                label: hc.code,
                                onClick: () => handleCurrencyChange(hc.id),
                              }))}
                            />
                          )}
                          {!isMobile && !isOnSettingsPage && (
                            <ViewScopeSwitcher />
                          )}
                        </HStack>
                        <HStack gap={2} vAlign="center">
                          {isMobile ? (
                            <HouseholdActionsMenu
                              button={{
                                label: t`More actions`,
                                icon: <AstryxIcon icon={EllipsisIcon} />,
                                isIconOnly: true,
                                variant: 'ghost',
                              }}
                              showViewScope={!isOnSettingsPage}
                              items={preferenceItems}
                            />
                          ) : (
                            <DropdownMenu
                              button={{
                                label: t`Preferences`,
                                icon: <AstryxIcon icon={Settings2Icon} />,
                                isIconOnly: true,
                                variant: 'ghost',
                              }}
                              items={preferenceItems}
                            />
                          )}
                          <NewEntryButton />
                          {isMobile && <MobileNavToggle />}
                        </HStack>
                      </HStack>
                    </LayoutHeader>
                  }
                  content={
                    <>
                      <NavigationProgress />
                      <RouteContentBoundary>
                        <Outlet />
                      </RouteContentBoundary>
                    </>
                  }
                />

                {!pathname.endsWith('/transactions/new') && (
                  <TransactionEntry />
                )}
              </AppShell>
            </DisplayCurrencyProvider>
          </UserHouseholdProvider>
        </HouseholdMembersProvider>
      </HouseholdProvider>
    </UserProvider>
  )
}

function NewEntryButton() {
  const { t } = useLingui()
  const isMobile = useIsMobile()
  const { open } = useLogTransaction()
  return (
    <Button
      label={isMobile ? t`New` : t`New entry`}
      aria-label={t`New entry`}
      icon={<AstryxIcon icon={PlusIcon} />}
      onClick={() => open('expense')}
    />
  )
}
