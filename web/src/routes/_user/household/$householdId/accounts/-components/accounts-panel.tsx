import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import {
  useNavigate,
  useParams,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import currency from 'currency.js'
import { capitalize, groupBy } from 'lodash-es'
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from 'lucide-react'
import { Fragment, Suspense, useMemo, useState } from 'react'
import { useFragment, useRelayEnvironment } from 'react-relay'
import { commitLocalUpdate, graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'

import {
  ACCOUNT_TYPE_ACCENT_CLASSES,
  calculateAllocationPercentage,
  formatPercentageWithPrivacyMode,
  getAccountGroupAllocation,
} from './account-ledger-utils'
import { AccountLedgerRow } from './account-ledger-row'
import { NetWorthChart } from './net-worth-chart'
import type { accountsPanelFragment$key } from './__generated__/accountsPanelFragment.graphql'
import { PageAddButton } from '@/components/page-add-button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ACCOUNT_CATEGORY_APPLICABLE_TYPES,
  ACCOUNT_CATEGORY_LABEL,
  ACCOUNT_TYPE_LIST,
} from '@/constant'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { NodeType, useRegisterConnection } from '@/lib/relay'
import { cn } from '@/lib/utils'

const AccountsPanelFragment = graphql`
  fragment accountsPanelFragment on Household
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 50 }
    cursor: { type: "Cursor" }
    viewUserIds: { type: "[ID!]" }
  )
  @refetchable(queryName: "accountsPanelRefetch") {
    accounts(
      first: $count
      after: $cursor
      where: { archived: false, userIDIn: $viewUserIds }
    ) @connection(key: "accountsPanel_accounts") {
      __id
      edges {
        node {
          id
          type
          category
          name
          value
          latestTransaction {
            datetime
          }
          householdCurrency {
            code
          }
          ...accountLedgerRowFragment
        }
      }
    }
  }
`

const GROUP_BY_OPTIONS = {
  type: 'By type',
  category: 'By category',
} as const

const SORT_OPTIONS = {
  value_desc: 'Largest first',
  updated_desc: 'Recently active',
  name_asc: 'Name A–Z',
} as const

type AccountsListPageProps = {
  fragmentRef: accountsPanelFragment$key
}

type GroupByOption = keyof typeof GROUP_BY_OPTIONS
type SortOption = keyof typeof SORT_OPTIONS

export function AccountsPanel({ fragmentRef }: AccountsListPageProps) {
  const data = useFragment(AccountsPanelFragment, fragmentRef)
  const environment = useRelayEnvironment()
  const { household } = useHousehold()
  const {
    displayCurrencyCode,
    nextDisplayCurrencyCode,
    cycleDisplayCurrency,
    convert,
  } = useDisplayCurrency()
  const { isPrivacyModeEnabled } = usePrivacyMode()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const navigate = useNavigate()
  const router = useRouter()
  const { householdId } = useParams({
    from: '/_user/household/$householdId',
  })
  const search = useSearch({
    from: '/_user/household/$householdId/accounts',
  })
  const groupByOption = search.accounts_group_by as GroupByOption
  const sortOption = search.accounts_sort_by as SortOption

  useRegisterConnection(data.accounts.__id, NodeType.Account)

  const [displayIndex, setDisplayIndex] = useState(0)
  const [searchFilter, setSearchFilter] = useState('')
  const [showPercentages, setShowPercentages] = useState(false)

  const handleGroupByChange = (newGroupBy: string | null) => {
    if (!newGroupBy) return
    navigate({
      to: '.',
      search: (previous) => ({
        ...previous,
        accounts_group_by: newGroupBy as GroupByOption,
      }),
    })
  }

  const handleSortChange = (newSortOption: string | null) => {
    if (!newSortOption) return
    navigate({
      to: '.',
      search: (previous) => ({
        ...previous,
        accounts_sort_by: newSortOption as SortOption,
      }),
    })
  }

  const accountItems = useMemo(
    () =>
      (data.accounts.edges ?? []).map((edge) => {
        invariant(edge?.node, 'Account node is null')
        return {
          node: edge.node,
          displayValue: convert(
            edge.node.value,
            edge.node.householdCurrency.code,
          ),
        }
      }),
    [data.accounts.edges, convert],
  )

  const groupedAccounts = useMemo(() => {
    if (groupByOption === 'category') {
      const eligible = accountItems.filter(({ node }) =>
        ACCOUNT_CATEGORY_APPLICABLE_TYPES.has(node.type),
      )
      return groupBy(eligible, ({ node }) => node.category ?? 'taxable')
    }

    return groupBy(accountItems, ({ node }) => node.type)
  }, [accountItems, groupByOption])

  const groupKeys = useMemo(() => {
    if (groupByOption === 'category') {
      const keys = Object.keys(groupedAccounts)
      const categorized = keys.filter((key) => key !== 'taxable').sort()
      const taxable = keys.includes('taxable') ? ['taxable'] : []
      return [...categorized, ...taxable]
    }

    return ACCOUNT_TYPE_LIST.filter((type) => type in groupedAccounts)
  }, [groupedAccounts, groupByOption])

  const visibleGroups = useMemo(() => {
    const filterLower = searchFilter.trim().toLocaleLowerCase(household.locale)

    return groupKeys
      .map((key) => {
        const accounts = groupedAccounts[key].filter(({ node }) => {
          if (!filterLower) return true
          return node.name
            .toLocaleLowerCase(household.locale)
            .includes(filterLower)
        })

        accounts.sort((accountA, accountB) => {
          switch (sortOption) {
            case 'value_desc':
              return (
                Math.abs(accountB.displayValue.value) -
                Math.abs(accountA.displayValue.value)
              )
            case 'updated_desc': {
              const timeA = accountA.node.latestTransaction
                ? Date.parse(accountA.node.latestTransaction.datetime)
                : 0
              const timeB = accountB.node.latestTransaction
                ? Date.parse(accountB.node.latestTransaction.datetime)
                : 0
              return timeB - timeA
            }
            case 'name_asc':
              return accountA.node.name.localeCompare(
                accountB.node.name,
                household.locale,
              )
            default:
              invariant(false, `Unexpected account sort: ${sortOption}`)
          }
        })

        return { key, accounts }
      })
      .filter(({ accounts }) => accounts.length > 0)
  }, [groupKeys, groupedAccounts, household.locale, searchFilter, sortOption])

  const displayOptions = useMemo(() => {
    let assets = currency(0)
    let liabilities = currency(0)

    for (const account of accountItems) {
      if (account.node.type === 'liability') {
        liabilities = liabilities.add(account.displayValue)
      } else {
        assets = assets.add(account.displayValue)
      }
    }

    return [
      { label: 'Net Worth', value: assets.add(liabilities) },
      { label: 'Assets', value: assets },
      { label: 'Liabilities', value: liabilities },
    ]
  }, [accountItems])

  const assetsTotal = Math.abs(displayOptions[1].value.value)

  const getGroupLabel = (key: string) => {
    if (groupByOption === 'category') {
      if (key === 'taxable') return 'Taxable'
      return ACCOUNT_CATEGORY_LABEL[key] ?? capitalize(key)
    }
    return capitalize(key)
  }

  const formattedDisplayValue = formatCurrencyWithPrivacyMode({
    value: displayOptions[displayIndex].value,
    currencyCode: displayCurrencyCode,
    liability: displayIndex === 2,
  })

  const handleCycleDisplayCurrency = () => {
    if (!cycleDisplayCurrency()) return

    commitLocalUpdate(environment, (store) => {
      store.invalidateStore()
    })
    router.invalidate()
  }

  return (
    <Fragment>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
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
          {nextDisplayCurrencyCode ? (
            <button
              type="button"
              onClick={handleCycleDisplayCurrency}
              title={`Switch to ${nextDisplayCurrencyCode}`}
              aria-label={`${displayOptions[displayIndex].label}: ${formattedDisplayValue}. Displayed in ${displayCurrencyCode}. Switch to ${nextDisplayCurrencyCode}.`}
              className="focus-visible:ring-ring/30 -mx-1 w-fit cursor-pointer px-1 text-left text-3xl font-semibold tracking-tight tabular-nums outline-none focus-visible:ring-2"
            >
              {formattedDisplayValue}
            </button>
          ) : (
            <div className="text-3xl font-semibold tracking-tight tabular-nums">
              {formattedDisplayValue}
            </div>
          )}
        </div>
        <PageAddButton
          label="Add account"
          to="/household/$householdId/accounts/new"
          params={{ householdId }}
        />
      </div>

      <div className="py-2" />
      <Suspense fallback={<NetWorthChartSkeleton />}>
        <NetWorthChart />
      </Suspense>
      <div className="py-2" />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground/50 absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Filter accounts"
            value={searchFilter}
            onChange={(event) => setSearchFilter(event.target.value)}
            className="w-full pl-8 text-xs sm:max-w-64"
            aria-label="Filter accounts"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPercentages((current) => !current)}
            className="col-span-2 sm:col-span-1"
          >
            {showPercentages ? 'Show values' : 'Show percentages'}
          </Button>
          <Select
            name="sort-accounts"
            value={sortOption}
            onValueChange={handleSortChange}
          >
            <SelectTrigger
              className="w-full sm:w-36"
              aria-label="Sort accounts"
            >
              <SelectValue>{SORT_OPTIONS[sortOption]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(Object.entries(SORT_OPTIONS) as [SortOption, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            name="group-accounts"
            value={groupByOption}
            onValueChange={handleGroupByChange}
          >
            <SelectTrigger
              className="w-full sm:w-32"
              aria-label="Group accounts"
            >
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
      </div>

      <div className="py-2" />
      {visibleGroups.length > 0 ? (
        <Accordion
          key={groupByOption}
          multiple
          className="ring-foreground/10 overflow-hidden rounded-xl border-0 ring-1"
          defaultValue={visibleGroups.map(({ key }) => key)}
        >
          {visibleGroups.map(({ key, accounts }) => {
            const groupTotal = accounts.reduce(
              (total, account) => total.add(account.displayValue),
              currency(0),
            )
            const isLiabilityGroup = accounts.every(
              ({ node }) => node.type === 'liability',
            )
            const groupTypes = new Set(accounts.map(({ node }) => node.type))
            const groupAccentClass =
              groupTypes.size === 1
                ? (ACCOUNT_TYPE_ACCENT_CLASSES[[...groupTypes][0]] ??
                  'bg-chart-2')
                : 'bg-chart-2'
            const groupDisplayValue = showPercentages
              ? formatPercentageWithPrivacyMode(
                  getAccountGroupAllocation(groupTotal.value, assetsTotal)
                    .share,
                  household.locale,
                  isPrivacyModeEnabled,
                )
              : formatCurrencyWithPrivacyMode({
                  value: groupTotal,
                  currencyCode: displayCurrencyCode,
                  liability: isLiabilityGroup,
                })

            return (
              <AccordionItem
                value={key}
                key={key}
                className="data-open:bg-transparent"
              >
                <AccountGroupTrigger
                  label={getGroupLabel(key)}
                  total={groupDisplayValue}
                  accentClass={groupAccentClass}
                />
                <AccordionContent className="-mx-2 pb-0">
                  <AccountLedgerColumnHeader
                    displayCurrencyCode={displayCurrencyCode}
                  />
                  <div
                    role="list"
                    aria-label={`${getGroupLabel(key)} accounts`}
                  >
                    {accounts.map((account) => (
                      <AccountLedgerRow
                        key={account.node.id}
                        fragmentRef={account.node}
                        displayValue={account.displayValue}
                        displayCurrencyCode={displayCurrencyCode}
                        share={calculateAllocationPercentage(
                          account.displayValue.value,
                          groupTotal.value,
                        )}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      ) : (
        <Empty className="border py-10">
          <EmptyHeader>
            <EmptyTitle>No accounts found</EmptyTitle>
            <EmptyDescription>
              {searchFilter
                ? `No account names match “${searchFilter}”.`
                : 'Add an account to start building your balance sheet.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </Fragment>
  )
}

function NetWorthChartSkeleton() {
  return (
    <div className="flex w-full flex-col items-stretch gap-0 rounded-md border border-transparent">
      <div className="flex gap-1 py-px">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-5 w-18 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
      <div className="py-1" />
      <Skeleton className="h-44 w-full rounded-md" />
      <div className="flex items-center gap-2 pt-1 pb-2.5">
        <Skeleton className="h-4 w-28" />
        <div className="grow" />
        <div className="flex gap-0.5">
          <Skeleton className="h-5 w-7 rounded-md" />
          <Skeleton className="h-5 w-7 rounded-md" />
          <Skeleton className="h-5 w-7 rounded-md" />
          <Skeleton className="h-5 w-7 rounded-md" />
          <Skeleton className="h-5 w-7 rounded-md" />
        </div>
      </div>
    </div>
  )
}

function AccountLedgerColumnHeader({
  displayCurrencyCode,
}: {
  displayCurrencyCode: string
}) {
  return (
    <div className="bg-muted/30 text-muted-foreground hidden grid-cols-[minmax(13rem,1.45fr)_minmax(5rem,0.45fr)_minmax(7rem,0.65fr)_minmax(8rem,0.7fr)_minmax(8rem,0.75fr)_minmax(8rem,0.8fr)] gap-x-4 border-t px-3 py-1.5 text-[0.625rem] font-medium tracking-[0.04em] uppercase lg:grid">
      <span>Account</span>
      <span>Owner</span>
      <span>Updated</span>
      <span className="text-right">Original</span>
      <span className="text-right">Value ({displayCurrencyCode})</span>
      <span className="text-right">Share</span>
    </div>
  )
}

type AccountGroupTriggerProps = {
  label: string
  total: string
  accentClass: string
}

function AccountGroupTrigger({
  label,
  total,
  accentClass,
}: AccountGroupTriggerProps) {
  return (
    <AccordionPrimitive.Header className="sticky top-0 z-10 flex">
      <AccordionPrimitive.Trigger className="group/account-group bg-muted hover:bg-input/50 focus-visible:border-primary focus-visible:ring-primary/20 dark:bg-card dark:hover:bg-input grid min-h-12 flex-1 grid-cols-[minmax(0,1fr)_auto_1.75rem] items-center gap-x-3 border border-transparent px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50">
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={cn('size-2 shrink-0', accentClass)}
          />
          <span className="truncate text-sm font-semibold tracking-[0.06em] uppercase">
            {label}
          </span>
        </span>
        <span className="min-w-28 text-right text-base leading-none font-semibold tracking-tight tabular-nums lg:text-sm">
          {total}
        </span>
        <span className="text-muted-foreground group-hover/account-group:bg-background/70 flex size-7 items-center justify-center rounded-md transition-colors">
          <ChevronDownIcon className="pointer-events-none size-4 group-aria-expanded/account-group:hidden" />
          <ChevronUpIcon className="pointer-events-none hidden size-4 group-aria-expanded/account-group:block" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}
