import { graphql, useFragment } from 'react-relay'
import { NewExpense } from './new-expense'
import { NewIncome } from './new-income'
import { NewTransfer } from './new-transfer'
import { NewBuy } from './new-buy'
import { NewSell } from './new-sell'
import { NewMove } from './new-move'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Item } from '@/components/ui/item'
import { logTransactionFragment$key } from './__generated__/logTransactionFragment.graphql'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useHotkey } from '@tanstack/react-hotkeys'
import invariant from 'tiny-invariant'
import { useLogTransaction } from '@/hooks/use-log-transaction'
import type { LogTransactionType } from '@/hooks/log-transaction-store'
import { cn } from '@/lib/utils'

const logTransactionFragment = graphql`
  fragment logTransactionFragment on Household
  @argumentDefinitions(viewUserId: { type: "ID" }) {
    ...newExpenseFragment @arguments(viewUserId: $viewUserId)
    ...newIncomeFragment @arguments(viewUserId: $viewUserId)
    ...newTransferFragment @arguments(viewUserId: $viewUserId)
    ...newBuyFragment @arguments(viewUserId: $viewUserId)
    ...newSellFragment @arguments(viewUserId: $viewUserId)
    ...newMoveFragment @arguments(viewUserId: $viewUserId)
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
      const firstInput = panelRef.current?.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable="true"]',
      )

      firstInput?.focus()
    })

    return () => cancelAnimationFrame(frame)
  }, [selectedType])

  return (
    <Item ref={panelRef} className="bg-muted h-full w-full gap-0 p-0">
      <div className="flex w-full items-center gap-3 px-4 py-3">
        <div
          role="group"
          aria-label="Transaction kind"
          className="border-border divide-border flex shrink-0 divide-x border"
        >
          {MODES.map((m) => {
            const active = mode === m.value
            return (
              <button
                key={m.value}
                type="button"
                aria-pressed={active}
                onClick={() => handleModeChange(m.value)}
                className={cn(
                  'focus-visible:ring-ring/30 inline-flex h-6 cursor-pointer items-center justify-center px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2',
                  active
                    ? 'bg-background text-foreground'
                    : 'hover:text-foreground hover:bg-background/50 text-muted-foreground',
                )}
              >
                {m.label}
              </button>
            )
          })}
        </div>

        <div aria-hidden className="bg-border h-4 w-px shrink-0" />

        <ScrollArea className="min-w-0 flex-1">
          <div className="flex gap-2 py-px">
            {visibleTypes.map((t) => (
              <Button
                key={t}
                size="sm"
                variant={selectedType === t ? 'default' : 'outline'}
                onClick={() => setType(t)}
              >
                {TYPE_LABELS[t]}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {selectedType === 'expense' && <NewExpense fragmentRef={data} />}
      {selectedType === 'income' && <NewIncome fragmentRef={data} />}
      {selectedType === 'transfer' && <NewTransfer fragmentRef={data} />}
      {selectedType === 'buy' && <NewBuy fragmentRef={data} />}
      {selectedType === 'sell' && <NewSell fragmentRef={data} />}
      {selectedType === 'move' && <NewMove fragmentRef={data} />}
    </Item>
  )
}
