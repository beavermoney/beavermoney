import { graphql } from 'relay-runtime'
import { useFragment } from 'react-relay'
import { useState } from 'react'
import currency from 'currency.js'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useHousehold } from '@/hooks/use-household'
import { useCurrency } from '@/hooks/use-currency'
import { Button } from '@/components/ui/button'
import { Item } from '@/components/ui/item'
import type { netWorthChartFragment$key } from './__generated__/netWorthChartFragment.graphql'
import { ScrollArea } from '@/components/ui/scroll-area'

const NetWorthChartFragment = graphql`
  fragment netWorthChartFragment on Query {
    checkpoints(first: 500, where: { createTimeGTE: "2020-01-01T00:00:00Z" })
      @connection(key: "netWorthChart_checkpoints") {
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
`

type Duration = '1M' | '3M' | '6M' | '1Y' | 'All'

const DURATIONS: Duration[] = ['1M', '3M', '6M', '1Y', 'All']

function durationToMonths(d: Duration): number | null {
  switch (d) {
    case '1M':
      return 1
    case '3M':
      return 3
    case '6M':
      return 6
    case '1Y':
      return 12
    case 'All':
      return null
  }
}

type SeriesKey =
  | 'netWorth'
  | 'liquidity'
  | 'investment'
  | 'property'
  | 'receivable'
  | 'liability'
  | 'asset'

const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: 'netWorth', label: 'Net Worth', color: 'var(--chart-net-worth)' },
  { key: 'asset', label: 'Asset', color: 'var(--chart-asset)' },
  { key: 'liquidity', label: 'Liquidity', color: 'var(--chart-liquidity)' },
  { key: 'investment', label: 'Investment', color: 'var(--chart-investment)' },
  { key: 'property', label: 'Property', color: 'var(--chart-property)' },
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

type NetWorthChartProps = {
  fragmentRef: netWorthChartFragment$key
}

export function NetWorthChart({ fragmentRef }: NetWorthChartProps) {
  const data = useFragment(NetWorthChartFragment, fragmentRef)
  const { household } = useHousehold()
  const { formatCurrency } = useCurrency()

  const [duration, setDuration] = useState<Duration>('3M')
  const [activeSeries, setActiveSeries] = useState<Set<SeriesKey>>(
    new Set(['netWorth']),
  )

  const now = new Date()

  const months = durationToMonths(duration)
  const cutoff =
    months !== null
      ? new Date(now.getTime() - months * 30.44 * 24 * 60 * 60 * 1000)
      : null

  const chartData = (data.checkpoints.edges ?? [])
    .filter((edge) => {
      if (!edge?.node) return false
      if (!cutoff) return true
      return new Date(edge.node.createTime) >= cutoff
    })
    .map((edge) => {
      const node = edge!.node!
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
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
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
      <ChartContainer config={chartConfig} className="h-36 w-full">
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
            tick={{ fontSize: 10 }}
            tickFormatter={(value: number) =>
              Intl.NumberFormat(household.locale, {
                currency: household.currency.code,
                style: 'currency',
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(value)
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
                formatter={(value, name, item) => (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">
                      {chartConfig[name as SeriesKey]?.label ?? name}
                    </span>
                    <span className="text-foreground ml-auto pl-4 font-mono font-medium tabular-nums">
                      {formatCurrency({
                        value: currency(value as number),
                        currencyCode: household.currency.code,
                      })}
                    </span>
                  </>
                )}
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
      <div className="flex items-center justify-end gap-0.5 px-3 pt-1 pb-2.5">
        {DURATIONS.map((d) => (
          <Button
            key={d}
            variant={duration === d ? 'default' : 'ghost'}
            size="sm"
            className="h-5 px-1.5 text-xs"
            onClick={() => setDuration(d)}
          >
            {d}
          </Button>
        ))}
      </div>
    </Item>
  )
}
