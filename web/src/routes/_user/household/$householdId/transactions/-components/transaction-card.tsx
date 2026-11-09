import { CategoryIcon } from '@/components/category-icon'
import { InvestmentIcon } from '@/components/investment-icon'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { useCurrency } from '@/hooks/use-currency'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Token } from '@astryxdesign/core/Token'
import { Link } from '@tanstack/react-router'
import currency from 'currency.js'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'
import type { transactionCardFragment$key } from './__generated__/transactionCardFragment.graphql'

const transactionCardFragment = graphql`
  fragment transactionCardFragment on Transaction {
    id
    excludeFromReports
    transactionEntries {
      id
      amount
      account {
        name
        householdCurrency {
          code
        }
      }
    }
    investmentLots {
      id
      amount
      price
      investment {
        name
        symbol
        type
        account {
          name
        }
        householdCurrency {
          code
        }
      }
    }
    category {
      name
      type
      icon
    }
  }
`

export function TransactionCard({
  fragmentRef,
  onPreload,
}: {
  fragmentRef: transactionCardFragment$key
  onPreload: (transactionId: string) => void
}) {
  const { isPrivacyModeEnabled } = usePrivacyMode()
  const data = useFragment(transactionCardFragment, fragmentRef)
  const { formatCurrencyWithPrivacyMode: formatAmount } = useCurrency()
  const entries = [...(data.transactionEntries ?? [])].sort(
    (a, b) =>
      currency(a.amount, { precision: 8 }).value -
      currency(b.amount, { precision: 8 }).value,
  )
  const lots = [...(data.investmentLots ?? [])].sort(
    (a, b) =>
      currency(a.amount, { precision: 8 }).value -
      currency(b.amount, { precision: 8 }).value,
  )
  const lot = lots[0]
  const isTransfer =
    data.category.type === 'transfer' || data.category.name === 'Move'
  const isInvestmentTrade =
    data.category.type === 'investment' &&
    (data.category.name === 'Buy' || data.category.name === 'Sell')
  const accountNames = entries.length
    ? entries.map((entry) => entry.account.name)
    : lots.map((item) => item.investment.account.name)
  const accounts = [...new Set(accountNames)].join(isTransfer ? ' → ' : ' · ')
  const amounts = entries.length
    ? entries.map((entry) => ({
        id: entry.id,
        quantity: false,
        value: entry.amount,
        code: entry.account.householdCurrency.code,
      }))
    : lots.map((item) => ({
        id: item.id,
        quantity: data.category.name === 'Move',
        value:
          data.category.name === 'Move'
            ? item.amount
            : currency(item.amount, { precision: 8 })
                .multiply(item.price)
                .multiply(
                  data.category.name === 'Buy' || data.category.name === 'Sell'
                    ? -1
                    : 1,
                )
                .toString(),
        code: item.investment.householdCurrency.code,
      }))
  return (
    <Link
      to="."
      resetScroll={false}
      search={(search) => ({ ...search, edit_transaction_id: data.id })}
      onPointerEnter={() => onPreload(data.id)}
      onFocus={() => onPreload(data.id)}
      onClick={() => onPreload(data.id)}
      className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <Stack direction="horizontal" gap={3} align="center" padding={3}>
        <Stack align="center" justify="center" className="size-8 shrink-0">
          {lot ? (
            <InvestmentIcon
              symbol={lot.investment.symbol}
              name={lot.investment.name}
              type={lot.investment.type}
            />
          ) : (
            <CategoryIcon type={data.category.type} icon={data.category.icon} />
          )}
        </Stack>
        <Stack direction="vertical" gap={0.5} className="min-w-0 flex-1">
          <Stack
            direction="horizontal"
            gap={2}
            align="start"
            justify="between"
            wrap="wrap"
          >
            <Text weight="semibold">
              {data.category.name}
              {lot ? ` ${lot.investment.symbol || lot.investment.name}` : ''}
            </Text>
            <Stack direction="horizontal" gap={1} wrap="wrap">
              {amounts.map((amount) => {
                const incoming =
                  currency(amount.value, { precision: 8 }).value >= 0
                return (
                  <Token
                    key={amount.id}
                    size="sm"
                    color={
                      isTransfer
                        ? 'blue'
                        : isInvestmentTrade
                          ? 'purple'
                          : incoming
                            ? 'green'
                            : 'red'
                    }
                    description={
                      isTransfer
                        ? 'Transfer'
                        : isInvestmentTrade
                          ? `Investment ${data.category.name.toLowerCase()}`
                          : incoming
                            ? 'Money in'
                            : 'Money out'
                    }
                    label={
                      amount.quantity
                        ? `${isPrivacyModeEnabled ? '••••' : amount.value} shares`
                        : formatAmount({
                            value: amount.value,
                            currencyCode: amount.code,
                          })
                    }
                  />
                )
              })}
            </Stack>
          </Stack>
          <Text type="supporting" color="secondary" maxLines={2}>
            {accounts}
          </Text>
          {lot && (
            <Text type="supporting" color="secondary">
              {isPrivacyModeEnabled
                ? '••••'
                : currency(lot.amount, { precision: 8 }).value.toLocaleString(
                    undefined,
                    { maximumFractionDigits: 8 },
                  )}{' '}
              shares @{' '}
              {formatAmount({
                value: lot.price,
                currencyCode: lot.investment.householdCurrency.code,
              })}
            </Text>
          )}
          {data.excludeFromReports && (
            <Text type="supporting" color="secondary">
              Excluded from reports
            </Text>
          )}
        </Stack>
      </Stack>
    </Link>
  )
}
