import { ProgressBar } from '@astryxdesign/core/ProgressBar'
import { useIsMobile } from '@/hooks/use-mobile'
import { Popover } from '@astryxdesign/core/Popover'
import {
  FinanceCalendar,
  type FinanceDateRange,
} from '@/components/finance-calendar'
import { useWeekStart } from '@/hooks/use-week-start'
import {
  dateKey,
  detectPeriod,
  periodRange,
  weekDays,
  type DatePeriod,
} from '@/lib/date-period'
import { BottomSheet } from '@astryxdesign/core/BottomSheet'
import { Button } from '@astryxdesign/core/Button'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon } from '@astryxdesign/core/Icon'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  parseISO,
  startOfWeek,
} from 'date-fns'
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Undo2,
} from 'lucide-react'
import { useRef, useState, useTransition } from 'react'

const titles: Record<DatePeriod, string> = {
  week: 'View by week',
  month: 'View by month',
  year: 'View by year',
  calendar: 'Calendar view',
  custom: 'Custom range',
}
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
  const isMobile = useIsMobile()
  const triggerRef = useRef<HTMLButtonElement>(null!)
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
  const [yearCount, setYearCount] = useState(11)
  const [weekCount, setWeekCount] = useState(52)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const mode =
    chosen?.start === startDate && chosen.end === endDate
      ? chosen.mode
      : detectPeriod(startDate, endDate, weekStartsOn)
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const today = new Date()
  const newestYear = Math.max(today.getFullYear(), start.getFullYear())
  const years = Array.from(
    { length: Math.max(yearCount, newestYear - start.getFullYear() + 1) },
    (_, i) => newestYear - i,
  )
  const newestWeek = startOfWeek(start > today ? start : today, {
    weekStartsOn,
  })
  const rangeLabel = `${format(start, start.getFullYear() === end.getFullYear() ? 'MMM d' : 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`
  const label =
    mode === 'month'
      ? format(start, 'MMMM yyyy')
      : mode === 'year'
        ? format(start, 'yyyy')
        : mode === 'calendar'
          ? format(start, 'MMM d, yyyy')
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
        setError('Could not update dates. Please try again.')
      }
    })
  }
  function select(nextMode: Exclude<DatePeriod, 'custom'>, date: Date) {
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
  function chooseMode(next: DatePeriod) {
    if (next === 'calendar') {
      select('calendar', start)
      return
    }
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
      <Text type="large" weight="semibold">
        Date view
      </Text>
      {(Object.keys(titles) as DatePeriod[]).map((option) => (
        <Button
          size={isMobile ? 'lg' : 'md'}
          key={option}
          label={titles[option]}
          icon={<Icon icon={CalendarDays} />}
          variant={mode === option ? 'primary' : 'secondary'}
          isDisabled={pending}
          onClick={() => chooseMode(option)}
        />
      ))}
      {error && <Text role="alert">{error}</Text>}
    </Stack>
  )
  const periodContents = (['week', 'month', 'year', 'custom'] as const).map(
    (view) => ({
      view,
      content: (
        <Stack
          direction="vertical"
          gap={4}
          className={isMobile ? 'h-full min-h-0' : 'h-96 min-h-0'}
        >
          <Stack
            direction="horizontal"
            justify="between"
            align="center"
            className="shrink-0"
          >
            <Text type="large" weight="semibold">
              {titles[view]}
            </Text>
            <Button
              size={isMobile ? 'lg' : 'md'}
              label="Switch view"
              variant="ghost"
              isDisabled={pending}
              onClick={() => setStep('views')}
            />
          </Stack>
          <Stack
            direction="vertical"
            gap={4}
            className="min-h-0 flex-1 [scrollbar-gutter:stable] overflow-y-auto pe-2"
            role="region"
            aria-label={`${titles[view]} options`}
            tabIndex={0}
          >
            {error && <Text role="alert">{error}</Text>}
            {view === 'year' &&
              years.map((year) => (
                <Button
                  size={isMobile ? 'lg' : 'md'}
                  key={year}
                  label={String(year)}
                  variant={
                    selected(
                      periodRange('year', new Date(year, 0, 1), weekStartsOn),
                    )
                      ? 'primary'
                      : 'secondary'
                  }
                  isDisabled={pending}
                  onClick={() => select('year', new Date(year, 0, 1))}
                />
              ))}
            {view === 'month' &&
              years.map((year) => (
                <Stack key={year} direction="vertical" gap={2}>
                  <Text type="label">{year}</Text>
                  <Grid columns={3} gap={2}>
                    {Array.from({ length: 12 }, (_, month) => {
                      const date = new Date(year, month, 1)
                      return (
                        <Button
                          size={isMobile ? 'lg' : 'md'}
                          key={month}
                          label={format(date, 'MMM')}
                          aria-label={format(date, 'MMMM yyyy')}
                          variant={
                            selected(periodRange('month', date, weekStartsOn))
                              ? 'primary'
                              : 'secondary'
                          }
                          isDisabled={pending}
                          onClick={() => select('month', date)}
                        />
                      )
                    })}
                  </Grid>
                </Stack>
              ))}
            {(view === 'year' || view === 'month') && (
              <Button
                size={isMobile ? 'lg' : 'md'}
                label="Show earlier years"
                variant="ghost"
                onClick={() => setYearCount(years.length + 10)}
              />
            )}
            {view === 'week' && (
              <>
                {Array.from({ length: weekCount }, (_, i) => {
                  const date = addWeeks(newestWeek, -i)
                  const days = weekDays(date, weekStartsOn)
                  const range = periodRange('week', date, weekStartsOn)
                  const title = `${format(days[0], 'MMM d, yyyy')} – ${format(days[6], 'MMM d, yyyy')}`
                  return (
                    <Button
                      key={range[0]}
                      size={isMobile ? 'lg' : 'md'}
                      label={title}
                      variant={selected(range) ? 'primary' : 'secondary'}
                      isDisabled={pending}
                      onClick={() => select('week', date)}
                    />
                  )
                })}
                <Button
                  size={isMobile ? 'lg' : 'md'}
                  label="Show earlier weeks"
                  variant="ghost"
                  onClick={() => setWeekCount((count) => count + 52)}
                />
              </>
            )}
            {view === 'custom' && (
              <>
                <FinanceCalendar
                  mode="range"
                  selected={draft}
                  onSelect={setDraft}
                />
                <Stack direction="horizontal" gap={2} justify="end">
                  <Button
                    size={isMobile ? 'lg' : 'md'}
                    label="Cancel"
                    variant="secondary"
                    isDisabled={pending}
                    onClick={() => setStep(null)}
                  />
                  <Button
                    size={isMobile ? 'lg' : 'md'}
                    variant="primary"
                    label="Apply range"
                    isLoading={pending}
                    isDisabled={!draft?.from || !draft.to}
                    onClick={() => {
                      if (draft?.from && draft.to)
                        apply('custom', [
                          dateKey(draft.from),
                          dateKey(draft.to),
                        ])
                    }}
                  />
                </Stack>
              </>
            )}
          </Stack>
        </Stack>
      ),
    }),
  )
  return (
    <Stack direction="vertical" gap={3} width="100%">
      {pending && (
        <Stack className="pointer-events-none fixed inset-x-0 top-0 z-50 [&_.astryx-progress-bar-track]:h-0.5">
          <ProgressBar
            label="Updating date range"
            isLabelHidden
            isIndeterminate
          />
        </Stack>
      )}
      <Stack direction="horizontal" gap={2} align="center">
        <Button
          size={isMobile ? 'lg' : 'md'}
          label="Previous period"
          isIconOnly
          icon={<Icon icon={ChevronLeft} />}
          variant="secondary"
          isDisabled={pending || mode === 'custom'}
          onClick={() => navigate(-1)}
        />
        <Button
          size={isMobile ? 'lg' : 'md'}
          ref={triggerRef}
          label={label}
          aria-haspopup="dialog"
          aria-expanded={step !== null}
          icon={<Icon icon={ChevronDown} />}
          variant="secondary"
          isLoading={pending}
          onClick={() => setStep('views')}
          className={isMobile ? 'min-w-0 flex-1' : undefined}
        />
        <Button
          size={isMobile ? 'lg' : 'md'}
          label="Next period"
          isIconOnly
          icon={<Icon icon={ChevronRight} />}
          variant="secondary"
          isDisabled={pending || mode === 'custom'}
          onClick={() => navigate(1)}
        />
        {(mode !== 'month' ||
          !selected(periodRange('month', today, weekStartsOn))) && (
          <Button
            size={isMobile ? 'lg' : 'md'}
            label="Reset to this month"
            isIconOnly
            icon={<Icon icon={Undo2} />}
            variant="secondary"
            isDisabled={pending}
            onClick={() => select('month', today)}
          />
        )}
      </Stack>
      {error && <Text role="alert">{error}</Text>}
      {mode === 'calendar' && (
        <FinanceCalendar
          className="w-full"
          selected={start}
          onSelect={(date) => {
            if (date && !pending) select('calendar', date)
          }}
        />
      )}
      {isMobile ? (
        <>
          <BottomSheet
            label="Choose date view"
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
              height="capped"
            >
              {content}
            </BottomSheet>
          ))}
        </>
      ) : (
        <Popover
          anchorRef={triggerRef}
          label={step && step !== 'views' ? titles[step] : 'Choose date view'}
          isOpen={step !== null}
          onOpenChange={onOpenChange}
          width="max-content"
          content={
            <Stack className="w-80">
              {step === 'views'
                ? viewsContent
                : periodContents.find((item) => item.view === step)?.content}
            </Stack>
          }
        />
      )}
    </Stack>
  )
}
