import { useLingui } from '@lingui/react/macro'
import { Grid } from '@astryxdesign/core/Grid'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { useCurrency } from '@/hooks/use-currency'

type Summary = { total: string; transactionCount: number; average: string }
export function MerchantStatistics({
  summary,
  currencyCode,
  lifetime,
}: {
  summary: Summary
  currencyCode: string
  lifetime?: Summary
}) {
  const { t, i18n } = useLingui()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const money = (value: string) =>
    formatCurrencyWithPrivacyMode({ value, currencyCode })
  const statistics = [
    { label: t`Spent this period`, value: money(summary.total) },
    { label: t`Transactions`, value: i18n.number(summary.transactionCount) },
    { label: t`Average transaction`, value: money(summary.average) },
    ...(lifetime
      ? [{ label: t`Lifetime spending`, value: money(lifetime.total) }]
      : []),
  ]
  return (
    <Grid columns={{ minWidth: 120, max: lifetime ? 4 : 3 }} gap={6}>
      {statistics.map((stat) => (
        <Stack key={stat.label} gap={1} className="min-w-0">
          <Text type="supporting" color="secondary">
            {stat.label}
          </Text>
          <Text
            type="large"
            weight="semibold"
            hasTabularNumbers
            wordBreak="break-word"
          >
            {stat.value}
          </Text>
        </Stack>
      ))}
    </Grid>
  )
}
