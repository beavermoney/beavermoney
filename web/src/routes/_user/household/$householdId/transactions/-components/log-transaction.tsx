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
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useHotkey } from '@tanstack/react-hotkeys'
import invariant from 'tiny-invariant'

const logTransactionFragment = graphql`
  fragment logTransactionFragment on Household {
    ...newExpenseFragment
    ...newIncomeFragment
    ...newTransferFragment
    ...newBuyFragment
    ...newSellFragment
    ...newMoveFragment
  }
`

type TransactionType =
  | 'expense'
  | 'income'
  | 'transfer'
  | 'buy'
  | 'sell'
  | 'move'

type NewTransactionProps = {
  fragmentRef: logTransactionFragment$key
}

export function LogTransaction({ fragmentRef }: NewTransactionProps) {
  const data = useFragment(logTransactionFragment, fragmentRef)
  const panelRef = useRef<HTMLDivElement>(null)
  const search = useSearch({
    from: '/_user/household/$householdId',
    select: (s) => ({
      logType: s.log_type,
    }),
  })
  const navigate = useNavigate()
  const selectedType = search.logType
  invariant(
    selectedType,
    'selectedType should be defined when rendering LogTransaction',
  )
  const setSelectedType = (type: TransactionType) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        log_type: type,
      }),
    })
  }

  useHotkey('Escape', () => {
    const activeElement = document.activeElement as HTMLElement | null

    if (activeElement && activeElement !== document.body) {
      activeElement.blur()
      return
    }

    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        log_type: null,
      }),
    })
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
      <ScrollArea className="w-full">
        <div className="flex gap-2 p-4">
          <Button
            size="sm"
            variant={selectedType === 'expense' ? 'default' : 'outline'}
            onClick={() => setSelectedType('expense')}
          >
            Expense
          </Button>
          <Button
            size="sm"
            variant={selectedType === 'income' ? 'default' : 'outline'}
            onClick={() => setSelectedType('income')}
          >
            Income
          </Button>
          <Button
            size="sm"
            variant={selectedType === 'transfer' ? 'default' : 'outline'}
            onClick={() => setSelectedType('transfer')}
          >
            Transfer
          </Button>
          <Button
            size="sm"
            variant={selectedType === 'buy' ? 'default' : 'outline'}
            onClick={() => setSelectedType('buy')}
          >
            Buy
          </Button>
          <Button
            size="sm"
            variant={selectedType === 'sell' ? 'default' : 'outline'}
            onClick={() => setSelectedType('sell')}
          >
            Sell
          </Button>
          <Button
            size="sm"
            variant={selectedType === 'move' ? 'default' : 'outline'}
            onClick={() => setSelectedType('move')}
          >
            Move
          </Button>
          <div className="px-1"></div>
        </div>
      </ScrollArea>

      {selectedType === 'expense' && <NewExpense fragmentRef={data} />}
      {selectedType === 'income' && <NewIncome fragmentRef={data} />}
      {selectedType === 'transfer' && <NewTransfer fragmentRef={data} />}
      {selectedType === 'buy' && <NewBuy fragmentRef={data} />}
      {selectedType === 'sell' && <NewSell fragmentRef={data} />}
      {selectedType === 'move' && <NewMove fragmentRef={data} />}
    </Item>
  )
}
