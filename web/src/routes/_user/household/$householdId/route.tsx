import {
  EyeIcon,
  EyeOffIcon,
  Moon,
  Sun,
  GripVertical,
  X,
  RefreshCwIcon,
} from 'lucide-react'

import {
  Outlet,
  createFileRoute,
  redirect,
  stripSearchParams,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { toast } from 'sonner'
import { commitLocalUpdate, fetchQuery, graphql } from 'relay-runtime'
import {
  loadQuery,
  useMutation,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { z } from 'zod'
import { Rnd } from 'react-rnd'
import { useCallback } from 'react'
import { useStore } from '@tanstack/react-store'
import type { routeHouseholdIdQuery } from './__generated__/routeHouseholdIdQuery.graphql'
import type { routeRefreshAccountDataMutation } from './__generated__/routeRefreshAccountDataMutation.graphql'
import { AppSidebar } from '@/components/app-sidebar'
import { AppActionDock } from '@/components/app-action-dock'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Breadcrumb, BreadcrumbList } from '@/components/ui/breadcrumb'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Item } from '@/components/ui/item'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { HouseholdProvider } from '@/hooks/use-household'
import { HouseholdMembersProvider } from '@/hooks/use-household-members'
import { DisplayCurrencyProvider } from '@/hooks/use-display-currency'
import {
  displayCurrencyIdStore,
  setDisplayCurrencyId,
} from '@/hooks/display-currency-store'
import { UserProvider } from '@/hooks/use-user'
import { LOCAL_STORAGE_HOUSEHOLD_ID_KEY } from '@/constant'
import {
  clearHouseholdScopedStorage,
  isMembershipRevokedError,
} from '@/lib/auth'
import { useTheme } from '@/components/theme-provider'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { readViewUserIds } from '@/hooks/view-scope-store'
import { CommandMenu } from '@/components/command-menu'
import { LogTransaction } from './transactions/-components/log-transaction'
import type { logTransactionFragment$key } from './transactions/-components/__generated__/logTransactionFragment.graphql'
import { SnapshotDialog } from './-components/snapshot-dialog'
import { useIsMobile } from '@/hooks/use-mobile'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import { cn } from '@/lib/utils'
import Hotkeys from './-components/hotkeys'
import { NotFoundError } from '@/components/not-found-error'
import { UserHouseholdProvider } from '@/hooks/use-user-household'
import { GenericError } from '@/components/generic-error'

import { identity } from 'lodash-es'
import { ViewScopeSwitcher } from './-components/view-scope-switcher'

const routeHouseholdIdQuery = graphql`
  query routeHouseholdIdQuery($viewUserIds: [ID!]) {
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
      ...logTransactionFragment @arguments(viewUserIds: $viewUserIds)
      ...snapshotDialogFragment @arguments(viewUserIds: $viewUserIds)
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
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  loader: async ({ params }) => {
    localStorage.setItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY, params.householdId)

    const variables = {
      viewUserIds: readViewUserIds(params.householdId),
    }

    try {
      await fetchQuery<routeHouseholdIdQuery>(
        environment,
        routeHouseholdIdQuery,
        variables,
      ).toPromise()
    } catch (error) {
      if (isMembershipRevokedError(error)) {
        clearHouseholdScopedStorage()
        toast.error('You no longer have access to this household.')
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
  const params = Route.useParams()
  const queryRef = Route.useLoaderData()
  const data = usePreloadedQuery<routeHouseholdIdQuery>(
    routeHouseholdIdQuery,
    queryRef,
  )
  const isMobile = useIsMobile()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { isPrivacyModeEnabled, togglePrivacyMode } = usePrivacyMode()
  const { setTheme } = useTheme()
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
          toast.error(
            `Sync failed: ${errors?.[0]?.message ?? 'No data was refreshed'}`,
          )
          return
        }

        toast.success('Account data refreshed.')
      },
      onError: (error) => {
        toast.error(`Sync failed: ${error.message}`)
      },
    })
  }, [commitRefresh, params.householdId])

  useSubscribeToInvalidationState([params.householdId], () => {
    fetchQuery(
      environment,
      routeHouseholdIdQuery,
      { viewUserIds: readViewUserIds(params.householdId) },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  return (
    <UserProvider userRef={data.user}>
      <HouseholdProvider householdRef={data.household}>
        <HouseholdMembersProvider householdRef={data.household}>
          <UserHouseholdProvider userHouseholdRef={data.userHousehold}>
            <DisplayCurrencyProvider householdRef={data.household}>
              <Hotkeys />
              <CommandMenu />
              <SidebarProvider className="h-dvh min-h-0 min-w-0 overflow-hidden">
                <AppSidebar fragmentRef={data} />
                <SidebarInset className="h-dvh min-h-0 min-w-0 overflow-hidden md:h-[calc(100dvh-1rem)]">
                  <header className="liquid-glass-chrome z-30 mx-2 mt-2 flex h-11 shrink-0 items-center rounded-xl p-1 transition-[width,height] duration-200 ease-[var(--ease-out-quint)]">
                    <SidebarTrigger className="cursor-pointer" />
                    <div className="flex flex-1 items-center px-3">
                      <Breadcrumb>
                        <BreadcrumbList></BreadcrumbList>
                      </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {!isOnSettingsPage && (
                        <div>
                          <ViewScopeSwitcher />
                        </div>
                      )}
                      {currencies.length > 1 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                className="h-9 cursor-pointer rounded-lg border-0 bg-clip-border px-2 font-mono text-xs"
                              >
                                {activeCurrencyCode || 'Currency'}
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="min-w-0">
                            {currencies.map((hc) => (
                              <DropdownMenuItem
                                key={hc.id}
                                onClick={() => handleCurrencyChange(hc.id)}
                                className={cn(
                                  'justify-center font-mono',
                                  hc.id === displayCurrencyId && 'font-bold',
                                )}
                              >
                                {hc.code}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <div>
                        <SnapshotDialog fragmentRef={data.household} />
                      </div>
                      <div className="hidden md:block">
                        <Button
                          variant="ghost"
                          className="size-9 shrink-0 cursor-pointer rounded-lg border-0 bg-clip-border"
                          onClick={handleRefreshAccountData}
                          disabled={isRefreshInFlight}
                          aria-label="Refresh account data"
                        >
                          <RefreshCwIcon
                            className={isRefreshInFlight ? 'animate-spin' : ''}
                          />
                        </Button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              className="size-9 shrink-0 cursor-pointer rounded-lg border-0 bg-clip-border"
                            >
                              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                              <span className="sr-only">Toggle theme</span>
                            </Button>
                          }
                        ></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setTheme('light')}>
                            Light
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme('dark')}>
                            Dark
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme('system')}>
                            System
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        className="size-9 shrink-0 cursor-pointer rounded-lg border-0 bg-clip-border"
                        onClick={togglePrivacyMode}
                        aria-label={
                          isPrivacyModeEnabled
                            ? 'Show financial values'
                            : 'Hide financial values'
                        }
                      >
                        {isPrivacyModeEnabled ? <EyeIcon /> : <EyeOffIcon />}
                      </Button>
                    </div>
                  </header>
                  <div className="mobile-content-bottom-corners relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <Outlet />
                  </div>
                  <AppActionDock
                    isMobile={isMobile}
                    isRefreshing={isRefreshInFlight}
                    onRefresh={handleRefreshAccountData}
                  />
                </SidebarInset>

                {!isMobile && (
                  <FloatingLogTransactionWindow fragmentRef={data.household} />
                )}
              </SidebarProvider>
            </DisplayCurrencyProvider>
          </UserHouseholdProvider>
        </HouseholdMembersProvider>
      </HouseholdProvider>
    </UserProvider>
  )
}

type FloatingLogTransactionWindowProps = {
  fragmentRef: logTransactionFragment$key
}

function FloatingLogTransactionWindow({
  fragmentRef,
}: FloatingLogTransactionWindowProps) {
  const { type: logTransactionType, close: closeLogTransaction } =
    useLogTransaction()

  return (
    <Rnd
      enableResizing={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      default={{
        x: window.innerWidth / 2 - 300,
        y: window.innerHeight / 2 - 400,
        width: '420',
        height: 'auto',
      }}
      bounds="window"
      dragHandleClassName="drag-handle"
      style={{ zIndex: 50 }}
    >
      {logTransactionType && (
        <Item
          className={cn(
            'liquid-glass-popover h-full w-full gap-0 overflow-hidden rounded-2xl p-0',
          )}
        >
          <div className="drag-handle flex w-full cursor-move items-center justify-between border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <GripVertical className="text-muted-foreground h-5 w-5" />
              <span className="text-sm font-semibold">Log Transaction</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={closeLogTransaction}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <LogTransaction fragmentRef={fragmentRef} />
        </Item>
      )}
    </Rnd>
  )
}
