import { useLingui } from '@lingui/react/macro'
import { transactionDayTotals } from '@/lib/transaction-day-totals'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { Stack } from '@astryxdesign/core/Stack'
import { Spinner } from '@astryxdesign/core/Spinner'
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
  const { t } = useLingui()
  const transactions = useFragment(fragment, fragmentRef)
  const { convert, displayCurrencyCode } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { viewUserIds } = useHouseholdViewScope()
  const { income, expense } = transactionDayTotals(
    transactions,
    convert,
    viewUserIds,
  )
  if (isPartial) {
    return (
      <Stack
        direction="horizontal"
        align="center"
        justify="end"
        className="h-6"
      >
        <Spinner
          size="sm"
          shade="subtle"
          aria-label={t`Loading daily totals`}
        />
      </Stack>
    )
  }
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
      aria-label={t`Daily totals`}
    >
      {income.intValue !== 0 && (
        <Token
          size="sm"
          color="green"
          label={format(income)}
          description={t`Daily income`}
          aria-label={t`Daily income: ${format(income)}`}
        />
      )}
      {expense.intValue !== 0 && (
        <Token
          size="sm"
          color="red"
          label={format(expense)}
          description={t`Daily expenses`}
          aria-label={t`Daily expenses: ${format(expense)}`}
        />
      )}
    </Stack>
  )
}
