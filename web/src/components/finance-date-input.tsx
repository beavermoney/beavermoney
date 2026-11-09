import { useLingui } from '@lingui/react/macro'
import { useDateFormatter } from '@/hooks/use-date-formatter'
import { FinanceCalendar } from './finance-calendar'
import { useComposer } from './transaction-composer/context'
import { ComposerEditor } from './transaction-composer/controls'
import { Button } from '@astryxdesign/core/Button'
import { Text } from '@astryxdesign/core/Text'
import { Stack } from '@astryxdesign/core/Stack'
import { subDays } from 'date-fns'
import { DateInput } from '@astryxdesign/core/DateInput'
import type { ISODateString } from '@astryxdesign/core/Calendar'
import { parseISO } from 'date-fns'

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
  const format = useDateFormatter()
  const { t } = useLingui()
  const composer = useComposer()
  const input = (
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
  if (!composer) return input
  const choose = (date: Date) => {
    onChange(date)
    onBlur()
    composer.setEditor(null)
  }
  return (
    <>
      <Button
        size="lg"
        width="100%"
        className="composer-key composer-date-key"
        label={format(value, 'MMM d')}
        onClick={() => composer.setEditor(id)}
      />
      <ComposerEditor name={id}>
        <Stack gap={4} className="composer-choice">
          <Text type="label">{label}</Text>
          <Stack direction="horizontal" gap={2}>
            <Button label={t`Today`} onClick={() => choose(new Date())} />
            <Button
              label={t`Yesterday`}
              onClick={() => choose(subDays(new Date(), 1))}
            />
          </Stack>
          <Stack className="composer-choice-results">
            <FinanceCalendar
              selected={value}
              defaultMonth={value}
              disabled={disabledDate}
              onSelect={(date) => {
                if (date) choose(date)
              }}
            />
          </Stack>
        </Stack>
      </ComposerEditor>
    </>
  )
}
