import { useLingui } from '@lingui/react/macro'
import { Trans } from '@lingui/react/macro'
import { Heading } from '@astryxdesign/core/Heading'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { Button } from '@astryxdesign/core/Button'
import { ScrollableArea } from '@astryxdesign/core/ScrollableArea'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import currency from 'currency.js'
import { useMemo, useState, useTransition } from 'react'
import {
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { environment } from '@/environment'
import type {
  SnapshotWhereInput,
  netWorthChartQuery,
} from './__generated__/netWorthChartQuery.graphql'

function buildRateMap(
  rates: ReadonlyArray<{
    readonly rate: string
    readonly fromCurrency: { readonly code: string }
    readonly toCurrency: { readonly code: string }
  }>,
): Map<string, number> {
  return new Map(
    rates.map((r) => [
      `${r.fromCurrency.code}->${r.toCurrency.code}`,
      parseFloat(r.rate),
    ]),
  )
}

function getRate(
  rateMap: Map<string, number>,
  fromCode: string,
  toCode: string,
): number {
  if (fromCode === toCode) return 1
  return rateMap.get(`${fromCode}->${toCode}`) ?? 1
}

function niceStep(rawStep: number): number {
  const exponent = Math.floor(Math.log10(rawStep))
  const fraction = rawStep / Math.pow(10, exponent)
  const nice = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10
  return nice * Math.pow(10, exponent)
}

const NetWorthChartQuery = graphql`
  query netWorthChartQuery($where: SnapshotWhereInput) {
    household {
      snapshots(first: 500, where: $where) {
        edges {
          node {
            createTime
            snapshotEntries {
              userID
              liquidity
              investment
              property
              receivable
              liability
              householdCurrency {
                code
              }
            }
            snapshotRates {
              rate
              fromCurrency {
                code
              }
              toCurrency {
                code
              }
            }
          }
        }
      }
    }
  }
`

type Duration = '1M' | '3M' | '6M' | '1Y' | 'All'

const DURATIONS: Duration[] = ['1M', '3M', '6M', '1Y', 'All']

function durationToDate(d: Duration): string | null {
  const now = new Date()
  switch (d) {
    case '1M':
      return new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate(),
      ).toISOString()
    case '3M':
      return new Date(
        now.getFullYear(),
        now.getMonth() - 3,
        now.getDate(),
      ).toISOString()
    case '6M':
      return new Date(
        now.getFullYear(),
        now.getMonth() - 6,
        now.getDate(),
      ).toISOString()
    case '1Y':
      return new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      ).toISOString()
    case 'All':
      return null
  }
}

type SeriesKey =
  | 'netWorth'
  | 'liquidity'
  | 'investment'
  // | 'property'
  | 'receivable'
  | 'liability'
  | 'asset'

export function NetWorthChart() {
  const { t } = useLingui()
  const chartConfig = {
    netWorth: { label: t`Net Worth`, color: 'var(--chart-net-worth)' },
    asset: { label: t`Asset`, color: 'var(--chart-asset)' },
    liquidity: { label: t`Liquidity`, color: 'var(--chart-liquidity)' },
    investment: { label: t`Investment`, color: 'var(--chart-investment)' },
    property: { label: t`Property`, color: 'var(--chart-property)' },
    receivable: { label: t`Receivable`, color: 'var(--chart-receivable)' },
    liability: { label: t`Liability`, color: 'var(--chart-liability)' },
  }

  const SERIES: { key: SeriesKey; label: string; color: string }[] = [
    { key: 'netWorth', label: t`Net Worth`, color: 'var(--chart-net-worth)' },
    { key: 'asset', label: t`Asset`, color: 'var(--chart-asset)' },
    { key: 'liquidity', label: t`Liquidity`, color: 'var(--chart-liquidity)' },
    {
      key: 'investment',
      label: t`Investment`,
      color: 'var(--chart-investment)',
    },
    // { key: 'property', label: 'Property', color: 'var(--chart-property)' },
    {
      key: 'receivable',
      label: t`Receivable`,
      color: 'var(--chart-receivable)',
    },
    { key: 'liability', label: t`Liability`, color: 'var(--chart-liability)' },
  ]

  const { household } = useHousehold()
  const { displayCurrencyCode } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { isPrivacyModeEnabled } = usePrivacyMode()
  const { viewUserIds } = useHouseholdViewScope()

  const [duration, setDuration] = useState<Duration>('1M')
  const [isPending, startTransition] = useTransition()
  const [activeSeries, setActiveSeries] = useState<Set<SeriesKey>>(
    new Set(['netWorth']),
  )

  const createTimeGTE = durationToDate(duration)

  const where: SnapshotWhereInput = {
    createTimeGTE,
  }

  const data = useLazyLoadQuery<netWorthChartQuery>(NetWorthChartQuery, {
    where,
  })

  useSubscribeToInvalidationState([household.id], () => {
    fetchQuery<netWorthChartQuery>(
      environment,
      NetWorthChartQuery,
      { where },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  const displayCurrency = displayCurrencyCode

  const chartData = useMemo(() => {
    return (data.household.snapshots.edges ?? [])
      .flatMap((edge) => {
        if (!edge?.node) return []
        const snap = edge.node
        const rateMap = buildRateMap(snap.snapshotRates ?? [])

        const filteredEntries = (snap.snapshotEntries ?? []).filter((entry) =>
          viewUserIds === null ? true : viewUserIds.includes(entry.userID),
        )

        const totals = filteredEntries.reduce(
          (acc, entry) => {
            const rate = getRate(
              rateMap,
              entry.householdCurrency.code,
              displayCurrency,
            )
            return {
              liquidity:
                acc.liquidity +
                currency(entry.liquidity, { precision: 8 }).value * rate,
              investment:
                acc.investment +
                currency(entry.investment, { precision: 8 }).value * rate,
              property:
                acc.property +
                currency(entry.property, { precision: 8 }).value * rate,
              receivable:
                acc.receivable +
                currency(entry.receivable, { precision: 8 }).value * rate,
              liability:
                acc.liability +
                currency(entry.liability, { precision: 8 }).value * rate,
            }
          },
          {
            liquidity: 0,
            investment: 0,
            property: 0,
            receivable: 0,
            liability: 0,
          },
        )

        // `totals.liability` is negative (DB convention). Keep it negative for the
        // net-worth sum, but flip to positive for the standalone liability series.
        const asset =
          totals.liquidity +
          totals.investment +
          totals.property +
          totals.receivable
        return {
          date: new Date(snap.createTime).getTime(),
          netWorth: asset + totals.liability,
          asset,
          liquidity: totals.liquidity,
          investment: totals.investment,
          property: totals.property,
          receivable: totals.receivable,
          liability: -totals.liability,
        }
      })
      .sort((a, b) => a.date - b.date)
  }, [data.household.snapshots.edges, displayCurrency, viewUserIds])

  const yDomain = useMemo((): [number, number] => {
    const values = chartData
      .flatMap((point) => [...activeSeries].map((series) => point[series]))
      .filter((value) => Number.isFinite(value))

    if (values.length === 0) return [0, 1]

    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)
    const rawRange =
      rawMax === rawMin ? Math.max(Math.abs(rawMax) * 0.1, 1) : rawMax - rawMin
    const step = niceStep(rawRange / 4)
    return [Math.floor(rawMin / step) * step, Math.ceil(rawMax / step) * step]
  }, [chartData, activeSeries])

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(household.locale, {
      month: 'short',
      day: 'numeric',
    })
  }

  const toggleSeries = (key: SeriesKey) => {
    setActiveSeries((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const hasActiveSeries = activeSeries.size > 0
  const selectedSeries = activeSeries.size === 1 ? [...activeSeries][0] : null

  const singleSeriesStats = useMemo(() => {
    if (!selectedSeries || chartData.length === 0) {
      return null
    }

    const first = chartData[0][selectedSeries]
    const last = chartData[chartData.length - 1][selectedSeries]

    if (!Number.isFinite(first) || !Number.isFinite(last)) {
      return null
    }

    const absoluteChange = last - first
    const percentChange =
      first === 0 ? null : (absoluteChange / Math.abs(first)) * 100

    return { absoluteChange, percentChange }
  }, [selectedSeries, chartData])

  const formatSignedCurrencyShort = (value: number) => {
    const formatted = formatCurrencyWithPrivacyMode({
      value: currency(value),
      currencyCode: displayCurrency,
      numberFormatOptions: {
        notation: 'compact',
        maximumFractionDigits: 1,
      },
    })

    return value > 0 ? `+${formatted}` : formatted
  }

  const formatSignedPercent = (value: number | null) => {
    if (value === null) {
      return 'N/A'
    }

    const formatted = `${Math.abs(value).toFixed(2)}%`
    return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted
  }

  return (
    <Stack direction="vertical" gap={4}>
      <Heading level={2}>
        <Trans>Account history</Trans>
      </Heading>
      {chartData.length > 0 && (
        <ScrollableArea axis="inline" label={t`Account history series`}>
          <Stack direction="horizontal" gap={1}>
            {SERIES.map((s) => {
              const active = activeSeries.has(s.key)
              return (
                <Button
                  key={s.key}
                  onClick={() => toggleSeries(s.key)}
                  label={String(s.label)}
                  variant={active ? 'primary' : 'secondary'}
                >
                  {s.label}
                </Button>
              )
            })}
          </Stack>
        </ScrollableArea>
      )}
      {chartData.length === 0 ? (
        <Text color="secondary">
          <Trans>
            No snapshots in this period. Choose a wider date range, or create a
            snapshot from the toolbar to start tracking balances.
          </Trans>
        </Text>
      ) : hasActiveSeries ? (
        <ResponsiveContainer
          width="100%"
          height={240}
          initialDimension={{ width: 640, height: 240 }}
        >
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
          >
            <defs>
              {SERIES.map((s) => (
                <linearGradient
                  key={s.key}
                  id={`${s.key}Gradient`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 10 }}
              tickFormatter={formatDate}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={56}
              domain={yDomain}
              allowDecimals={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(value: number) =>
                formatCurrencyWithPrivacyMode({
                  value: currency(value),
                  currencyCode: displayCurrency,
                  numberFormatOptions: {
                    notation: 'compact',
                    maximumFractionDigits: 1,
                  },
                  privacyMaskLength: 5,
                })
              }
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-background-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-container)',
              }}
              labelFormatter={(label) =>
                typeof label === 'number'
                  ? new Date(label).toLocaleDateString(household.locale)
                  : String(label)
              }
              formatter={(value, name) => [
                formatCurrencyWithPrivacyMode({
                  value: currency(Number(value)),
                  currencyCode: displayCurrency,
                }),
                chartConfig[name as SeriesKey]?.label ?? String(name),
              ]}
            />

            {SERIES.filter((s) => activeSeries.has(s.key)).map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#${s.key}Gradient)`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <Stack direction="horizontal" gap={3} align="center" wrap="wrap">
          <Trans>Select at least one series to view chart</Trans>
        </Stack>
      )}
      <Stack direction="horizontal" gap={2} align="center">
        {singleSeriesStats && (
          <Stack direction="vertical" gap={4}>
            <Text>
              {formatSignedCurrencyShort(singleSeriesStats.absoluteChange)} (
              {isPrivacyModeEnabled
                ? '•••'
                : formatSignedPercent(singleSeriesStats.percentChange)}
              )
            </Text>
          </Stack>
        )}
        <Stack direction="horizontal" gap={0.5} align="center" justify="end">
          {isPending && <Spinner />}
          {DURATIONS.map((d) => (
            <Button
              key={d}

              onClick={() => startTransition(() => setDuration(d))}
              label={
                {
                  '1M': t`1 month`,
                  '3M': t`3 months`,
                  '6M': t`6 months`,
                  '1Y': t`1 year`,
                  All: t`All`,
                }[d]
              }
              variant={duration === d ? 'primary' : 'ghost'}
            >
              {d}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}
