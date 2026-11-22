import { useLingui } from '@lingui/react/macro'
export type ChartScope = { accountId?: string; investmentId?: string }
export type SeriesKey =
  | 'netWorth'
  | 'liquidity'
  | 'investment'
  | 'property'
  | 'receivable'
  | 'liability'
  | 'asset'

export function useChartSeries({ accountId, investmentId }: ChartScope) {
  const { t } = useLingui()
  const chartConfig = {
    netWorth: {
      label: investmentId
        ? t`Market value`
        : accountId
          ? t`Account value`
          : t`Net Worth`,
      color: 'var(--chart-net-worth)',
    },
    asset: { label: t`Asset`, color: 'var(--chart-asset)' },
    liquidity: {
      label: investmentId ? t`Cost Basis` : accountId ? t`Cash` : t`Liquidity`,
      color: 'var(--chart-liquidity)',
    },
    investment: {
      label: investmentId ? t`Unrealized return` : t`Investment`,
      color: 'var(--chart-investment)',
    },
    property: { label: t`Property`, color: 'var(--chart-property)' },
    receivable: { label: t`Receivable`, color: 'var(--chart-receivable)' },
    liability: { label: t`Liability`, color: 'var(--chart-liability)' },
  }

  const series: { key: SeriesKey; label: string; color: string }[] = [
    {
      key: 'netWorth',
      label: chartConfig.netWorth.label,
      color: 'var(--chart-net-worth)',
    },
    { key: 'asset', label: t`Asset`, color: 'var(--chart-asset)' },
    {
      key: 'liquidity',
      label: chartConfig.liquidity.label,
      color: 'var(--chart-liquidity)',
    },
    {
      key: 'investment',
      label: chartConfig.investment.label,
      color: 'var(--chart-investment)',
    },
    { key: 'property', label: t`Property`, color: 'var(--chart-property)' },
    {
      key: 'receivable',
      label: t`Receivable`,
      color: 'var(--chart-receivable)',
    },
    { key: 'liability', label: t`Liability`, color: 'var(--chart-liability)' },
  ]

  return {
    chartConfig,
    series: series.filter(
      (s) =>
        (!accountId && !investmentId) ||
        ['netWorth', 'liquidity', 'investment'].includes(s.key),
    ),
  }
}
