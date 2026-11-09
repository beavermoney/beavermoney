import { transactionDayTotals } from '@/lib/transaction-day-totals'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { Token } from '@astryxdesign/core/Token'
import currency from 'currency.js'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'
import type { transactionDaySummaryFragment$key } from './__generated__/transactionDaySummaryFragment.graphql'

const fragment = graphql`
  fragment transactionDaySummaryFragment on Transaction @relay(plural: true) {
    excludeFromReports
    category {
      type
    }
    transactionEntries {
      amount
      account {
        user {
          id
        }
        householdCurrency {
          code
        }
      }
    }
  }
`
export function TransactionDaySummary({
  fragmentRef,
  isPartial,
}: {
  fragmentRef: transactionDaySummaryFragment$key
  isPartial: boolean
}) {
  const transactions = useFragment(fragment, fragmentRef)
  const { convert, displayCurrencyCode } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { viewUserIds } = useHouseholdViewScope()
  const { income, expense } = transactionDayTotals(
    transactions,
    convert,
    viewUserIds,
  )
  if (income.intValue === 0 && expense.intValue === 0) return null

  const format = (value: currency) =>
    formatCurrencyWithPrivacyMode({ value, currencyCode: displayCurrencyCode })
  return (
    <Stack
      direction="horizontal"
      gap={2}
      wrap="wrap"
      justify="end"
      className="min-w-0"
      aria-label={
        isPartial ? 'Daily totals for loaded transactions' : 'Daily totals'
      }
    >
      {income.intValue !== 0 && (
        <Token
          size="sm"
          color="green"
          label={format(income)}
          description="Daily income"
          aria-label={`Daily income: ${format(income)}`}
        />
      )}
      {expense.intValue !== 0 && (
        <Token
          size="sm"
          color="red"
          label={format(expense)}
          description="Daily expenses"
          aria-label={`Daily expenses: ${format(expense)}`}
        />
      )}
      {isPartial && <Text type="supporting">Totals so far</Text>}
    </Stack>
  )
}
