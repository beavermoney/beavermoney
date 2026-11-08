import type { FinanceDateRange as DateRange } from '@/components/finance-calendar'
import { FinanceCalendar } from '@/components/finance-calendar'
import { Button } from '@astryxdesign/core/Button'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Popover } from '@astryxdesign/core/Popover'
import { Selector } from '@astryxdesign/core/Selector'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Stack } from '@astryxdesign/core/Stack'
import { Text } from '@astryxdesign/core/Text'
import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Undo2 } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'

type GroupByOption = 'MONTH' | 'YEAR' | 'CUSTOM'

const GROUP_BY_LABELS: Record<GroupByOption, string> = {
  MONTH: 'Month',
  YEAR: 'Year',
  CUSTOM: 'Custom',
}

type DateRangeFilterProps = {
  startDate: string
  endDate: string
  onDateRangeChange: (startDate: string, endDate: string) => Promise<void>
}

export function DateRangeFilter({
  startDate,
  endDate,
  onDateRangeChange,
}: DateRangeFilterProps) {
  const [isPending, startTransition] = useTransition()
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const formatDateForURL = (date: Date) => {
    return format(date, 'yyyy-MM-dd')
  }

  // Derive month and year from props (controlled component)
  const startDateObj = useMemo(() => new Date(startDate), [startDate])
  const endDateObj = useMemo(() => new Date(endDate), [endDate])

  // Detect grouping mode based on start and end dates (source of truth)
  const groupBy = useMemo((): GroupByOption => {
    const start = startOfMonth(startDateObj)
    const end = endOfMonth(startDateObj)

    // Check if it's exactly one month
    if (
      formatDateForURL(startDateObj) === formatDateForURL(start) &&
      formatDateForURL(endDateObj) === formatDateForURL(end)
    ) {
      return 'MONTH'
    }

    // Check if it's exactly one year
    const yearStart = startOfYear(startDateObj)
    const yearEnd = endOfYear(startDateObj)

    if (
      formatDateForURL(startDateObj) === formatDateForURL(yearStart) &&
      formatDateForURL(endDateObj) === formatDateForURL(yearEnd)
    ) {
      return 'YEAR'
    }

    // Otherwise it's custom
    return 'CUSTOM'
  }, [startDateObj, endDateObj])

  // UI state: track if user wants to see custom picker (overrides groupBy for display)
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  // Derive selected month/year from URL (source of truth)
  const selectedMonth = useMemo(() => startDateObj.getMonth(), [startDateObj])
  const selectedMonthYear = useMemo(
    () => startDateObj.getFullYear(),
    [startDateObj],
  )
  const selectedYear = useMemo(() => startDateObj.getFullYear(), [startDateObj])

  // For CUSTOM mode: date range
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>({
    from: new Date(startDate),
    to: new Date(endDate),
  })

  const handleGroupByChange = (value: string | null) => {
    if (!value) return

    const newGroupBy = value as GroupByOption

    // When switching modes, apply appropriate date range and refresh data
    if (newGroupBy === 'MONTH') {
      setShowCustomPicker(false)
      // Use the currently selected month/year
      const date = new Date(selectedMonthYear, selectedMonth, 1)
      const start = startOfMonth(date)
      const end = endOfMonth(date)

      startTransition(async () => {
        await onDateRangeChange(formatDateForURL(start), formatDateForURL(end))
      })
    } else if (newGroupBy === 'YEAR') {
      setShowCustomPicker(false)
      // Use the currently selected year
      const start = startOfYear(new Date(selectedYear, 0, 1))
      const end = endOfYear(new Date(selectedYear, 0, 1))

      startTransition(async () => {
        await onDateRangeChange(formatDateForURL(start), formatDateForURL(end))
      })
    } else if (newGroupBy === 'CUSTOM') {
      // Set UI state to show custom picker and open dropdown
      setShowCustomPicker(true)
      setIsPickerOpen(true)
    }
  }

  const handleMonthSelect = (month: number, year: number) => {
    const date = new Date(year, month, 1)
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    startTransition(async () => {
      await onDateRangeChange(formatDateForURL(start), formatDateForURL(end))
    })
    setIsPickerOpen(false)
  }

  const handleYearSelect = (year: number) => {
    const start = startOfYear(new Date(year, 0, 1))
    const end = endOfYear(new Date(year, 0, 1))

    startTransition(async () => {
      await onDateRangeChange(formatDateForURL(start), formatDateForURL(end))
    })
    setIsPickerOpen(false)
  }

  const handleCustomApply = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      const start = formatDateForURL(tempDateRange.from)
      const end = formatDateForURL(tempDateRange.to)

      startTransition(async () => {
        await onDateRangeChange(start, end)
      })
      setIsPickerOpen(false)
      setShowCustomPicker(false)
    }
  }

  const handleCancel = () => {
    setTempDateRange({
      from: new Date(startDate),
      to: new Date(endDate),
    })
    setIsPickerOpen(false)
    setShowCustomPicker(false)
  }

  const handlePrevious = () => {
    if (groupBy === 'MONTH') {
      // Navigate to previous month
      const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1
      const newYear =
        selectedMonth === 0 ? selectedMonthYear - 1 : selectedMonthYear
      handleMonthSelect(newMonth, newYear)
    } else if (groupBy === 'YEAR') {
      // Navigate to previous year
      handleYearSelect(selectedYear - 1)
    }
  }

  const handleNext = () => {
    if (groupBy === 'MONTH') {
      // Navigate to next month
      const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1
      const newYear =
        selectedMonth === 11 ? selectedMonthYear + 1 : selectedMonthYear
      handleMonthSelect(newMonth, newYear)
    } else if (groupBy === 'YEAR') {
      // Navigate to next year
      handleYearSelect(selectedYear + 1)
    }
  }

  const handleToday = () => {
    const now = new Date()
    if (groupBy === 'MONTH') {
      // Navigate to current month
      handleMonthSelect(now.getMonth(), now.getFullYear())
    } else if (groupBy === 'YEAR') {
      // Navigate to current year
      handleYearSelect(now.getFullYear())
    } else {
      // For CUSTOM, go to current month
      const start = startOfMonth(now)
      const end = endOfMonth(now)
      startTransition(async () => {
        await onDateRangeChange(formatDateForURL(start), formatDateForURL(end))
      })
    }
  }

  // Check if we're on the current period
  const isCurrentPeriod = useMemo(() => {
    const now = new Date()
    if (groupBy === 'MONTH') {
      return (
        selectedMonth === now.getMonth() &&
        selectedMonthYear === now.getFullYear()
      )
    }
    if (groupBy === 'YEAR') {
      return selectedYear === now.getFullYear()
    }
    return false
  }, [groupBy, selectedMonth, selectedMonthYear, selectedYear])

  const getDisplayLabel = () => {
    if (groupBy === 'MONTH') {
      const date = new Date(selectedMonthYear, selectedMonth, 1)
      return format(date, 'MMM yyyy')
    }
    if (groupBy === 'YEAR') {
      return selectedYear.toString()
    }
    // CUSTOM
    try {
      const from = format(new Date(startDate), 'MMM d, yyyy')
      const to = format(new Date(endDate), 'MMM d, yyyy')
      return `${from} - ${to}`
    } catch {
      return 'Select dates'
    }
  }

  // Generate year options (last 10 years + current year)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i)

  const monthOptions = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  return (
    <Stack direction="horizontal" gap={4} align="center" justify="between">
      <Stack direction="horizontal" gap={2} align="center">
        <Button
          onClick={handlePrevious}
          label={'Previous period'}
          variant={'secondary'}

          isDisabled={groupBy === 'CUSTOM'}
          isIconOnly
          icon={
            <>
              <AstryxIcon icon={ChevronLeft} />
            </>
          }
        ></Button>

        <Popover
          isOpen={isPickerOpen}
          onOpenChange={setIsPickerOpen}
          label="Choose value"
          alignment={'start'}
          content={
            <>
              {!showCustomPicker && groupBy === 'MONTH' && (
                <Stack direction="vertical" gap={3}>
                  <Text as="div" display="block" type="label">
                    Select Month
                  </Text>
                  <Selector
                    value={selectedMonthYear.toString()}
                    onChange={(value) => {
                      if (!value) return
                      const year = parseInt(value, 10)
                      handleMonthSelect(selectedMonth, year)
                    }}
                    label={'Select option'}
                    isLabelHidden
                    options={[
                      ...yearOptions.map((year) => ({
                        value: year.toString(),
                        label: String(year),
                      })),
                    ]}
                  />
                  <Grid columns={{ minWidth: 240, repeat: 'fit' }} gap={4}>
                    {monthOptions.map((month, index) => (
                      <Button
                        key={month}
                        onClick={() =>
                          handleMonthSelect(index, selectedMonthYear)
                        }
                        label={String(month.slice(0, 3))}
                        variant={
                          index === selectedMonth ? 'primary' : 'secondary'
                        }
                      >
                        {month.slice(0, 3)}
                      </Button>
                    ))}
                  </Grid>
                </Stack>
              )}
              {!showCustomPicker && groupBy === 'YEAR' && (
                <Stack direction="vertical" gap={2}>
                  <Text as="div" display="block" type="label">
                    Select Year
                  </Text>
                  <Grid columns={{ minWidth: 240, repeat: 'fit' }} gap={4}>
                    {yearOptions.map((year) => (
                      <Button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        label={String(year)}
                        variant={
                          year === selectedYear ? 'primary' : 'secondary'
                        }
                      >
                        {year}
                      </Button>
                    ))}
                  </Grid>
                </Stack>
              )}
              {(showCustomPicker || groupBy === 'CUSTOM') && (
                <>
                  <FinanceCalendar
                    mode="range"
                    selected={tempDateRange}
                    onSelect={setTempDateRange}
                    numberOfMonths={2}
                    disabled={(date) => date > new Date()}
                  />
                  <Stack direction="horizontal" gap={2}>
                    <Button
                      onClick={handleCancel}

                      label={'Cancel'}
                      variant={'secondary'}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCustomApply}

                      label={'Apply'}
                      variant={'primary'}

                      isDisabled={!tempDateRange?.from || !tempDateRange?.to}
                    >
                      Apply
                    </Button>
                  </Stack>
                </>
              )}
            </>
          }
        >
          {(triggerProps) => (
            <Button
              {...triggerProps}

              label={String(getDisplayLabel())}
              variant={'secondary'}
            >
              {getDisplayLabel()}
            </Button>
          )}
        </Popover>

        <Button
          onClick={handleNext}
          label={'Next period'}
          variant={'secondary'}

          isDisabled={groupBy === 'CUSTOM'}
          isIconOnly
          icon={
            <>
              <AstryxIcon icon={ChevronRight} />
            </>
          }
        ></Button>

        {!isCurrentPeriod && groupBy !== 'CUSTOM' && (
          <Button
            onClick={handleToday}
            tooltip={
              groupBy === 'MONTH' ? 'Go to this month' : 'Go to this year'
            }
            label={groupBy === 'MONTH' ? 'Go to this month' : 'Go to this year'}
            variant={'secondary'}

            isIconOnly
            icon={
              <>
                <AstryxIcon icon={Undo2} />
              </>
            }
          ></Button>
        )}

        {isPending && <Spinner />}
      </Stack>

      <Selector
        value={showCustomPicker ? 'CUSTOM' : groupBy}
        onChange={handleGroupByChange}
        label="Period"
        isLabelHidden
        options={[
          ...[
            ...Object.entries(GROUP_BY_LABELS).map(([value, label]) => ({
              value: value,
              label: String(label),
            })),
          ],
        ]}
      />
    </Stack>
  )
}
