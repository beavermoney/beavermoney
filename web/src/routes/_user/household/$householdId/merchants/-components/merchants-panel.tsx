import { useLingui } from '@lingui/react/macro'
import { plural } from '@lingui/core/macro'
import Decimal from 'decimal.js'
import { useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { useFragment, graphql } from 'react-relay'
import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { List } from '@astryxdesign/core/List'
import { Stack, StackItem } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl'
import { Icon } from '@astryxdesign/core/Icon'
import { Plus, CircleHelp } from 'lucide-react'
import { DatePeriodFilter } from '@/components/date-period-filter'
import { RouterListItem } from '@/components/router-list-item'
import { MerchantAvatar } from '@/components/merchant-avatar'
import { useCurrency } from '@/hooks/use-currency'
import { useHistoryState } from '@/hooks/use-history-state'
import { MerchantEditor } from './merchant-editor'
import type { merchantsPanelFragment$key } from './__generated__/merchantsPanelFragment.graphql'

const fragment = graphql`
  fragment merchantsPanelFragment on Household
  @argumentDefinitions(
    startDate: { type: "Time!" }
    endDate: { type: "Time!" }
    viewUserIds: { type: "[ID!]" }
  ) {
    merchantInsights(
      period: { startDate: $startDate, endDate: $endDate }
      viewUserIDs: $viewUserIds
    ) {
      currencyCode
      unassigned {
        total
        transactionCount
      }
      merchants {
        merchant {
          id
          name
          icon
        }
        summary {
          total
          transactionCount
        }
      }
    }
  }
`
export function MerchantsPanel({
  fragmentRef,
  start,
  end,
  onDateRangeChange,
}: {
  fragmentRef: merchantsPanelFragment$key
  start: string
  end: string
  onDateRangeChange: (start: string, end: string) => Promise<void>
}) {
  const { t, i18n } = useLingui()
  const { householdId } = useParams({ from: '/_user/household/$householdId' })
  const data = useFragment(fragment, fragmentRef).merchantInsights
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const [sort, setSort] = useHistoryState<'spend' | 'count'>(
    'merchants:sort',
    'spend',
  )
  const [creating, setCreating] = useState(false)
  const money = (value: string) =>
    formatCurrencyWithPrivacyMode({ value, currencyCode: data.currencyCode })
  const count = (value: number) =>
    t({
      message: plural(value, { one: '# transaction', other: '# transactions' }),
    })
  const merchants = [...data.merchants].sort((a, b) => {
    const spend = new Decimal(b.summary.total).cmp(a.summary.total)
    const frequency = b.summary.transactionCount - a.summary.transactionCount
    return (
      (sort === 'spend' ? spend || frequency : frequency || spend) ||
      a.merchant.name.localeCompare(b.merchant.name, i18n.locale)
    )
  })
  return (
    <Stack gap={6}>
      <Stack direction="horizontal" gap={3} align="center" wrap="wrap">
        <StackItem size="fill">
          <Heading level={1}>{t`Merchants`}</Heading>
        </StackItem>
        <Button
          label={t`Add merchant`}
          variant="secondary"
          icon={<Icon icon={Plus} />}
          onClick={() => setCreating(true)}
        />
      </Stack>
      <DatePeriodFilter
        startDate={start}
        endDate={end}
        onDateRangeChange={onDateRangeChange}
      />
      <Stack gap={3}>
        <Stack
          direction="horizontal"
          gap={3}
          align="center"
          justify="between"
          wrap="wrap"
        >
          <Heading level={2}>{t`Leaderboard`}</Heading>
          <SegmentedControl
            label={t`Rank merchants by`}
            value={sort}
            onChange={(value) => setSort(value === 'count' ? 'count' : 'spend')}
          >
            <SegmentedControlItem value="spend" label={t`Spend`} />
            <SegmentedControlItem value="count" label={t`Count`} />
          </SegmentedControl>
        </Stack>
        <List
          aria-label={t`Merchant leaderboard`}
          edge="padded"
          density="spacious"
        >
          {merchants.map(({ merchant, summary }, index) => (
            <RouterListItem
              key={merchant.id}
              to="/household/$householdId/merchants/$merchantId"
              params={{ householdId, merchantId: merchant.id }}
              search={(previous) => previous}
              label={merchant.name}
              startContent={
                <Stack direction="horizontal" gap={3} align="center">
                  <Text
                    type="supporting"
                    color="secondary"
                    hasTabularNumbers
                    className="w-6 text-right"
                  >
                    {i18n.number(index + 1)}
                  </Text>
                  <MerchantAvatar
                    merchant={{ name: merchant.name, icon: merchant.icon }}
                  />
                </Stack>
              }
              description={
                sort === 'spend'
                  ? count(summary.transactionCount)
                  : money(summary.total)
              }
              endContent={
                <Text
                  hasTabularNumbers
                  className="text-right"
                  textWrap="nowrap"
                >
                  {sort === 'spend'
                    ? money(summary.total)
                    : count(summary.transactionCount)}
                </Text>
              }
            />
          ))}
        </List>
        {merchants.length === 0 && (
          <Text
            type="supporting"
            color="secondary"
          >{t`Add a merchant when logging an expense to start your leaderboard.`}</Text>
        )}
        {data.unassigned.transactionCount > 0 && (
          <List
            aria-label={t`Unassigned expenses`}
            edge="padded"
            density="spacious"
          >
            <RouterListItem
              to="/household/$householdId/merchants/unassigned"
              params={{ householdId }}
              search={(previous) => previous}
              label={t`Unassigned`}
              description={count(data.unassigned.transactionCount)}
              startContent={<Icon icon={CircleHelp} />}
              endContent={
                <Text hasTabularNumbers textWrap="nowrap">
                  {money(data.unassigned.total)}
                </Text>
              }
            />
          </List>
        )}
      </Stack>
      {creating && <MerchantEditor onClose={() => setCreating(false)} />}
    </Stack>
  )
}
