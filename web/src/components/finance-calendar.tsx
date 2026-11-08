import { useIsMobile } from '@/hooks/use-mobile'
import {
  Calendar,
  type DateRange,
  type ISODateString,
} from '@astryxdesign/core/Calendar'
import { format, parseISO } from 'date-fns'

export type FinanceDateRange = { from: Date | undefined; to?: Date }
type Props = {
  className?: string
  numberOfMonths?: number
  disabled?: (date: Date) => boolean
  defaultMonth?: Date
} & (
  | {
      mode: 'range'
      selected?: FinanceDateRange
      onSelect?: (range: FinanceDateRange | undefined) => void
    }
  | {
      mode?: 'single'
      selected?: Date
      onSelect?: (date: Date | undefined) => void
    }
)
// Finance forms keep Date objects; Astryx calendars use local ISO dates.
export function FinanceCalendar(props: Props) {
  const isMobile = useIsMobile()
  const common = {
    className: props.className,
    numberOfMonths:
      props.numberOfMonths === 2 && !isMobile ? (2 as const) : (1 as const),
    dateConstraints: props.disabled
      ? [(date: Date) => !props.disabled!(date)]
      : undefined,
    focusDate: props.defaultMonth
      ? (format(props.defaultMonth, 'yyyy-MM-dd') as ISODateString)
      : undefined,
  }
  if (props.mode === 'range') {
    const value: DateRange | null = props.selected?.from
      ? {
          start: format(props.selected.from, 'yyyy-MM-dd') as ISODateString,
          end: props.selected.to
            ? (format(props.selected.to, 'yyyy-MM-dd') as ISODateString)
            : (format(props.selected.from, 'yyyy-MM-dd') as ISODateString),
        }
      : null
    return (
      <Calendar
        {...common}
        mode="range"
        value={value}
        onChange={(range) =>
          props.onSelect?.({
            from: range.start ? parseISO(range.start) : undefined,
            to: range.end ? parseISO(range.end) : undefined,
          })
        }
      />
    )
  }
  return (
    <Calendar
      {...common}
      value={
        props.selected
          ? (format(props.selected, 'yyyy-MM-dd') as ISODateString)
          : null
      }
      onChange={(_value, date) => props.onSelect?.(date)}
    />
  )
}
