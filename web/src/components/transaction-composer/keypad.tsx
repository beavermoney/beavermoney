import {
  editAmount,
  calculateAmount,
  type PendingCalculation,
} from './amount-entry'
import { Button } from '@astryxdesign/core/Button'
import { Grid } from '@astryxdesign/core/Grid'
import { Stack } from '@astryxdesign/core/Stack'
import type { ReactNode } from 'react'

export function ComposerKeypad({
  value,
  decimal,
  scale,
  onChange,
  date,
  pending,
  setPending,
}: {
  value: string
  decimal: string
  scale: number
  onChange: (next: string) => void
  date: ReactNode
  pending: PendingCalculation | null
  setPending: (next: PendingCalculation | null) => void
}) {
  function press(key: string) {
    if (key === '+' || key === '-') {
      setPending({ left: value || '0', operator: key, right: '' })
    } else if (key === '=') {
      setPending(null)
    } else if (pending) {
      const right = editAmount(pending.right, key, decimal, scale)
      setPending({ ...pending, right })
      onChange(
        calculateAmount(
          pending.left,
          right || '0',
          pending.operator,
          decimal,
          scale,
        ),
      )
    } else {
      onChange(editAmount(value, key, decimal, scale))
    }
  }
  return (
    <Stack gap={2}>
      <Grid columns={4} gap={2}>
        {[
          '1',
          '2',
          '3',
          'date',
          '4',
          '5',
          '6',
          '-',
          '7',
          '8',
          '9',
          '+',
          decimal,
          '0',
          'backspace',
          '=',
        ].map((key) =>
          key === 'date' ? (
            <Stack key="date" className="composer-key-date">
              {date}
            </Stack>
          ) : (
            <Button
              key={key}
              type="button"
              size="lg"
              width="100%"
              className="composer-key"
              label={
                key === 'backspace'
                  ? 'Delete last digit'
                  : key === decimal
                    ? 'Decimal separator'
                    : key === '-'
                      ? 'Subtract'
                      : key === '+'
                        ? 'Add amount'
                        : key === '='
                          ? 'Equals'
                          : key
              }
              onClick={() => press(key)}
            >
              {key === 'backspace' ? '⌫' : key === '-' ? '−' : key}
            </Button>
          ),
        )}
      </Grid>
    </Stack>
  )
}
