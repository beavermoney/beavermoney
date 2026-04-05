import currency from 'currency.js'
import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'
import { useMemo } from 'react'
import { useCurrency } from '@/hooks/use-currency'
import { useHousehold } from '@/hooks/use-household'
import type { financialSummaryCardsFragment$key } from './__generated__/financialSummaryCardsFragment.graphql'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'

const FinancialSummaryCardsFragment = graphql`
  fragment financialSummaryCardsFragment on FinancialReport {
    incomeBreakdown {
      total
    }
    expensesBreakdown {
      total
    }
  }
`

interface FinancialSummaryCardsProps {
  fragmentRef: financialSummaryCardsFragment$key
}

export function FinancialSummaryCards({
  fragmentRef,
}: FinancialSummaryCardsProps) {
  const data = useFragment(FinancialSummaryCardsFragment, fragmentRef)
  const { household } = useHousehold()
  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const { isPrivacyModeEnabled } = usePrivacyMode()

  const { totalIncome, totalExpenses, net, savingRate } = useMemo(() => {
    const income = currency(data.incomeBreakdown.total)
    const expenses = currency(data.expensesBreakdown.total)
    const netAmount = income.subtract(expenses)

    return {
      totalIncome: income,
      totalExpenses: expenses,
      net: netAmount,
      savingRate:
        income.value === 0
          ? ':('
          : `${((netAmount.value / income.value) * 100).toFixed(2)}%`,
    }
  }, [data.incomeBreakdown, data.expensesBreakdown])

  return (
    <div className="flex flex-col gap-1">
      <span className="text-primary text-[0.6875rem] font-medium tracking-wider uppercase">
        Cash Flow
      </span>
      <div className="text-3xl font-semibold tracking-tight tabular-nums">
        {formatCurrencyWithPrivacyMode({
          value: net,
          currencyCode: household.currency.code,
        })}
      </div>
      <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs tabular-nums">
        <span>
          {formatCurrencyWithPrivacyMode({
            value: totalIncome,
            currencyCode: household.currency.code,
          })}{' '}
          <span className="text-muted-foreground/60">income</span>
        </span>
        <span>
          {formatCurrencyWithPrivacyMode({
            value: totalExpenses,
            currencyCode: household.currency.code,
          })}{' '}
          <span className="text-muted-foreground/60">expenses</span>
        </span>
        <span>
          {isPrivacyModeEnabled ? '•••••••' : savingRate}{' '}
          <span className="text-muted-foreground/60">saving rate</span>
        </span>
      </div>
    </div>
  )
}
