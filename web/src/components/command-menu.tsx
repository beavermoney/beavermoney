import { useLogTransaction } from '@/hooks/use-log-transaction'
import { CommandPalette } from '@astryxdesign/core/CommandPalette'
import { useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useCallback, useEffect, useRef } from 'react'

export function CommandMenu() {
  const navigate = useNavigate()
  const selecting = useRef(false)
  const { householdId } = useParams({ from: '/_user/household/$householdId' })
  const { command_open: isOpen } = useSearch({
    from: '/_user/household/$householdId',
  })
  const { open: openTransaction } = useLogTransaction()
  const setOpen = useCallback(
    (open: boolean) => {
      void navigate({
        to: '.',
        search: (old) => ({ ...old, command_open: open }),
      })
    },
    [navigate],
  )
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen(!isOpen)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [isOpen, setOpen])
  const destinations = [
    { label: 'Transactions', to: '/household/$householdId/transactions' },
    { label: 'Accounts', to: '/household/$householdId/accounts' },
    { label: 'Investments', to: '/household/$householdId/investments' },
    { label: 'Categories', to: '/household/$householdId/categories' },
    { label: 'Subscriptions', to: '/household/$householdId/subscriptions' },
    { label: 'New Account', to: '/household/$householdId/accounts/new' },
    { label: 'New Investment', to: '/household/$householdId/investments/new' },
    { label: 'New Category', to: '/household/$householdId/categories/new' },
    {
      label: 'New Subscription',
      to: '/household/$householdId/subscriptions/new',
    },
  ] as const
  const items = [
    ...destinations.map((item) => ({
      id: item.label,
      label: item.label,
      run: () =>
        navigate({
          to: item.to,
          params: { householdId },
          search: (prev) => ({ ...prev, command_open: false }),
        }),
    })),
    {
      id: 'New Transaction',
      label: 'New Transaction',
      run: () => {
        setOpen(false)
        openTransaction('expense')
      },
    },
  ]
  return (
    <CommandPalette
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && selecting.current) {
          selecting.current = false
          return
        }
        setOpen(open)
      }}
      label="Search commands"
      searchSource={{
        bootstrap: () => items,
        search: (query) =>
          items.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase()),
          ),
      }}
      onValueChange={(id) => {
        selecting.current = true
        void items.find((item) => item.id === id)?.run()
      }}
    />
  )
}
