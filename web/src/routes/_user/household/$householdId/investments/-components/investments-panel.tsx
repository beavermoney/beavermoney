import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { Collapsible } from '@astryxdesign/core/Collapsible'
import { Heading } from '@astryxdesign/core/Heading'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { List } from '@astryxdesign/core/List'
import { Selector } from '@astryxdesign/core/Selector'
import { Stack, StackItem } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import currency from 'currency.js'
import { groupBy, map } from 'lodash-es'
import { useMemo } from 'react'
import { useFragment } from 'react-relay'
import { Fragment } from 'react/jsx-runtime'
import { graphql } from 'relay-runtime'
import invariant from 'tiny-invariant'
import type { investmentsPanelFragment$key } from './__generated__/investmentsPanelFragment.graphql'
import { InvestmentCard } from './investment-card'

import { PageAddButton } from '@/components/page-add-button'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { NodeType, useRegisterConnection } from '@/lib/relay'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'

const InvestmentsPanelFragment = graphql`
  fragment investmentsPanelFragment on Household
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 50 }
    cursor: { type: "Cursor" }
    viewUserIds: { type: "[ID!]" }
  )
  @refetchable(queryName: "investmentsPanelRefetch") {
    investments(
      first: $count
      after: $cursor
      where: { userIDIn: $viewUserIds }
    ) @connection(key: "investmentsPanel_investments") {
      __id
      edges {
        node {
          id
          name
          amount
          value
          account {
            name
            id
            householdCurrency {
              code
            }
          }
          ...investmentCardFragment
        }
      }
    }
  }
`

type InvestmentsPanelProps = {
  fragmentRef: investmentsPanelFragment$key
}

export function InvestmentsPanel({ fragmentRef }: InvestmentsPanelProps) {
  const { t } = useLingui()
  type GroupByOption = keyof typeof GROUP_BY_OPTIONS
  const GROUP_BY_OPTIONS = {
    account: t`By Account`,
    symbol: t`By Symbol`,
  } as const

  const data = useFragment(InvestmentsPanelFragment, fragmentRef)
  const { household: _household } = useHousehold()
  const { displayCurrencyCode, convert } = useDisplayCurrency()
  const navigate = useNavigate()
  const { householdId } = useParams({
    from: '/_user/household/$householdId',
  })
  const search = useSearch({
    from: '/_user/household/$householdId/investments',
  })
  const groupByOption = search.investments_group_by

  const handleGroupByChange = (newGroupBy: string | null) => {
    if (!newGroupBy) return
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        investments_group_by: newGroupBy as GroupByOption,
      }),
    })
  }

  useRegisterConnection(data.investments.__id, NodeType.Investment)

  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const groupedInvestments = useMemo(
    () =>
      groupBy(
        data.investments.edges?.filter((i) => i?.node?.amount !== '0'),
        (investment) => {
          invariant(investment?.node, 'Investment node is null')
          if (groupByOption === 'symbol') {
            return investment.node.name
          }
          return investment.node.account.id
        },
      ),
    [data.investments, groupByOption],
  )

  const totalInvestment = useMemo(() => {
    return (data.investments.edges ?? [])
      .map((investment) => {
        invariant(investment?.node, 'Investment node is null')
        return convert(
          investment.node.value,
          investment.node.account.householdCurrency.code,
        )
      })
      .reduce((a, b) => a.add(b), currency(0))
  }, [data.investments, convert])

  return (
    <Fragment>
      <HStack hAlign="between" vAlign="center" wrap="wrap" gap={4}>
        <VStack gap={1}>
          <Heading level={1}>
            <Trans>Investments</Trans>
          </Heading>
        </VStack>
        <PageAddButton
          label={t`Add investment`}
          to="/household/$householdId/investments/new"
          params={{ householdId }}
        />
      </HStack>
      <Stack
        direction="horizontal"
        gap={4}
        align="end"
        justify="between"
        wrap="wrap"
      >
        <Stack direction="vertical" gap={1}>
          <Text color="secondary">
            <Trans>Portfolio value</Trans>
          </Text>
          <Text as="div" display="block" type="display-3" hasTabularNumbers>
            {formatCurrencyWithPrivacyMode({
              value: totalInvestment,
              currencyCode: displayCurrencyCode,
            })}
          </Text>
        </Stack>
        <Selector
          value={groupByOption}
          onChange={handleGroupByChange}
          label={t`Group by`}
          isLabelHidden
          options={[
            ...[
              ...(
                Object.entries(GROUP_BY_OPTIONS) as [GroupByOption, string][]
              ).map(([value, label]) => ({
                value: value,
                label: String(label),
              })),
            ],
          ]}
        />
      </Stack>

      <Stack direction="vertical" gap={4} key={groupByOption}>
        {map(groupedInvestments, (investments, groupKey) => {
          invariant(investments[0]?.node, 'Investment node is null')
          const groupLabel =
            groupByOption === 'symbol'
              ? investments[0].node.name
              : investments[0].node.account.name
          const value = investments
            .map((investment) => {
              invariant(investment?.node, 'Investment node is null')
              return convert(
                investment.node.value,
                investment.node.account.householdCurrency.code,
              )
            })
            .reduce((a, b) => a.add(b), currency(0))

          const percentage = (value.value / totalInvestment.value) * 100

          const totalShares =
            groupByOption === 'symbol'
              ? investments.reduce(
                  (sum, inv) => {
                    invariant(inv?.node, 'Investment node is null')
                    return sum.add(currency(inv.node.amount, { precision: 8 }))
                  },
                  currency(0, { precision: 8 }),
                ).value
              : null

          return (
            <Collapsible
              value={groupKey}
              key={groupKey}
              trigger={
                <Stack
                  direction="horizontal"
                  gap={3}
                  align="center"
                  width="100%"
                  wrap="wrap"
                >
                  <Text type="label">{groupLabel}</Text>
                  {totalShares !== null && totalShares > 0 && (
                    <Text type="supporting" hasTabularNumbers>
                      {totalShares} <Trans>shares</Trans>
                    </Text>
                  )}
                  <StackItem size="fill" />
                  <Text type="supporting" hasTabularNumbers>
                    {percentage.toFixed(2)}%
                  </Text>
                  <Text type="label" hasTabularNumbers>
                    {formatCurrencyWithPrivacyMode({
                      value,
                      currencyCode: displayCurrencyCode,
                    })}
                  </Text>
                </Stack>
              }
              defaultIsOpen
            >
              <List hasDividers edge="outset">
                {investments.map((investment) => {
                  invariant(investment?.node, 'Investment node is null')
                  return (
                    <InvestmentCard
                      key={investment.node.id}
                      fragmentRef={investment.node}
                    />
                  )
                })}
              </List>
            </Collapsible>
          )
        })}
      </Stack>
    </Fragment>
  )
}
