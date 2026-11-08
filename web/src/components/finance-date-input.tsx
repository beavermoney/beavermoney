import { DateInput } from '@astryxdesign/core/DateInput'
import type { ISODateString } from '@astryxdesign/core/Calendar'
import { format, parseISO } from 'date-fns'

export function FinanceDateInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  disabledDate,
}: {
  id: string
  label: string
  value: Date
  onChange: (value: Date) => void
  onBlur: () => void
  disabledDate?: (date: Date) => boolean
}) {
  return (
    <DateInput
      id={id}
      label={label}
      width="100%"
      value={format(value, 'yyyy-MM-dd') as ISODateString}
      onChange={(next) => {
        if (next) onChange(parseISO(next))
      }}
      onBlur={onBlur}
      dateConstraints={
        disabledDate ? [(date) => !disabledDate(date)] : undefined
      }
      presentation="adaptive-bottom-sheet"
    />
  )
}
