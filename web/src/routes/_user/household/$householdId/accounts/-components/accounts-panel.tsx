import { useLingui } from '@lingui/react/macro'
import { useFinanceLabel } from '@/hooks/use-finance-label'
import { Trans } from '@lingui/react/macro'
import { useIsMobile } from '@/hooks/use-mobile'
import { Card } from '@astryxdesign/core/Card'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Grid } from '@astryxdesign/core/Grid'
import { Heading } from '@astryxdesign/core/Heading'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { List } from '@astryxdesign/core/List'
import { Section } from '@astryxdesign/core/Section'
import { Selector } from '@astryxdesign/core/Selector'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import currency from 'currency.js'
import { groupBy } from 'lodash-es'
import { Suspense, useMemo, useState } from 'react'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'

import { PageAddButton } from '@/components/page-add-button'
import type { accountsPanelFragment$key } from './__generated__/accountsPanelFragment.graphql'
import { AccountLedgerRow } from './account-ledger-row'
import {
  calculateAllocationPercentage,
  getAccountDisplayValue,
} from './account-ledger-utils'
import { NetWorthChart } from './net-worth-chart'

import {
  ACCOUNT_CATEGORY_APPLICABLE_TYPES,
  ACCOUNT_CATEGORY_LABEL,
  ACCOUNT_TYPE_LIST,
} from '@/constant'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { NodeType, useRegisterConnection } from '@/lib/relay'

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

type AccountsListPageProps = {
  fragmentRef: accountsPanelFragment$key
}

export function AccountsPanel({ fragmentRef }: AccountsListPageProps) {
  const { t } = useLingui()
  type SortOption = keyof typeof SORT_OPTIONS
  type GroupByOption = keyof typeof GROUP_BY_OPTIONS
  const financeLabel = useFinanceLabel()
  const SORT_OPTIONS = {
    value_desc: t`Largest first`,
    updated_desc: t`Recently active`,
    name_asc: t`Name A–Z`,
  } as const

  const GROUP_BY_OPTIONS = {
    type: 'By type',
    category: t`By category`,
  } as const

  const isMobile = useIsMobile()
  const data = useFragment(AccountsPanelFragment, fragmentRef)
  const { household } = useHousehold()
  const { displayCurrencyCode, convert } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const navigate = useNavigate()
  const { householdId } = useParams({
    from: '/_user/household/$householdId',
  })
  const search = useSearch({
    from: '/_user/household/$householdId/accounts',
  })
  const groupByOption = search.accounts_group_by as GroupByOption
  const sortOption = search.accounts_sort_by as SortOption

  useRegisterConnection(data.accounts.__id, NodeType.Account)

  const [searchFilter, setSearchFilter] = useState('')

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
                getAccountDisplayValue(
                  accountB.displayValue.value,
                  accountB.node.type,
                ) -
                getAccountDisplayValue(
                  accountA.displayValue.value,
                  accountA.node.type,
                )
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
      { label: t`Net Worth`, value: assets.add(liabilities) },
      { label: t`Assets`, value: assets },
      { label: t`Liabilities`, value: liabilities },
    ]
  }, [t, accountItems])

  return (
    <VStack gap={6}>
      <HStack hAlign="between" vAlign="center" wrap="wrap" gap={4}>
        <VStack gap={1}>
          <Heading level={1}>
            <Trans>Accounts</Trans>
          </Heading>
        </VStack>
        <PageAddButton
          label={t`Add account`}
          to="/household/$householdId/accounts/new"
          params={{ householdId }}
        />
      </HStack>
      {isMobile ? (
        <Card>
          <VStack gap={3}>
            {displayOptions.map((option, index) => (
              <HStack
                key={option.label}
                hAlign="between"
                vAlign="center"
                gap={3}
                wrap="wrap"
              >
                <Text color="secondary">{option.label}</Text>
                <Text type="label" hasTabularNumbers>
                  {formatCurrencyWithPrivacyMode({
                    value: option.value,
                    currencyCode: displayCurrencyCode,
                    liability: index === 2,
                  })}
                </Text>
              </HStack>
            ))}
            <Text type="supporting" color="secondary">
              {displayCurrencyCode}
            </Text>
          </VStack>
        </Card>
      ) : (
        <Grid columns={{ minWidth: 240, max: 3, repeat: 'fit' }} gap={4}>
          {displayOptions.map((option, index) => (
            <Card key={option.label}>
              <VStack gap={3}>
                <Text color="secondary">{option.label}</Text>
                <Heading level={2}>
                  {formatCurrencyWithPrivacyMode({
                    value: option.value,
                    currencyCode: displayCurrencyCode,
                    liability: index === 2,
                  })}
                </Heading>
                <Text type="supporting">{displayCurrencyCode}</Text>
              </VStack>
            </Card>
          ))}
        </Grid>
      )}
      <Suspense fallback={<Skeleton height={200} />}>
        <NetWorthChart />
      </Suspense>
      <Section padding={6}>
        <VStack gap={4}>
          <HStack gap={3} vAlign="end" wrap="wrap">
            <TextInput
              label={t`Search accounts`}
              placeholder={t`Search by name`}
              value={searchFilter}
              onChange={setSearchFilter}
            />
            <Selector
              label={t`Sort by`}
              value={sortOption}
              onChange={handleSortChange}
              options={Object.entries(SORT_OPTIONS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <Selector
              label={t`Group by`}
              value={groupByOption}
              onChange={handleGroupByChange}
              options={Object.entries(GROUP_BY_OPTIONS).map(
                ([value, label]) => ({ value, label }),
              )}
            />
          </HStack>
          {visibleGroups.length ? (
            visibleGroups.map(({ key, accounts }) => {
              const total = accounts.reduce(
                (sum, item) => sum.add(item.displayValue),
                currency(0),
              )
              const label =
                groupByOption === 'category'
                  ? (ACCOUNT_CATEGORY_LABEL[key] ?? financeLabel(key))
                  : financeLabel(key)
              return (
                <List
                  edge="outset"
                  key={key}
                  hasDividers
                  header={
                    <HStack hAlign="between" vAlign="center" gap={3}>
                      <Heading level={3}>{label}</Heading>
                      <Text color="secondary" hasTabularNumbers>
                        {formatCurrencyWithPrivacyMode({
                          value: total,
                          currencyCode: displayCurrencyCode,
                          liability: accounts.every(
                            ({ node }) => node.type === 'liability',
                          ),
                        })}
                      </Text>
                    </HStack>
                  }
                >
                  {accounts.map((account) => (
                    <AccountLedgerRow
                      key={account.node.id}
                      fragmentRef={account.node}
                      displayValue={account.displayValue}
                      displayCurrencyCode={displayCurrencyCode}
                      share={calculateAllocationPercentage(
                        getAccountDisplayValue(
                          account.displayValue.value,
                          account.node.type,
                        ),
                        total.value,
                      )}
                    />
                  ))}
                </List>
              )
            })
          ) : (
            <EmptyState
              title={t`No accounts found`}
              description={
                searchFilter
                  ? t`Try another account name.`
                  : t`Add your first account to start tracking your balances.`
              }
            />
          )}
        </VStack>
      </Section>
    </VStack>
  )
}
