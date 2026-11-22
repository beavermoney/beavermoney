import {
  chartHistory,
  selectedValue,
  historyMeasure,
  snapshotValue,
} from '@/lib/review-history'
import { useLingui } from '@lingui/react/macro'
import { useHistoryState } from '@/hooks/use-history-state'
import { useIsMobile } from '@/hooks/use-mobile'
import { Trans } from '@lingui/react/macro'
import { useCurrency } from '@/hooks/use-currency'
import { useDisplayCurrency } from '@/hooks/use-display-currency'
import { useHousehold } from '@/hooks/use-household'
import { useHouseholdViewScope } from '@/hooks/use-household-view-scope'
import { usePrivacyMode } from '@/hooks/use-privacy-mode'
import { Button } from '@astryxdesign/core/Button'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Stack } from '@astryxdesign/core/Stack'
import { Card } from '@astryxdesign/core/Card'
import { ACCOUNT_TYPE_ACCENT_CLASSES } from './account-ledger-utils'
import { Text } from '@astryxdesign/core/Text'
import currency from 'currency.js'
import { Suspense, useMemo, useTransition } from 'react'
import {
  NetWorthChartLayout,
  NetWorthChartSkeleton,
} from './net-worth-chart-layout'
import styles from './net-worth-chart-layout.module.css'
import {
  useChartSeries,
  type ChartScope,
  type SeriesKey,
} from './use-chart-series'
import {
  fetchQuery,
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
import {
  NetWorthChartQuery,
  chartSnapshots,
  durationToDate,
  DURATIONS,
  type Duration,
} from './net-worth-chart-query'
import type { netWorthChartQuery } from './__generated__/netWorthChartQuery.graphql'

function niceStep(rawStep: number): number {
  const exponent = Math.floor(Math.log10(rawStep))
  const fraction = rawStep / Math.pow(10, exponent)
  const nice = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10
  return nice * Math.pow(10, exponent)
}

export function NetWorthChart(scope: ChartScope = {}) {
  return (
    <Suspense fallback={<NetWorthChartSkeleton {...scope} />}>
      <NetWorthChartContent {...scope} />
    </Suspense>
  )
}

function NetWorthChartContent({
  accountId,
  investmentId,
}: { accountId?: string; investmentId?: string } = {}) {
  const { t } = useLingui()
  const isMobile = useIsMobile()
  const { chartConfig, series: SERIES } = useChartSeries({
    accountId,
    investmentId,
  })

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

  const variables = {
    count,
    where: createTimeGTE ? { createTimeGTE } : null,
    includeHoldings: !!investmentId,
  }
  const data = useLazyLoadQuery<netWorthChartQuery>(
    NetWorthChartQuery,
    variables,
  )

  useSubscribeToInvalidationState([household.id], () => {
    fetchQuery<netWorthChartQuery>(environment, NetWorthChartQuery, variables, {
      fetchPolicy: 'network-only',
    }).subscribe({})
  })

  const displayCurrency = displayCurrencyCode

  const chartData = useMemo(() => {
    const rows = chartSnapshots(data)
    const detailed = chartHistory(rows)
      .filter((p) => {
        const accounts = p.accounts.map((observation) => observation.account)
        if (investmentId)
          return accounts.some((a) =>
            a.holdings.some((h) => String(h.id) === investmentId),
          )
        if (accountId) return accounts.some((a) => String(a.id) === accountId)
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
    data,
    displayCurrency,
    viewUserIds,
    accountId,
    investmentId,
    createTimeGTE,
  ])

  const yDomain = useMemo((): [number, number] => {
    const values = chartData
      .flatMap((point) => seriesKeys.map((series) => point[series]))
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
  }, [chartData, seriesKeys])

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
    chartHistory(chartSnapshots(data)).some(
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
    <NetWorthChartLayout
      investmentId={investmentId}
      series={
        <>
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
        </>
      }
      plot={
        <>
          <Stack className={styles.notices}>
            {incompleteHistory && (
              <Text color="secondary">{t`Some reviews cover only part of your accounts. Totals reflect the accounts reviewed so far.`}</Text>
            )}
            {unavailableValues && (
              <Text color="secondary">{t`Some values are unavailable because the saved average cost or exchange rate is missing or needs review.`}</Text>
            )}
          </Stack>
          <Stack className={styles.canvas}>
            {chartData.length === 0 ? (
              <Text color="secondary">
                <Trans>
                  No snapshots in this period. Choose a wider date range, or
                  visit Journal to review your net worth and save a snapshot.
                </Trans>
              </Text>
            ) : hasActiveSeries ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
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
                        <stop
                          offset="5%"
                          stopColor={s.color}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={s.color}
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
                        <Card
                          padding={3}
                          elevation="low"
                          className="w-80 max-w-full"
                        >
                          <Stack
                            direction="vertical"
                            gap={3}
                            className="min-w-0"
                          >
                            <Text type="supporting">
                              {typeof label === 'number'
                                ? new Date(label).toLocaleDateString(
                                    household.locale,
                                  )
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
                                      {chartConfig[key]?.label ??
                                        String(entry.name)}
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
          </Stack>
        </>
      }
      controls={
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
      }
      stats={
        singleSeriesStats && (
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
        )
      }
      older={
        data.household.snapshots.pageInfo.hasPreviousPage && (
          <Button
            label={t`Load older reviews`}
            onClick={() => startTransition(() => setCount((n) => n + 500))}
          />
        )
      }
    />
  )
}
