import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
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
        isPartial ? t`Daily totals for loaded transactions` : t`Daily totals`
      }
    >
      <Token
        size="sm"
        color="green"
        label={format(income)}
        description={t`Daily income`}
        aria-label={t`Daily income: ${format(income)}`}
      />
      <Token
        size="sm"
        color="red"
        label={format(expense)}
        description={t`Daily expenses`}
        aria-label={t`Daily expenses: ${format(expense)}`}
      />
      {isPartial && (
        <Text type="supporting">
          <Trans>Totals so far</Trans>
        </Text>
      )}
    </Stack>
  )
}
