import composerStyles from '@/components/transaction-composer/composer.module.css'
import { useKeypadOrder } from '@/hooks/use-keypad-order'
import { useLingui } from '@lingui/react/macro'
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
  const { t } = useLingui()
  const { keypadOrder } = useKeypadOrder()
  const topRow =
    keypadOrder === 'calculator' ? ['7', '8', '9'] : ['1', '2', '3']
  const bottomRow =
    keypadOrder === 'calculator' ? ['1', '2', '3'] : ['7', '8', '9']

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
          ...topRow,
          'date',
          '4',
          '5',
          '6',
          '-',
          ...bottomRow,
          '+',
          decimal,
          '0',
          'backspace',
          '=',
        ].map((key) =>
          key === 'date' ? (
            <Stack key="date">{date}</Stack>
          ) : (
            <Button
              key={key}
              type="button"
              size="lg"
              width="100%"
              className={composerStyles['composer-key']}
              label={
                key === 'backspace'
                  ? t`Delete last digit`
                  : key === decimal
                    ? t`Decimal separator`
                    : key === '-'
                      ? t`Subtract`
                      : key === '+'
                        ? t`Add amount`
                        : key === '='
                          ? t`Equals`
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
