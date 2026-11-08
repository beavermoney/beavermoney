import { Button } from '@astryxdesign/core/Button'
import { ScrollableArea } from '@astryxdesign/core/ScrollableArea'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl'
import { Stack } from '@astryxdesign/core/Stack'
import { useEffect, useRef } from 'react'
import { graphql, useFragment } from 'react-relay'
import { NewBuy } from './new-buy'
import { NewExpense } from './new-expense'
import { NewIncome } from './new-income'
import { NewMove } from './new-move'
import { NewSell } from './new-sell'
import { NewTransfer } from './new-transfer'

import { logTransactionFragment$key } from './__generated__/logTransactionFragment.graphql'

import { useHotkey } from '@tanstack/react-hotkeys'
import invariant from 'tiny-invariant'

import type { LogTransactionType } from '@/hooks/log-transaction-store'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import { focusInitialTransactionControl } from './transaction-focus'

const logTransactionFragment = graphql`
  fragment logTransactionFragment on Household
  @argumentDefinitions(viewUserIds: { type: "[ID!]" }) {
    ...newExpenseFragment @arguments(viewUserIds: $viewUserIds)
    ...newIncomeFragment @arguments(viewUserIds: $viewUserIds)
    ...newTransferFragment @arguments(viewUserIds: $viewUserIds)
    ...newBuyFragment @arguments(viewUserIds: $viewUserIds)
    ...newSellFragment @arguments(viewUserIds: $viewUserIds)
    ...newMoveFragment @arguments(viewUserIds: $viewUserIds)
  }
`

type NewTransactionProps = {
  fragmentRef: logTransactionFragment$key
}

type Mode = 'cash' | 'investment'

const CASH_TYPES: readonly LogTransactionType[] = [
  'expense',
  'income',
  'transfer',
]
const INVESTMENT_TYPES: readonly LogTransactionType[] = ['buy', 'sell', 'move']

const TYPE_LABELS: Record<LogTransactionType, string> = {
  expense: 'Expense',
  income: 'Income',
  transfer: 'Transfer',
  buy: 'Buy',
  sell: 'Sell',
  move: 'Move',
}

const MODES: { value: Mode; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'investment', label: 'Investment' },
]

function modeForType(type: LogTransactionType): Mode {
  return CASH_TYPES.includes(type) ? 'cash' : 'investment'
}

function firstTypeForMode(mode: Mode): LogTransactionType {
  return mode === 'cash' ? 'expense' : 'buy'
}

export function LogTransaction({ fragmentRef }: NewTransactionProps) {
  const data = useFragment(logTransactionFragment, fragmentRef)
  const panelRef = useRef<HTMLDivElement>(null)
  const { type: selectedType, setType, close } = useLogTransaction()
  invariant(
    selectedType,
    'selectedType should be defined when rendering LogTransaction',
  )

  const mode = modeForType(selectedType)
  const visibleTypes = mode === 'cash' ? CASH_TYPES : INVESTMENT_TYPES

  const handleModeChange = (next: Mode) => {
    if (next === mode) {
      return
    }
    setType(firstTypeForMode(next))
  }

  useHotkey('Escape', () => {
    const activeElement = document.activeElement as HTMLElement | null

    if (activeElement && activeElement !== document.body) {
      activeElement.blur()
      return
    }

    close()
  })

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (panelRef.current) {
        focusInitialTransactionControl(panelRef.current)
      }
    })

    return () => cancelAnimationFrame(frame)
  }, [selectedType])

  return (
    <Stack ref={panelRef} direction="vertical" gap={6}>
      <Stack direction="vertical" gap={4}>
        <SegmentedControl
          label="Transaction kind"
          value={mode}
          onChange={(next) => handleModeChange(next as Mode)}
        >
          {MODES.map((option) => (
            <SegmentedControlItem
              key={option.value}
              value={option.value}
              label={option.label}
            />
          ))}
        </SegmentedControl>

        <ScrollableArea axis="inline" label="Transaction types">
          <Stack direction="horizontal" gap={2}>
            {visibleTypes.map((t) => (
              <Button
                key={t}
                onClick={() => setType(t)}
                label={String(TYPE_LABELS[t])}
                variant={selectedType === t ? 'primary' : 'secondary'}
              >
                {TYPE_LABELS[t]}
              </Button>
            ))}
          </Stack>
        </ScrollableArea>
      </Stack>
      <Stack direction="vertical" gap={4}>
        {selectedType === 'expense' && <NewExpense fragmentRef={data} />}
        {selectedType === 'income' && <NewIncome fragmentRef={data} />}
        {selectedType === 'transfer' && <NewTransfer fragmentRef={data} />}
        {selectedType === 'buy' && <NewBuy fragmentRef={data} />}
        {selectedType === 'sell' && <NewSell fragmentRef={data} />}
        {selectedType === 'move' && <NewMove fragmentRef={data} />}
      </Stack>
    </Stack>
  )
}
