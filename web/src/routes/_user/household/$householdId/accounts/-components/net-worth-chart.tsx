import {
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useSubscribeToInvalidationState,
} from 'react-relay'
import { useMemo, useState, useTransition } from 'react'
import invariant from 'tiny-invariant'
import currency from 'currency.js'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { useHousehold } from '@/hooks/use-household'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useCurrency } from '@/hooks/use-currency'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { Button } from '@/components/ui/button'
import { Item } from '@/components/ui/item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import type {
  SnapshotWhereInput,
  netWorthChartQuery,
} from './__generated__/netWorthChartQuery.graphql'
import { environment } from '@/environment'

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

function isImproving(series: SeriesKey | null, change: number): boolean {
  if (series === 'liability') return change < 0
  return change > 0
}

function isWorsening(series: SeriesKey | null, change: number): boolean {
  if (series === 'liability') return change > 0
  return change < 0
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

const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: 'netWorth', label: 'Net Worth', color: 'var(--chart-net-worth)' },
  { key: 'asset', label: 'Asset', color: 'var(--chart-asset)' },
  { key: 'liquidity', label: 'Liquidity', color: 'var(--chart-liquidity)' },
  { key: 'investment', label: 'Investment', color: 'var(--chart-investment)' },
  // { key: 'property', label: 'Property', color: 'var(--chart-property)' },
  { key: 'receivable', label: 'Receivable', color: 'var(--chart-receivable)' },
  { key: 'liability', label: 'Liability', color: 'var(--chart-liability)' },
]

const chartConfig = {
  netWorth: { label: 'Net Worth', color: 'var(--chart-net-worth)' },
  asset: { label: 'Asset', color: 'var(--chart-asset)' },
  liquidity: { label: 'Liquidity', color: 'var(--chart-liquidity)' },
  investment: { label: 'Investment', color: 'var(--chart-investment)' },
  property: { label: 'Property', color: 'var(--chart-property)' },
  receivable: { label: 'Receivable', color: 'var(--chart-receivable)' },
  liability: { label: 'Liability', color: 'var(--chart-liability)' },
} satisfies ChartConfig

export function NetWorthChart() {
  const { household } = useHousehold()
  const { displayCurrencyCode } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { isPrivacyModeEnabled } = usePrivacyMode()
  const { viewUserIds } = useHouseholdViewScope()
  const viewUserId = viewUserIds?.[0] ?? null

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
          viewUserId === null ? true : entry.userID === viewUserId,
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
  }, [data.household.snapshots.edges, displayCurrency, viewUserId])

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

  if (chartData.length === 0) {
    return null
  }

  return (
    <Item className="w-full flex-col items-stretch gap-0 p-0">
      <ScrollArea className="w-full">
        <div className="flex gap-1 py-px">
          {SERIES.map((s) => {
            const active = activeSeries.has(s.key)
            return (
              <Button
                key={s.key}
                variant="outline"
                size="sm"
                className="h-5 px-1.5 text-xs transition-colors"
                style={
                  active
                    ? {
                        borderColor: s.color,
                        color: s.color,
                        backgroundColor: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                      }
                    : { color: 'var(--muted-foreground)' }
                }
                onClick={() => toggleSeries(s.key)}
              >
                {s.label}
              </Button>
            )
          })}
        </div>
      </ScrollArea>
      <div className="py-1"></div>
      {hasActiveSeries ? (
        <ChartContainer
          config={chartConfig}
          className={`h-44 w-full transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}
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
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${s.key})`}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${s.key})`}
                    stopOpacity={0}
                  />
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
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const ts = payload?.[0]?.payload?.date
                    return typeof ts === 'number'
                      ? new Date(ts).toLocaleDateString(household.locale, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''
                  }}
                  formatter={(value, name, item) => {
                    invariant(
                      typeof value === 'number',
                      'chart value must be a number',
                    )
                    return (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">
                          {chartConfig[name as SeriesKey]?.label ?? name}
                        </span>
                        <span className="text-foreground ml-auto pl-4 font-mono font-medium tabular-nums">
                          {formatCurrencyWithPrivacyMode({
                            value: currency(value),
                            currencyCode: displayCurrency,
                          })}
                        </span>
                      </>
                    )
                  }}
                />
              }
            />

            {SERIES.filter((s) => activeSeries.has(s.key)).map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={`var(--color-${s.key})`}
                strokeWidth={2}
                fill={`url(#${s.key}Gradient)`}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      ) : (
        <div
          className={`text-muted-foreground flex h-44 w-full items-center justify-center text-xs transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}
        >
          Select at least one series to view chart
        </div>
      )}
      <div className="flex items-center gap-2 pt-1 pb-2.5">
        {singleSeriesStats && (
          <div
            className={cn(
              'text-muted-foreground min-w-0 text-xs tabular-nums',
              isImproving(selectedSeries, singleSeriesStats.absoluteChange) &&
                'text-emerald-600 dark:text-emerald-400',
              isWorsening(selectedSeries, singleSeriesStats.absoluteChange) &&
                'text-red-600 dark:text-red-400',
            )}
          >
            <span className="">
              {formatSignedCurrencyShort(singleSeriesStats.absoluteChange)} (
              {isPrivacyModeEnabled
                ? '•••'
                : formatSignedPercent(singleSeriesStats.percentChange)}
              )
            </span>
          </div>
        )}
        <div className="grow"></div>
        <div className="flex items-center justify-end gap-0.5">
          {isPending && <Spinner className="text-muted-foreground size-3" />}
          {DURATIONS.map((d) => (
            <Button
              key={d}
              variant={duration === d ? 'default' : 'ghost'}
              size="sm"
              className="h-5 px-1.5 text-xs"
              onClick={() => startTransition(() => setDuration(d))}
            >
              {d}
            </Button>
          ))}
        </div>
      </div>
    </Item>
  )
}
