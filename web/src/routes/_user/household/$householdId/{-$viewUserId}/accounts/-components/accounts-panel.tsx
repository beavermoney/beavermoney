import { commitLocalUpdate, graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { useFragment, useMutation, useRelayEnvironment } from 'react-relay'
import { capitalize, groupBy, map } from 'lodash-es'
import { Fragment, Suspense } from 'react'
import { useMemo, useState } from 'react'
import currency from 'currency.js'
import { ChevronDownIcon, ChevronUpIcon, RefreshCwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { match } from 'ts-pattern'
import { AccountCard } from './account-card'
import { NetWorthChart } from './net-worth-chart'
import type { accountsPanelRefreshMutation } from './__generated__/accountsPanelRefreshMutation.graphql'
import type { accountsPanelFragment$key } from './__generated__/accountsPanelFragment.graphql'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion'

import { useCurrency } from '@/hooks/use-currency'
import { cn } from '@/lib/utils'
import { useHousehold } from '@/hooks/use-household'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { useUser } from '@/hooks/use-user'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import {
  ACCOUNT_TYPE_LIST,
  ACCOUNT_CATEGORY_LABEL,
  ACCOUNT_CATEGORY_APPLICABLE_TYPES,
} from '@/constant'
import { PlusButton } from '@/components/plus-button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'
import { NodeType, useRegisterConnection } from '@/lib/relay'

const AccountsPanelFragment = graphql`
  fragment accountsPanelFragment on Household
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 50 }
    cursor: { type: "Cursor" }
    viewUserId: { type: "ID" }
  )
  @refetchable(queryName: "accountsPanelRefetch") {
    accounts(
      first: $count
      after: $cursor
      where: { archived: false, userID: $viewUserId }
    ) @connection(key: "accountsPanel_accounts") {
      __id
      edges {
        node {
          id
          type
          category
          name
          value
          householdCurrency {
            code
          }
          ...accountCardFragment
        }
      }
    }
  }
`

const AccountsPanelRefreshMutation = graphql`
  mutation accountsPanelRefreshMutation {
    refresh
  }
`

type AccountsListPageProps = {
  fragmentRef: accountsPanelFragment$key
}

const GROUP_BY_OPTIONS = {
  type: 'By Type',
  category: 'By Category',
} as const

type GroupByOption = keyof typeof GROUP_BY_OPTIONS

export function AccountsPanel({ fragmentRef }: AccountsListPageProps) {
  const data = useFragment(AccountsPanelFragment, fragmentRef)
  const environment = useRelayEnvironment()
  const { household: _household } = useHousehold()
  const { displayCurrencyCode, convert } = useDisplayCurrency()
  const navigate = useNavigate()
  const { householdId } = useParams({
    from: '/_user/household/$householdId/{-$viewUserId}',
  })
  const { viewUserId } = useHouseholdViewScope()
  const { user } = useUser()
  const isViewingOtherUser = viewUserId !== null && viewUserId !== user.id

  const search = useSearch({
    from: '/_user/household/$householdId/{-$viewUserId}/accounts',
  })
  const groupByOption = search.accounts_group_by as GroupByOption

  const handleGroupByChange = (newGroupBy: string | null) => {
    if (!newGroupBy) return
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        accounts_group_by: newGroupBy as GroupByOption,
      }),
    })
  }

  useRegisterConnection(data.accounts.__id, NodeType.Account)

  const [commitRefreshMutation, isRefreshInFlight] =
    useMutation<accountsPanelRefreshMutation>(AccountsPanelRefreshMutation)

  const [displayIndex, setDisplayIndex] = useState(0)
  const [searchFilter, setSearchFilter] = useState('')

  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const handleRefresh = () => {
    commitRefreshMutation({
      variables: {},
      onCompleted: (data, errors) => {
        const result = { status: 'success' as const, data, errors }
        match(result)
          .with({ status: 'success', errors: null }, () => {
            // Invalidate the Relay store to refetch all queries
            commitLocalUpdate(environment, (store) => {
              store.invalidateStore()
            })
            toast.success('Accounts refreshed successfully!')
          })
          .with({ status: 'success' }, ({ errors }) => {
            toast.error(
              `Refresh failed: ${errors?.[0]?.message ?? 'Unknown error'}`,
            )
          })
          .exhaustive()
      },
      onError: (error) => {
        toast.error(`Refresh failed: ${error.message}`)
      },
    })
  }

  const groupedAccounts = useMemo(() => {
    if (groupByOption === 'category') {
      const eligible = (data.accounts.edges ?? []).filter((edge) => {
        invariant(edge?.node, 'Account node is null')
        return ACCOUNT_CATEGORY_APPLICABLE_TYPES.has(edge.node.type)
      })
      return groupBy(eligible, (edge) => {
        invariant(edge?.node, 'Account node is null')
        return edge.node.category ?? 'taxable'
      })
    }
    return groupBy(data.accounts.edges, (edge) => {
      invariant(edge?.node, 'Account node is null')
      return edge.node.type
    })
  }, [data.accounts, groupByOption])

  const groupKeys = useMemo(() => {
    if (groupByOption === 'category') {
      const keys = Object.keys(groupedAccounts)
      const categorized = keys.filter((k) => k !== 'taxable').sort()
      const taxable = keys.includes('taxable') ? ['taxable'] : []
      return [...categorized, ...taxable]
    }
    return ACCOUNT_TYPE_LIST.filter((t) => t in groupedAccounts)
  }, [groupedAccounts, groupByOption])

  const getGroupLabel = (key: string) => {
    if (groupByOption === 'category') {
      if (key === 'taxable') return 'Taxable'
      return ACCOUNT_CATEGORY_LABEL[key] ?? capitalize(key)
    }
    return capitalize(key)
  }

  const displayOptions = useMemo(() => {
    const assets = (data.accounts.edges ?? [])
      .filter((edge) => {
        invariant(edge?.node, 'Account node is null')
        return edge.node.type !== 'liability'
      })
      .map((edge) => {
        invariant(edge?.node, 'Account node is null')
        return convert(edge.node.value, edge.node.householdCurrency.code)
      })
      .reduce((a, b) => a.add(b), currency(0))

    const liabilities = (data.accounts.edges ?? [])
      .filter((edge) => {
        invariant(edge?.node, 'Account node is null')
        return edge.node.type === 'liability'
      })
      .map((edge) => {
        invariant(edge?.node, 'Account node is null')
        return convert(edge.node.value, edge.node.householdCurrency.code)
      })
      .reduce((a, b) => a.add(b), currency(0))

    const netWorth = assets.add(liabilities) // liabilities are negative

    return [
      { label: 'Net Worth', value: netWorth },
      { label: 'Assets', value: assets },
      { label: 'Liabilities', value: liabilities },
    ]
  }, [data.accounts, convert])

  return (
    <Fragment>
      <div className="fixed right-4 bottom-4 flex flex-col items-end gap-2 lg:absolute">
        <Button
          variant="outline"
          nativeButton={true}
          size="icon-lg"
          className="bg-background dark:bg-card"
          onClick={handleRefresh}
          disabled={isRefreshInFlight}
        >
          <RefreshCwIcon className={isRefreshInFlight ? 'animate-spin' : ''} />
        </Button>
        {!isViewingOtherUser && (
          <PlusButton
            to="/household/$householdId/{-$viewUserId}/accounts/new"
            params={{ householdId }}
          />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex gap-3">
          {displayOptions.map((option, index) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setDisplayIndex(index)}
              className={cn(
                'cursor-pointer text-[0.6875rem] font-medium tracking-wider uppercase transition-colors',
                index === displayIndex ? '' : 'text-muted-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">
          {formatCurrencyWithPrivacyMode({
            value: displayOptions[displayIndex].value,
            currencyCode: displayCurrencyCode,
            liability: displayIndex === 2, // Show liability formatting for Total Liabilities
          })}
        </div>
      </div>
      <div className="py-2"></div>
      <Suspense
        fallback={
          <div className="flex w-full flex-col items-stretch gap-0 rounded-md border border-transparent">
            <div className="flex gap-1 py-px">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-18 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
            <div className="py-1"></div>
            <Skeleton className="h-44 w-full rounded-md" />
            <div className="flex items-center gap-2 pt-1 pb-2.5">
              <Skeleton className="h-4 w-28" />
              <div className="grow"></div>
              <div className="flex gap-0.5">
                <Skeleton className="h-5 w-7 rounded-md" />
                <Skeleton className="h-5 w-7 rounded-md" />
                <Skeleton className="h-5 w-7 rounded-md" />
                <Skeleton className="h-5 w-7 rounded-md" />
                <Skeleton className="h-5 w-7 rounded-md" />
              </div>
            </div>
          </div>
        }
      >
        <NetWorthChart />
      </Suspense>
      <div className="py-2"></div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground/50 absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Filter accounts..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="max-w-64 pl-8 text-xs"
          />
        </div>
        <Select
          name="group-accounts"
          value={groupByOption}
          onValueChange={handleGroupByChange}
        >
          <SelectTrigger className="h-7 w-32">
            <SelectValue>{GROUP_BY_OPTIONS[groupByOption]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(
                Object.entries(GROUP_BY_OPTIONS) as [GroupByOption, string][]
              ).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="py-2"></div>
      <Accordion
        key={groupByOption}
        multiple
        className="w-full"
        defaultValue={[...groupKeys]}
      >
        {map(groupKeys, (key) => {
          const filterLower = searchFilter.toLowerCase()
          const accounts = groupedAccounts[key]
            .filter((account) => {
              if (!filterLower) return true
              invariant(account?.node, 'Account node is null')
              return account.node.name.toLowerCase().includes(filterLower)
            })
            .sort((a, b) =>
              (a?.node?.name ?? '').localeCompare(b?.node?.name ?? ''),
            )

          if (accounts.length === 0) return null
          const isLiabilityGroup =
            groupByOption === 'type' && key === 'liability'
          return (
            <AccordionItem
              value={key}
              key={key}
              className="data-open:bg-transparent"
            >
              <AccordionTrigger className="bg-muted/60 flex cursor-pointer items-center justify-normal gap-2 hover:no-underline **:data-[slot=accordion-trigger-icon]:ml-0">
                <span>{getGroupLabel(key)}</span>
                <span className="grow"></span>
                <span className="mr-3 text-sm font-semibold tracking-wide tabular-nums">
                  {formatCurrencyWithPrivacyMode({
                    value: accounts
                      .map((account) => {
                        invariant(account?.node, 'Account node is null')
                        return convert(
                          account.node.value,
                          account.node.householdCurrency.code,
                        )
                      })
                      .reduce((a, b) => a.add(b), currency(0)),
                    currencyCode: displayCurrencyCode,
                    liability: isLiabilityGroup,
                  })}
                </span>
              </AccordionTrigger>
              <AccordionContent className="-mx-2 pb-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {accounts.map((account) => {
                    invariant(account?.node, 'Account node is null')
                    return (
                      <AccountCard
                        className="rounded-none"
                        key={account.node.id}
                        fragmentRef={account.node}
                      />
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </Fragment>
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          '**:data-[slot=accordion-trigger-icon]:text-muted-foreground group/accordion-trigger flex flex-1 items-start justify-between gap-6 border border-transparent p-2 text-left text-sm/relaxed font-semibold transition-all outline-none hover:underline disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4',
          className,
        )}
        {...props}
      >
        <ChevronDownIcon
          strokeWidth={2}
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          strokeWidth={2}
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}
