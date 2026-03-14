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

const NetWorthChartFragment = graphql`
  fragment netWorthChartFragment on Query {
    checkpoints(first: 500, where: { createTimeGTE: "2020-01-01T00:00:00Z" })
      @connection(key: "netWorthChart_checkpoints") {
      edges {
        node {
          createTime
          netWorth
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

const chartConfig = {
  netWorth: {
    label: 'Net Worth',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

type NetWorthChartProps = {
  fragmentRef: netWorthChartFragment$key
}

export function NetWorthChart({ fragmentRef }: NetWorthChartProps) {
  const data = useFragment(NetWorthChartFragment, fragmentRef)
  const { household } = useHousehold()
  const { formatCurrency } = useCurrency()

  const [duration, setDuration] = useState<Duration>('3M')

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
      return {
        date: node.createTime,
        netWorth: currency(node.netWorth, { precision: 8 }).value,
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(household.locale, {
      month: 'short',
      day: 'numeric',
    })
  }

  if (chartData.length === 0) {
    return null
  }

  return (
    <Item variant="outline" className="flex-col items-stretch gap-0 px-0 py-0">
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <span className="text-muted-foreground text-xs font-medium">
          Net Worth
        </span>
        <div className="flex gap-0.5">
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
      </div>
      <ChartContainer config={chartConfig} className="h-36 w-full">
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 36, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-netWorth)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--color-netWorth)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 10 }}
            tickFormatter={formatDate}
            // interval="preserveStartEnd"
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
                  const d = payload?.[0]?.payload?.date
                  return d
                    ? new Date(d).toLocaleDateString(household.locale, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : ''
                }}
                formatter={(value) => [
                  formatCurrency({
                    value: currency(value as number),
                    currencyCode: household.currency.code,
                  }),
                ]}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="var(--color-netWorth)"
            strokeWidth={2}
            fill="url(#netWorthGradient)"
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
    </Item>
  )
}
