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
import { useCurrency } from '@/hooks/use-currency'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { Button } from '@/components/ui/button'
import { Item } from '@/components/ui/item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import type {
  CheckpointWhereInput,
  netWorthChartQuery,
} from './__generated__/netWorthChartQuery.graphql'
import { environment } from '@/environment'

const NetWorthChartQuery = graphql`
  query netWorthChartQuery($where: CheckpointWhereInput) {
    household {
      checkpoints(first: 500, where: $where) {
        edges {
          node {
            createTime
            netWorth
            liquidity
            investment
            property
            receivable
            liability
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
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { isPrivacyModeEnabled } = usePrivacyMode()

  const [duration, setDuration] = useState<Duration>('3M')
  const [isPending, startTransition] = useTransition()
  const [activeSeries, setActiveSeries] = useState<Set<SeriesKey>>(
    new Set(['netWorth']),
  )

  const createTimeGTE = durationToDate(duration)

  const where: CheckpointWhereInput = {
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

  const chartData = (data.household.checkpoints.edges ?? [])
    .map((edge) => {
      invariant(edge?.node, 'checkpoint edge node must exist')
      const node = edge.node
      const liquidity = currency(node.liquidity, { precision: 8 }).value
      const investment = currency(node.investment, { precision: 8 }).value
      const property = currency(node.property, { precision: 8 }).value
      const receivable = currency(node.receivable, { precision: 8 }).value
      return {
        date: new Date(node.createTime).getTime(),
        netWorth: currency(node.netWorth, { precision: 8 }).value,
        asset: liquidity + investment + property + receivable,
        liquidity,
        investment,
        property,
        receivable,
        liability: currency(node.liability, { precision: 8 }).value,
      }
    })
    .sort((a, b) => a.date - b.date)

  const yDomain = useMemo((): [number, number] => {
    const values = chartData
      .flatMap((point) => [...activeSeries].map((series) => point[series]))
      .filter((value) => Number.isFinite(value))

    if (values.length === 0) {
      return [0, 1]
    }

    const min = Math.min(...values)
    const max = Math.max(...values)

    if (min === max) {
      const padding = Math.max(Math.abs(min) * 0.05, 1)
      return [min - padding, max + padding]
    }

    const padding = (max - min) * 0.08
    return [min - padding, max + padding]
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
      currencyCode: household.currency.code,
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
    <Item
      variant="outline"
      className="w-full flex-col items-stretch gap-0 px-0 py-0"
    >
      <ScrollArea className="w-full">
        <div className="flex gap-1 px-3 pt-2.5 pb-1">
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
          className={`h-36 w-full transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}
        >
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 36, left: 0, bottom: 0 }}
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
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
              tick={{ fontSize: 10 }}
              tickFormatter={(value: number) =>
                formatCurrencyWithPrivacyMode({
                  value: currency(value),
                  currencyCode: household.currency.code,
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
                            currencyCode: household.currency.code,
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
          className={`text-muted-foreground flex h-36 w-full items-center justify-center text-xs transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}
        >
          Select at least one series to view chart
        </div>
      )}
      <div className="flex items-center gap-2 px-3 pt-1 pb-2.5">
        {singleSeriesStats && (
          <div
            className={cn(
              'text-muted-foreground min-w-0 text-xs tabular-nums',
              singleSeriesStats.absoluteChange > 0 &&
                'text-emerald-600 dark:text-emerald-400',
              singleSeriesStats.absoluteChange < 0 &&
                'text-red-600 dark:text-red-400',
            )}
          >
            <span className="sm:hidden">
              {formatSignedCurrencyShort(singleSeriesStats.absoluteChange)}
            </span>
            <span className="hidden sm:inline">
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
