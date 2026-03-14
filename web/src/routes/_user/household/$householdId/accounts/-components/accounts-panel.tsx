import { commitLocalUpdate, graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { useFragment, useMutation, useRelayEnvironment } from 'react-relay'
import { capitalize, groupBy, map } from 'lodash-es'
import { Fragment, Suspense } from 'react'
import { useMemo, useState } from 'react'
import currency from 'currency.js'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { RefreshCwIcon } from 'lucide-react'
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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
import { useCurrency } from '@/hooks/use-currency'
import { cn } from '@/lib/utils'
import { useHousehold } from '@/hooks/use-household'
import { Button } from '@/components/ui/button'
import { ACCOUNT_TYPE_LIST } from '@/constant'
import { PlusButton } from '@/components/plus-button'
import { Skeleton } from '@/components/ui/skeleton'

const AccountsPanelFragment = graphql`
  fragment accountsPanelFragment on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 50 }
    cursor: { type: "Cursor" }
  )
  @refetchable(queryName: "accountsPanelRefetch") {
    accounts(first: $count, after: $cursor, where: { archived: false })
      @connection(key: "accountsPanel_accounts") {
      edges {
        node {
          id
          type
          name
          valueInHouseholdCurrency
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

export function AccountsPanel({ fragmentRef }: AccountsListPageProps) {
  const data = useFragment(AccountsPanelFragment, fragmentRef)
  const environment = useRelayEnvironment()

  const [commitRefreshMutation, isRefreshInFlight] =
    useMutation<accountsPanelRefreshMutation>(AccountsPanelRefreshMutation)

  const [displayIndex, setDisplayIndex] = useState(0)

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

  const groupedAccounts = useMemo(
    () =>
      groupBy(data.accounts.edges, (edge) => {
        invariant(edge?.node, 'Account node is null')
        return edge.node.type
      }),
    [data.accounts],
  )

  const { household } = useHousehold()

  const displayOptions = useMemo(() => {
    const assets = (data.accounts.edges ?? [])
      .filter((edge) => {
        invariant(edge?.node, 'Account node is null')
        return edge.node.type !== 'liability'
      })
      .map((edge) => {
        invariant(edge?.node, 'Account node is null')
        return currency(edge.node.valueInHouseholdCurrency)
      })
      .reduce((a, b) => a.add(b), currency(0))

    const liabilities = (data.accounts.edges ?? [])
      .filter((edge) => {
        invariant(edge?.node, 'Account node is null')
        return edge.node.type === 'liability'
      })
      .map((edge) => {
        invariant(edge?.node, 'Account node is null')
        return currency(edge.node.valueInHouseholdCurrency)
      })
      .reduce((a, b) => a.add(b), currency(0))

    const netWorth = assets.add(liabilities) // liabilities are negative

    return [
      { label: 'Net Worth', value: netWorth },
      { label: 'Assets', value: assets },
      { label: 'Liabilities', value: liabilities },
    ]
  }, [data.accounts])

  const cycleDisplay = () => {
    setDisplayIndex((prev) => (prev + 1) % displayOptions.length)
  }

  return (
    <Fragment>
      <div className="fixed right-4 bottom-4 flex flex-col items-end gap-2 lg:absolute">
        <Button
          variant="outline"
          nativeButton={true}
          size="icon-xl"
          className="bg-background dark:bg-card rounded-full"
          onClick={handleRefresh}
          disabled={isRefreshInFlight}
        >
          <RefreshCwIcon className={isRefreshInFlight ? 'animate-spin' : ''} />
        </Button>
        <PlusButton />
      </div>
      <Item variant="outline" className="cursor-pointer" onClick={cycleDisplay}>
        <ItemContent>
          <ItemDescription>
            {displayOptions[displayIndex].label}
          </ItemDescription>
          <ItemTitle className="text-xl tabular-nums">
            {formatCurrencyWithPrivacyMode({
              value: displayOptions[displayIndex].value,
              currencyCode: household.currency.code,
              liability: displayIndex === 2, // Show liability formatting for Total Liabilities
            })}
          </ItemTitle>
        </ItemContent>
      </Item>
      <div className="py-1"></div>
      <Suspense
        fallback={
          <Item
            variant="outline"
            className="w-full flex-col items-stretch gap-0 px-0 py-0"
          >
            <div className="px-3 pt-2.5 pb-1">
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="mx-3 h-36 rounded-md" />
            <div className="flex justify-end px-3 pt-1 pb-2.5">
              <Skeleton className="h-5 w-32" />
            </div>
          </Item>
        }
      >
        <NetWorthChart />
      </Suspense>
      <div className="py-1"></div>
      <Accordion
        multiple
        className="w-full"
        defaultValue={[...ACCOUNT_TYPE_LIST]}
      >
        {map(ACCOUNT_TYPE_LIST, (type) => {
          if (type in groupedAccounts === false) {
            return null
          }
          const accounts = groupedAccounts[type].sort((a, b) =>
            (a?.node?.name ?? '').localeCompare(b?.node?.name ?? ''),
          )
          return (
            <AccordionItem value={type} key={type}>
              <AccordionTrigger className="cursor-pointer justify-normal gap-2 hover:no-underline **:data-[slot=accordion-trigger-icon]:ml-0">
                <span>{capitalize(type)}</span>
                <span className="grow"></span>
                <span className="text-md mr-3 tracking-wide tabular-nums">
                  {formatCurrencyWithPrivacyMode({
                    value: accounts
                      .map((account) => {
                        invariant(account?.node, 'Account node is null')
                        return currency(account.node.valueInHouseholdCurrency)
                      })
                      .reduce((a, b) => a.add(b), currency(0)),
                    currencyCode: 'CAD',
                    liability: type === 'liability',
                  })}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-1">
                <ItemGroup className="gap-0">
                  {accounts.map((account) => {
                    invariant(account?.node, 'Account node is null')
                    return (
                      <Fragment key={account.node.id}>
                        <ItemSeparator className="my-1" />
                        <AccountCard fragmentRef={account.node} />
                      </Fragment>
                    )
                  })}
                </ItemGroup>
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
          '**:data-[slot=accordion-trigger-icon]:text-muted-foreground group/accordion-trigger flex flex-1 items-start justify-between gap-6 border border-transparent p-2 text-left text-xs/relaxed font-medium transition-all outline-none hover:underline disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4',
          className,
        )}
        {...props}
      >
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <HugeiconsIcon
          icon={ArrowUp01Icon}
          strokeWidth={2}
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}
