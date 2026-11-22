import { useLingui } from '@lingui/react/macro'
import { Heading } from '@astryxdesign/core/Heading'
import { Stack } from '@astryxdesign/core/Stack'
import { Skeleton } from '@astryxdesign/core/Skeleton'
import { Button } from '@astryxdesign/core/Button'
import { HorizontalChipRail } from '@/components/horizontal-chip-rail'
import type { ReactNode } from 'react'
import styles from './net-worth-chart-layout.module.css'
import { DURATIONS } from './net-worth-chart-query'

import { useChartSeries, type ChartScope } from './use-chart-series'

// Every loading/data/empty state uses these same slots. Data-dependent content
// stays inside its slot rather than moving the account list below the chart.
export function NetWorthChartLayout({
  investmentId,
  loading = false,
  series,
  plot,
  controls,
  stats,
  older,
}: ChartScope & {
  loading?: boolean
  series: ReactNode
  plot: ReactNode
  controls: ReactNode
  stats?: ReactNode
  older?: ReactNode
}) {
  const { t } = useLingui()
  return (
    <Stack gap={4} aria-busy={loading} data-chart-layout>
      <Heading level={2}>
        {investmentId ? t`Investment history` : t`Account history`}
      </Heading>
      <HorizontalChipRail label={t`Account history series`}>
        {series}
      </HorizontalChipRail>
      <Stack className={styles.plot} data-chart-plot>
        {plot}
      </Stack>
      <Stack className={styles.controls} data-chart-controls>
        {controls}
        <Stack className={styles.stats} data-chart-stats>
          {stats}
        </Stack>
      </Stack>
      <Stack className={styles.older} data-chart-older>
        {older}
      </Stack>
    </Stack>
  )
}

export function NetWorthChartSkeleton(scope: ChartScope) {
  const { series } = useChartSeries(scope)
  return (
    <NetWorthChartLayout
      {...scope}
      loading
      series={series.map((s) => (
        <Button key={s.key} label={s.label} isDisabled variant="secondary">
          {s.label}
        </Button>
      ))}
      plot={<Skeleton height="100%" />}
      controls={
        <Stack direction="horizontal" gap={0.5} align="center">
          {DURATIONS.map((d) => (
            <Button key={d} label={d} isDisabled variant="ghost">
              {d}
            </Button>
          ))}
          <Stack className="size-6 shrink-0" />
        </Stack>
      }
      stats={<Skeleton height={20} width={128} />}
    />
  )
}
