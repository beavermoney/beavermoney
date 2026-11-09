import { useLingui } from '@lingui/react/macro'
import { useDateFormatter } from '@/hooks/use-date-formatter'
import { Trans } from '@lingui/react/macro'
import { ProgressBar } from '@astryxdesign/core/ProgressBar'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSubMenu,
} from '@astryxdesign/core/DropdownMenu'
import {
  FinanceCalendar,
  type FinanceDateRange,
} from '@/components/finance-calendar'
import { useWeekStart } from '@/hooks/use-week-start'
import {
  dateKey,
  detectPeriod,
  periodRange,
  type DatePeriod,
} from '@/lib/date-period'
import { BottomSheet } from '@astryxdesign/core/BottomSheet'
import { Button } from '@astryxdesign/core/Button'
import { List, ListItem } from '@astryxdesign/core/List'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import { addDays, addMonths, addWeeks, addYears, parseISO } from 'date-fns'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Undo2,
} from 'lucide-react'
import { useState, useTransition } from 'react'

type Props = {
  startDate: string
  endDate: string
  onDateRangeChange: (start: string, end: string) => Promise<void>
}
export function DatePeriodFilter({
  startDate: startValue,
  endDate: endValue,
  onDateRangeChange,
}: Props) {
  const format = useDateFormatter()
  const { t } = useLingui()
  const titles: Record<Exclude<DatePeriod, 'calendar'>, string> = {
    week: t`Week`,
    month: t`Month`,
    year: t`Year`,
    custom: t`Custom range`,
  }

  const isMobile = useIsMobile()
  const startDate = dateKey(parseISO(startValue))
  const endDate = dateKey(parseISO(endValue))
  const { weekStartsOn } = useWeekStart()
  const [step, setStep] = useState<DatePeriod | 'views' | null>(null)
  const [chosen, setChosen] = useState<{
    mode: DatePeriod
    start: string
    end: string
  } | null>(null)
  const [draft, setDraft] = useState<FinanceDateRange>()
  const [page, setPage] = useState(0)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const mode =
    chosen?.start === startDate && chosen.end === endDate
      ? chosen.mode
      : detectPeriod(startDate, endDate, weekStartsOn)
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const today = new Date()
  const monthYear = Math.min(start.getFullYear(), today.getFullYear()) + page
  const rangeLabel = `${format(start, start.getFullYear() === end.getFullYear() ? 'MMM d' : 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`
  const label =
    mode === 'month'
      ? format(start, 'MMMM yyyy')
      : mode === 'year'
        ? format(start, 'yyyy')
        : mode === 'calendar'
          ? format(start, 'MMM d, yyyy')
          : mode === 'week' &&
              startDate === periodRange('week', today, weekStartsOn)[0]
            ? t`This week`
            : mode === 'week' &&
                startDate ===
                  periodRange('week', addWeeks(today, -1), weekStartsOn)[0]
              ? t`Last week`
              : rangeLabel
  function apply(nextMode: DatePeriod, range: [string, string], close = true) {
    if (pending) return
    setError(null)
    if (close) setStep(null)
    startTransition(async () => {
      try {
        await onDateRangeChange(...range)
        setChosen({ mode: nextMode, start: range[0], end: range[1] })
      } catch {
        setError(t`Could not update dates. Please try again.`)
      }
    })
  }
  function select(nextMode: Exclude<DatePeriod, 'custom'>, date: Date) {
    if (periodRange(nextMode, date, weekStartsOn)[0] > dateKey(today)) return
    apply(nextMode, periodRange(nextMode, date, weekStartsOn))
  }
  function navigate(direction: number) {
    if (mode === 'custom') return
    const next =
      mode === 'month'
        ? addMonths(start, direction)
        : mode === 'year'
          ? addYears(start, direction)
          : mode === 'week'
            ? addWeeks(start, direction)
            : addDays(start, direction)
    select(mode, next)
  }
  function chooseMode(next: keyof typeof titles) {
    setPage(0)
    if (next === 'custom') setDraft({ from: start, to: end })
    setStep(next)
  }
  const onOpenChange = (open: boolean) => {
    if (!open && !pending) setStep(null)
  }
  const selected = (range: [string, string]) =>
    range[0] === startDate && range[1] === endDate
  const viewsContent = (
    <Stack direction="vertical" gap={3}>
      <List
        density={isMobile ? 'balanced' : 'compact'}
        header={
          <Text type={isMobile ? 'large' : 'label'} weight="semibold">
            <Trans>Date view</Trans>
          </Text>
        }
      >
        {(Object.keys(titles) as (keyof typeof titles)[]).map((option) => (
          <ListItem
            key={option}
            label={titles[option]}
            aria-haspopup="dialog"
            isSelected={mode === option}
            endContent={
              <Stack direction="horizontal" gap={2} align="center">
                {mode === option && <Icon icon={Check} />}
                <Icon icon={ChevronRight} />
              </Stack>
            }
            isDisabled={pending}
            onClick={() => chooseMode(option)}
          />
        ))}
      </List>
      {error && <Text role="alert">{error}</Text>}
    </Stack>
  )
  const periodContents = (['week', 'month', 'year', 'custom'] as const).map(
    (view) => ({
      view,
      content: (
        <Stack
          direction="vertical"
          gap={!isMobile || view === 'week' || view === 'year' ? 2 : 4}
        >
          {isMobile && (
            <Stack
              direction="horizontal"
              justify="between"
              align="center"
              gap={4}
            >
              <Text type={isMobile ? 'large' : 'label'} weight="semibold">
                {titles[view]}
              </Text>
              {isMobile && (
                <Button
                  size="sm"
                  label={t`Back`}
                  variant="ghost"
                  icon={<Icon icon={ChevronLeft} />}
                  onClick={() => setStep('views')}
                />
              )}
            </Stack>
          )}
          {error && <Text role="alert">{error}</Text>}
          {view === 'month' && (
            <Stack
              direction="horizontal"
              justify="between"
              align="center"
              gap={2}
            >
              <Button
                size="sm"
                isIconOnly
                label={t`Previous year`}
                icon={<Icon icon={ChevronLeft} />}
                variant="ghost"
                onClick={() => setPage(page - 1)}
              />
              <Text weight="medium">{String(monthYear)}</Text>
              <Button
                size="sm"
                isIconOnly
                label={t`Next year`}
                icon={<Icon icon={ChevronRight} />}
                variant="ghost"
                isDisabled={monthYear >= today.getFullYear()}
                onClick={() => setPage(page + 1)}
              />
            </Stack>
          )}
          {view === 'month' && (
            <Grid columns={3} gap={isMobile ? 2 : 1}>
              {Array.from({ length: 12 }, (_, index) => {
                const month = index
                const date = new Date(monthYear, month, 1)
                return (
                  <Button
                    key={month}
                    size={isMobile ? 'lg' : 'md'}
                    label={format(date, 'MMM')}
                    aria-label={format(date, 'MMMM yyyy')}
                    variant="secondary"
                    aria-pressed={selected(
                      periodRange('month', date, weekStartsOn),
                    )}
                    className={
                      selected(periodRange('month', date, weekStartsOn))
                        ? 'bg-accent-muted'
                        : undefined
                    }
                    endContent={
                      <Icon
                        icon={Check}
                        className={
                          selected(periodRange('month', date, weekStartsOn))
                            ? undefined
                            : 'invisible'
                        }
                      />
                    }
                    isDisabled={pending || dateKey(date) > dateKey(today)}
                    onClick={() => select('month', date)}
                  />
                )
              })}
            </Grid>
          )}
          {view === 'week' && (
            <Stack
              height={isMobile ? '50dvh' : '16rem'}
              isScrollable
              className="overscroll-contain pe-2"
              aria-label={titles[view]}
            >
              <List density={isMobile ? 'balanced' : 'compact'}>
                {Array.from({ length: 209 }, (_, i) => {
                  const date = addWeeks(today, -i)
                  const range = periodRange(view, date, weekStartsOn)
                  return (
                    <ListItem
                      key={range[0]}
                      label={
                        i === 0
                          ? t`This week`
                          : i === 1
                            ? t`Last week`
                            : `${format(parseISO(range[0]), 'MMM d')} – ${format(parseISO(range[1]), 'MMM d, yyyy')}`
                      }
                      isSelected={selected(range)}
                      endContent={
                        selected(range) ? <Icon icon={Check} /> : undefined
                      }
                      isDisabled={pending}
                      onClick={() => select(view, date)}
                    />
                  )
                })}
              </List>
            </Stack>
          )}
          {view === 'year' && (
            <Stack
              height={isMobile ? '40dvh' : '16rem'}
              isScrollable
              className="overscroll-contain pe-2"
              aria-label={titles.year}
            >
              <Grid columns={3} gap={2}>
                {Array.from({ length: 101 }, (_, index) => {
                  const date = addYears(today, -index)
                  return (
                    <Button
                      key={date.getFullYear()}
                      label={format(date, 'yyyy')}
                      size={isMobile ? 'lg' : 'md'}
                      variant="secondary"
                      aria-pressed={selected(
                        periodRange('year', date, weekStartsOn),
                      )}
                      className={
                        selected(periodRange('year', date, weekStartsOn))
                          ? 'bg-accent-muted'
                          : undefined
                      }
                      endContent={
                        <Icon
                          icon={Check}
                          className={
                            selected(periodRange('year', date, weekStartsOn))
                              ? undefined
                              : 'invisible'
                          }
                        />
                      }
                      isDisabled={pending}
                      onClick={() => select('year', date)}
                    />
                  )
                })}
              </Grid>
            </Stack>
          )}
          {view === 'custom' && (
            <>
              <FinanceCalendar
                className="p-0"
                mode="range"
                selected={draft}
                onSelect={setDraft}
              />
              <Stack direction="horizontal" gap={2} justify="end">
                <Button
                  size={isMobile ? 'lg' : 'md'}
                  label={t`Cancel`}
                  variant="secondary"
                  isDisabled={pending}
                  onClick={() => setStep(null)}
                />
                <Button
                  size={isMobile ? 'lg' : 'md'}
                  variant="primary"
                  label={t`Apply range`}
                  isLoading={pending}
                  isDisabled={!draft?.from || !draft.to}
                  onClick={() => {
                    if (draft?.from && draft.to)
                      apply('custom', [dateKey(draft.from), dateKey(draft.to)])
                  }}
                />
              </Stack>
            </>
          )}
        </Stack>
      ),
    }),
  )
  return (
    <Stack direction="vertical" gap={3} width="100%">
      {pending && (
        <Stack className="pointer-events-none fixed inset-x-0 top-0 z-50 [&_.astryx-progress-bar-track]:h-0.5">
          <ProgressBar
            label={t`Updating date range`}
            isLabelHidden
            isIndeterminate
          />
        </Stack>
      )}
      <Stack direction="horizontal" gap={2} align="center">
        <Button
          size={isMobile ? 'lg' : 'md'}
          label={t`Previous period`}
          isIconOnly
          icon={<Icon icon={ChevronLeft} />}
          variant="secondary"
          isDisabled={pending || mode === 'custom'}
          onClick={() => navigate(-1)}
        />
        {isMobile ? (
          <Button
            size={isMobile ? 'lg' : 'md'}
            label={label}
            aria-haspopup="dialog"
            aria-expanded={step !== null}
            icon={<Icon icon={ChevronDown} />}
            variant="secondary"
            isLoading={pending}
            onClick={() => {
              setPage(0)
              setStep('views')
            }}
            className={isMobile ? 'min-w-0 flex-1' : undefined}
          />
        ) : (
          <DropdownMenu
            presentation="popover"
            isMenuOpen={step !== null}
            onOpenChange={(open) => {
              if (!pending) {
                setPage(0)
                setStep(open ? 'views' : null)
              }
            }}
            menuWidth={160}
            renderTrigger={(props) => (
              <Button
                {...props}
                label={label}
                icon={<Icon icon={ChevronDown} />}
                variant="secondary"
                isLoading={pending}
              />
            )}
          >
            <DropdownMenuGroup title={t`Date view`}>
              {(Object.keys(titles) as (keyof typeof titles)[]).map(
                (option) => (
                  <DropdownMenuSubMenu
                    key={option}
                    label={titles[option]}
                    presentation="flyout"
                    menuDataTestId={`date-period-${option}`}
                    menuWidth={
                      option === 'custom'
                        ? 320
                        : option === 'week'
                          ? 240
                          : option === 'month'
                            ? 256
                            : 128
                    }
                    isDisabled={pending}
                    onOpenChange={(open) => {
                      if (open) chooseMode(option)
                    }}
                    header={
                      option === 'year' ? undefined : (
                        <Stack data-date-range-picker>
                          {
                            periodContents.find(({ view }) => view === option)
                              ?.content
                          }
                        </Stack>
                      )
                    }
                  >
                    {option === 'year' &&
                      Array.from({ length: 101 }, (_, index) => {
                        const date = addYears(today, -index)
                        return (
                          <DropdownMenuItem
                            key={date.getFullYear()}
                            label={format(date, 'yyyy')}
                            aria-current={
                              selected(
                                periodRange('year', date, weekStartsOn),
                              ) || undefined
                            }
                            className={
                              selected(periodRange('year', date, weekStartsOn))
                                ? 'bg-accent-muted'
                                : undefined
                            }
                            endContent={
                              selected(
                                periodRange('year', date, weekStartsOn),
                              ) ? (
                                <Icon icon={Check} />
                              ) : undefined
                            }
                            isDisabled={pending}
                            onClick={() => select('year', date)}
                          />
                        )
                      })}
                  </DropdownMenuSubMenu>
                ),
              )}
            </DropdownMenuGroup>
          </DropdownMenu>
        )}
        <Button
          size={isMobile ? 'lg' : 'md'}
          label={t`Next period`}
          isIconOnly
          icon={<Icon icon={ChevronRight} />}
          variant="secondary"
          isDisabled={pending || mode === 'custom' || endDate >= dateKey(today)}
          onClick={() => navigate(1)}
        />
        {(mode !== 'month' ||
          !selected(periodRange('month', today, weekStartsOn))) && (
          <Button
            size={isMobile ? 'lg' : 'md'}
            label={t`Reset to this month`}
            isIconOnly
            icon={<Icon icon={Undo2} />}
            variant="secondary"
            isDisabled={pending}
            onClick={() => select('month', today)}
          />
        )}
      </Stack>
      {error && <Text role="alert">{error}</Text>}
      {isMobile && (
        <>
          <BottomSheet
            label={t`Choose date view`}
            isOpen={step === 'views'}
            onOpenChange={onOpenChange}
            height="hug"
          >
            {viewsContent}
          </BottomSheet>
          {periodContents.map(({ view, content }) => (
            <BottomSheet
              key={view}
              label={titles[view]}
              isOpen={step === view}
              onOpenChange={onOpenChange}
              height="hug"
            >
              {content}
            </BottomSheet>
          ))}
        </>
      )}
    </Stack>
  )
}
