import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns'
import { useState, useTransition, useMemo } from 'react'
import type { DateRange } from 'react-day-picker'
import { ChevronLeft, ChevronRight, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

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
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={groupBy === 'CUSTOM'}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <DropdownMenu open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className={cn(groupBy !== 'CUSTOM' && 'w-24')}
              />
            }
          >
            {getDisplayLabel()}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-auto p-0">
            {!showCustomPicker && groupBy === 'MONTH' && (
              <div className="flex flex-col gap-3 p-4">
                <div className="text-sm font-medium">Select Month</div>
                <Select
                  value={selectedMonthYear.toString()}
                  onValueChange={(value) => {
                    if (!value) return
                    const year = parseInt(value, 10)
                    handleMonthSelect(selectedMonth, year)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{selectedMonthYear}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-3 gap-2">
                  {monthOptions.map((month, index) => (
                    <Button
                      key={month}
                      variant={index === selectedMonth ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        handleMonthSelect(index, selectedMonthYear)
                      }
                    >
                      {month.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {!showCustomPicker && groupBy === 'YEAR' && (
              <div className="flex flex-col gap-2 p-3">
                <div className="text-sm font-medium">Select Year</div>
                <div className="grid max-h-60 grid-cols-3 gap-2 overflow-y-auto">
                  {yearOptions.map((year) => (
                    <Button
                      key={year}
                      variant={year === selectedYear ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleYearSelect(year)}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {(showCustomPicker || groupBy === 'CUSTOM') && (
              <>
                <Calendar
                  className="bg-card"
                  mode="range"
                  selected={tempDateRange}
                  onSelect={setTempDateRange}
                  numberOfMonths={2}
                  disabled={(date) => date > new Date()}
                />
                <div className="flex gap-2 p-3 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCustomApply}
                    disabled={!tempDateRange?.from || !tempDateRange?.to}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={groupBy === 'CUSTOM'}
        >
          <ChevronRight className="size-4" />
        </Button>

        {!isCurrentPeriod && groupBy !== 'CUSTOM' && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleToday}
            title={groupBy === 'MONTH' ? 'Go to this month' : 'Go to this year'}
          >
            <Undo2 className="size-4" />
          </Button>
        )}

        {isPending && <Spinner />}
      </div>

      <Select
        name="group-by-filter"
        value={showCustomPicker ? 'CUSTOM' : groupBy}
        onValueChange={handleGroupByChange}
      >
        <SelectTrigger className="w-32">
          <SelectValue>
            {GROUP_BY_LABELS[showCustomPicker ? 'CUSTOM' : groupBy]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="">
          <SelectGroup>
            {Object.entries(GROUP_BY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
