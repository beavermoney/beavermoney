import {
  reviewHistory,
  parseReview,
  selectedValue,
  historyMeasure,
  snapshotValue,
} from '@/lib/review-history'
import { useLingui } from '@lingui/react/macro'
import { useHistoryState } from '@/hooks/use-history-state'
import { useIsMobile } from '@/hooks/use-mobile'
import { Trans } from '@lingui/react/macro'
import { Heading } from '@astryxdesign/core/Heading'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { Button } from '@astryxdesign/core/Button'
import { HorizontalChipRail } from '@/components/horizontal-chip-rail'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Stack } from '@astryxdesign/core/Stack'
import { Card } from '@astryxdesign/core/Card'
import { ACCOUNT_TYPE_ACCENT_CLASSES } from './account-ledger-utils'
import { Text } from '@astryxdesign/core/Text'
import currency from 'currency.js'
import { useMemo, useTransition } from 'react'
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
import type { netWorthChartQuery } from './__generated__/netWorthChartQuery.graphql'

function niceStep(rawStep: number): number {
  const exponent = Math.floor(Math.log10(rawStep))
  const fraction = rawStep / Math.pow(10, exponent)
  const nice = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10
  return nice * Math.pow(10, exponent)
}

const NetWorthChartQuery = graphql`
  query netWorthChartQuery($count: Int!) {
    household {
      snapshots(last: $count) {
        pageInfo {
          hasPreviousPage
        }
        edges {
          node {
            id
            review {
              version
              complete
              activeAccountIds
              accounts {
                accountId
                icon
                name
                type
                category
                ownerId
                ownerName
                currency
                cash
                value
                archived
                holdings {
                  investmentId
                  name
                  symbol
                  currency
                  quantity
                  price
                  value
                  average
                  confirmedAt
                  needsReview
                  archived
                }
              }
              rates {
                from
                to
                rate
              }
            }
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
  | 'property'
  | 'receivable'
  | 'liability'
  | 'asset'

export function NetWorthChart({
  accountId,
  investmentId,
}: { accountId?: string; investmentId?: string } = {}) {
  const { t } = useLingui()
  const isMobile = useIsMobile()
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

  const SERIES: { key: SeriesKey; label: string; color: string }[] = [
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

  const { household } = useHousehold()
  const { displayCurrencyCode } = useDisplayCurrency()
  const { formatCurrencyWithPrivacyMode } = useCurrency()
  const { isPrivacyModeEnabled } = usePrivacyMode()
  const { viewUserIds } = useHouseholdViewScope()

  const historyKey = `net-worth-chart:${investmentId ? `holding:${investmentId}` : accountId ? `account:${accountId}` : 'all'}`
  const [count, setCount] = useHistoryState(`${historyKey}:count`, 500)
  const [duration, setDuration] = useHistoryState<Duration>(
    `${historyKey}:duration`,
    '1M',
  )
  const [isPending, startTransition] = useTransition()
  const [seriesKeys, setSeriesKeys] = useHistoryState<SeriesKey[]>(
    `${historyKey}:series`,
    ['netWorth'],
  )
  const activeSeries = new Set(seriesKeys)

  const createTimeGTE = durationToDate(duration)

  const data = useLazyLoadQuery<netWorthChartQuery>(NetWorthChartQuery, {
    count,
  })

  useSubscribeToInvalidationState([household.id], () => {
    fetchQuery<netWorthChartQuery>(
      environment,
      NetWorthChartQuery,
      { count },
      { fetchPolicy: 'network-only' },
    ).subscribe({})
  })

  const displayCurrency = displayCurrencyCode

  const chartData = useMemo(() => {
    const rows = (data.household.snapshots.edges ?? []).flatMap((e) =>
      e?.node ? [e.node] : [],
    )
    const detailed = reviewHistory(rows)
      .filter((p) => {
        const doc = parseReview(p.row.review)
        if (investmentId)
          return doc?.accounts.some((a) =>
            a.holdings.some((h) => String(h.id) === investmentId),
          )
        if (accountId)
          return doc?.accounts.some((a) => String(a.id) === accountId)
        return true
      })
      .map((p) => {
        const scope = investmentId
          ? `holding:${investmentId}`
          : accountId
            ? `account:${accountId}`
            : 'all'
        const value =
          selectedValue(p, scope, displayCurrency, viewUserIds)?.toNumber() ??
          NaN
        const typeValue = (type: string) =>
          p.accounts.some(
            (o) =>
              o.account.type === type &&
              (viewUserIds === null ||
                viewUserIds.includes(String(o.account.ownerId))),
          )
            ? (selectedValue(
                p,
                `type:${type}`,
                displayCurrency,
                viewUserIds,
              )?.toNumber() ?? NaN)
            : 0
        const cash = accountId
          ? (selectedValue(
              p,
              `cash:${accountId}`,
              displayCurrency,
              viewUserIds,
            )?.toNumber() ?? NaN)
          : typeValue('liquidity')
        const gain = investmentId
          ? (historyMeasure(
              p,
              scope,
              'gain',
              displayCurrency,
              viewUserIds,
            )?.toNumber() ?? NaN)
          : 0
        return {
          date: new Date(p.row.createTime).getTime(),
          netWorth: value,
          asset:
            accountId || investmentId ? value : value - typeValue('liability'),
          liquidity: investmentId ? value - gain : cash,
          investment: investmentId
            ? gain
            : accountId
              ? value - cash
              : typeValue('investment'),
          property: typeValue('property'),
          receivable: typeValue('receivable'),
          liability: -typeValue('liability'),
        }
      })
    const legacy = (data.household.snapshots.edges ?? []).flatMap((edge) => {
      if (!edge?.node) return []
      const snap = edge.node
      if (snap.review || accountId || investmentId) return []
      const categoryValue = (
        type:
          'liquidity' | 'investment' | 'property' | 'receivable' | 'liability',
      ) =>
        snapshotValue(snap, displayCurrency, viewUserIds, type)?.toNumber() ??
        NaN
      const totals = {
        liquidity: categoryValue('liquidity'),
        investment: categoryValue('investment'),
        property: categoryValue('property'),
        receivable: categoryValue('receivable'),
        liability: categoryValue('liability'),
      }

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
    return [...legacy, ...detailed]
      .filter(
        (p) => !createTimeGTE || p.date >= new Date(createTimeGTE).getTime(),
      )
      .sort((a, b) => a.date - b.date)
  }, [
    data.household.snapshots.edges,
    displayCurrency,
    viewUserIds,
    accountId,
    investmentId,
    createTimeGTE,
  ])

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
    const padding = rawMin === rawMax ? rawRange / 2 : 0
    return [
      Math.floor((rawMin - padding) / step) * step,
      Math.ceil((rawMax + padding) / step) * step,
    ]
  }, [chartData, activeSeries])

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(household.locale, {
      month: 'short',
      day: 'numeric',
    })
  }

  const toggleSeries = (key: SeriesKey) => {
    setSeriesKeys((prev) =>
      prev.includes(key)
        ? prev.filter((value) => value !== key)
        : [...prev, key],
    )
  }

  const incompleteHistory =
    !accountId &&
    !investmentId &&
    reviewHistory(
      (data.household.snapshots.edges ?? []).flatMap((e) =>
        e?.node ? [e.node] : [],
      ),
    ).some(
      (p) =>
        !p.complete && (!createTimeGTE || p.row.createTime >= createTimeGTE),
    )
  const unavailableValues = chartData.some((p) =>
    [...activeSeries].some((key) => !Number.isFinite(p[key])),
  )
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

    return !isPrivacyModeEnabled && value > 0 ? `+${formatted}` : formatted
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
        {investmentId ? t`Investment history` : t`Account history`}
      </Heading>
      {chartData.length > 0 && (
        <HorizontalChipRail label={t`Account history series`}>
          {SERIES.filter(
            (s) =>
              (!accountId && !investmentId) ||
              ['netWorth', 'liquidity', 'investment'].includes(s.key),
          ).map((s) => {
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
        </HorizontalChipRail>
      )}
      {incompleteHistory && (
        <Text color="secondary">{t`Some reviews cover only part of your accounts. Totals reflect the accounts reviewed so far.`}</Text>
      )}
      {unavailableValues && (
        <Text color="secondary">{t`Some values are unavailable because the saved average cost or exchange rate is missing or needs review.`}</Text>
      )}
      {chartData.length === 0 ? (
        <Text color="secondary">
          <Trans>
            No snapshots in this period. Choose a wider date range, or visit
            Journal to review your net worth and save a snapshot.
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
              // The plot starts after the Y axis. On narrow screens anchor to
              // the full chart instead, so a readable tooltip can use that space.
              position={isMobile ? { x: 0 } : undefined}
              wrapperStyle={{
                maxWidth: '100%',
                ...(isMobile ? { width: '100%' } : {}),
              }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <Card padding={3} elevation="low" className="w-80 max-w-full">
                    <Stack direction="vertical" gap={3} className="min-w-0">
                      <Text type="supporting">
                        {typeof label === 'number'
                          ? new Date(label).toLocaleDateString(household.locale)
                          : String(label)}
                      </Text>
                      {payload.map((entry) => {
                        const key = String(entry.dataKey) as SeriesKey
                        return (
                          <Stack
                            key={key}
                            direction="horizontal"
                            justify="between"
                            align="center"
                            gap={3}
                          >
                            <Stack
                              direction="horizontal"
                              align="center"
                              gap={2}
                              className="min-w-0 flex-1"
                            >
                              <Stack
                                aria-hidden="true"
                                className={`h-2 w-2 shrink-0 rounded-full ${key === 'netWorth' ? 'bg-chart-net-worth' : ACCOUNT_TYPE_ACCENT_CLASSES[key]}`}
                              />
                              <Text>
                                {chartConfig[key]?.label ?? String(entry.name)}
                              </Text>
                            </Stack>
                            <Text
                              type="label"
                              hasTabularNumbers
                              justify="end"
                              className="min-w-0 flex-1"
                              wordBreak="break-word"
                            >
                              {formatCurrencyWithPrivacyMode({
                                value: currency(Number(entry.value)),
                                currencyCode: displayCurrency,
                              })}
                            </Text>
                          </Stack>
                        )
                      })}
                    </Stack>
                  </Card>
                )
              }}
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
      <Stack
        direction="horizontal"
        gap={2}
        align="center"
        justify="between"
        wrap="wrap"
      >
        <Stack direction="horizontal" gap={0.5} align="center" justify="start">
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
          <Stack align="center" justify="center" className="size-6 shrink-0">
            {isPending && <Spinner />}
          </Stack>
        </Stack>
        {singleSeriesStats && (
          <Stack
            direction="vertical"
            gap={4}
            className="ml-auto text-right whitespace-nowrap"
          >
            <Text>
              {formatSignedCurrencyShort(singleSeriesStats.absoluteChange)} (
              {isPrivacyModeEnabled
                ? '•••'
                : formatSignedPercent(singleSeriesStats.percentChange)}
              )
            </Text>
          </Stack>
        )}
      </Stack>
      {data.household.snapshots.pageInfo.hasPreviousPage && (
        <Button
          label={t`Load older reviews`}
          onClick={() => setCount((n) => n + 500)}
        />
      )}
    </Stack>
  )
}
