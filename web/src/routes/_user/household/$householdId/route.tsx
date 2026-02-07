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
  stripSearchParams,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { commitLocalUpdate, fetchQuery, graphql, ROOT_ID } from 'relay-runtime'
import {
  loadQuery,
  usePreloadedQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import invariant from 'tiny-invariant'
import { Rnd } from 'react-rnd'
import { z } from 'zod'
import type { routeHouseholdIdQuery } from './__generated__/routeHouseholdIdQuery.graphql'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileFabNav } from '@/components/mobile-fab-nav'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Breadcrumb, BreadcrumbList } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Item } from '@/components/ui/item'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { HouseholdProvider } from '@/hooks/use-household'
import { LOCAL_STORAGE_HOUSEHOLD_ID_KEY } from '@/constant'
import { useTheme } from '@/components/theme-provider'
import { PendingComponent } from '@/components/pending-component'
import { environment } from '@/environment'
import { CommandMenu } from '@/components/command-menu'
import { LogTransaction } from './transactions/-components/log-transaction'
import { zodValidator } from '@tanstack/zod-adapter'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { EditTransactionDialog } from './transactions/-components/edit-transaction-dialog'

const routeHouseholdIdQuery = graphql`
  query routeHouseholdIdQuery {
    households {
      id
      # eslint-disable-next-line relay/unused-fields
      name
      # eslint-disable-next-line relay/unused-fields
      locale
      # eslint-disable-next-line relay/unused-fields
      currency {
        id
        code
      }
    }
    ...appSidebarFragment
    ...logTransactionFragment
  }
`

const searchSchema = z.object({
  log_type: z
    .enum(['expense', 'income', 'transfer', 'buy', 'sell', 'move'])
    .nullable()
    .default(null),
  command_open: z.boolean().optional().default(false),
  edit_transaction_id: z.string().nullable().default(null),
})

const defaultValues = {
  log_type: null,
  command_open: false,
  edit_transaction_id: null,
}

export const Route = createFileRoute('/_user/household/$householdId')({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
  staleTime: Infinity,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  loader: async ({ params }) => {
    localStorage.setItem(LOCAL_STORAGE_HOUSEHOLD_ID_KEY, params.householdId)
    await fetchQuery<routeHouseholdIdQuery>(
      environment,
      routeHouseholdIdQuery,
      {},
    ).toPromise()

    return loadQuery<routeHouseholdIdQuery>(
      environment,
      routeHouseholdIdQuery,
      {},
      { fetchPolicy: 'store-only' },
    )
  },
  pendingComponent: PendingComponent,
})

function RouteComponent() {
  const queryRef = Route.useLoaderData()
  const data = usePreloadedQuery<routeHouseholdIdQuery>(
    routeHouseholdIdQuery,
    queryRef,
  )
  const search = Route.useSearch()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  useSubscribeToInvalidationState([ROOT_ID], () => {
    return loadQuery<routeHouseholdIdQuery>(
      environment,
      routeHouseholdIdQuery,
      {},
      { fetchPolicy: 'network-only' },
    )
  })

  const { householdId } = Route.useParams()

  const household = data.households.find((h) => h.id === householdId)
  invariant(household, 'Household not found')

  const { isPrivacyModeEnabled, togglePrivacyMode } = usePrivacyMode()
  const { setTheme } = useTheme()

  const setLogTransactionOpen = (open: boolean) => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, log_type: open ? 'expense' : null }),
    })
  }
  const router = useRouter()

  return (
    <HouseholdProvider household={household}>
      <CommandMenu />
      <SidebarProvider>
        <AppSidebar fragmentRef={data} />
        <SidebarInset>
          <header className="bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1 cursor-pointer" />
              <Separator orientation="vertical" className="mr-2" />
              <Breadcrumb>
                <BreadcrumbList>
                  {/* <BreadcrumbItem className="hidden md:block"> */}
                  {/*   <BreadcrumbLink href="#"> */}
                  {/*     Building Your Application */}
                  {/*   </BreadcrumbLink> */}
                  {/* </BreadcrumbItem> */}
                  {/* <BreadcrumbSeparator className="hidden md:block" /> */}
                  {/* <BreadcrumbItem> */}
                  {/*   <BreadcrumbPage>Data Fetching</BreadcrumbPage> */}
                  {/* </BreadcrumbItem> */}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="grow"></div>

            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => {
                commitLocalUpdate(environment, (store) => {
                  store.invalidateStore()
                })
                router.invalidate()
              }}
            >
              <RefreshCwIcon />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="cursor-pointer">
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
              className="cursor-pointer"
              variant="outline"
              onClick={togglePrivacyMode}
            >
              {isPrivacyModeEnabled ? <EyeIcon /> : <EyeOffIcon />}
            </Button>
            <div className="px-1"></div>
          </header>
          <div className="flex flex-1 flex-col">
            <Outlet />
          </div>
        </SidebarInset>
        <MobileFabNav />

        {search.edit_transaction_id && (
          <EditTransactionDialog transactionId={search.edit_transaction_id} />
        )}

        {/* Desktop: Resizable & Draggable New Transaction Form */}
        {!isMobile && (
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
            <Item
              className={cn(
                'bg-muted h-full w-full gap-0 overflow-hidden p-0 shadow-2xl',
                search.log_type ? 'block' : 'hidden',
              )}
            >
              {/* Drag Handle Header */}
              <div className="drag-handle flex w-full cursor-move items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="text-muted-foreground h-5 w-5" />
                  <span className="text-sm font-semibold">Log Transaction</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setLogTransactionOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Transaction Form */}
              <LogTransaction fragmentRef={data} />
            </Item>
          </Rnd>
        )}
      </SidebarProvider>
    </HouseholdProvider>
  )
}
