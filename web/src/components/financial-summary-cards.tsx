import { useLingui } from '@lingui/react/macro'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { Card } from '@astryxdesign/core/Card'
import { Grid } from '@astryxdesign/core/Grid'
import { VStack } from '@astryxdesign/core/Layout'
import { Heading, Text } from '@astryxdesign/core/Text'
import currency from 'currency.js'
import { useMemo } from 'react'
import { useFragment } from 'react-relay'
import { graphql } from 'relay-runtime'
import type { financialSummaryCardsFragment$key } from './__generated__/financialSummaryCardsFragment.graphql'

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
  const { t } = useLingui()
  const isMobile = useIsMobile()
  const data = useFragment(FinancialSummaryCardsFragment, fragmentRef)
  const { household } = useHousehold()
  const { isPrivacyModeEnabled } = usePrivacyMode()
  const { displayCurrencyCode } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()

  const { totalIncome, totalExpenses, net } = useMemo(() => {
    const income = currency(data.incomeBreakdown.total, { precision: 8 })
    const expenses = currency(data.expensesBreakdown.total, { precision: 8 })
    const netAmount = income.subtract(expenses)

    return {
      totalIncome: income,
      totalExpenses: expenses,
      net: netAmount,
    }
  }, [data.incomeBreakdown, data.expensesBreakdown])

  const savingsRate =
    totalIncome.value > 0
      ? new Intl.NumberFormat(household.locale, {
          style: 'percent',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(net.value / totalIncome.value)
      : '—'

  const formatAmount = (value: currency) =>
    formatCurrencyWithPrivacyMode({ value, currencyCode: displayCurrencyCode })

  const metrics = [
    { label: t`Expenses`, value: formatAmount(totalExpenses) },
    { label: t`Income`, value: formatAmount(totalIncome) },
    { label: t`Cash flow`, value: formatAmount(net) },
    {
      label: t`Savings rate`,
      value: isPrivacyModeEnabled ? '•••••••' : savingsRate,
    },
  ]

  if (isMobile) {
    return (
      <Card>
        <Grid columns={2} gap={4}>
          {metrics.map((metric) => (
            <VStack key={metric.label} gap={1}>
              <Text type="supporting" color="secondary">
                {metric.label}
              </Text>
              <Text type="label" hasTabularNumbers className="break-words">
                {metric.value}
              </Text>
            </VStack>
          ))}
        </Grid>
      </Card>
    )
  }

  return (
    <Grid columns={{ minWidth: 180, max: 4, repeat: 'fit' }} gap={4}>
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <VStack gap={3}>
            <Text color="secondary">{metric.label}</Text>
            <Heading level={2}>{metric.value}</Heading>
          </VStack>
        </Card>
      ))}
    </Grid>
  )
}
