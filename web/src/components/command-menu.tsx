import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useIsMobile } from '@/hooks/use-mobile'
import { commandStore } from '@/store'
import {
  LinkOptions,
  useNavigate,
  useParams,
  useSearch,
} from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { random } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'

export function CommandMenu() {
  const navigate = useNavigate()
  const { householdId } = useParams({ from: '/_user/household/$householdId' })

  const [shouldClearValue, setShouldClearValue] = useState(false)

  const search = useSearch({
    from: '/_user/household/$householdId',
  })

  const value = useStore(commandStore, (state) => state)
  const setValue = useCallback((value: string) => {
    commandStore.setState(value)
  }, [])
  const isMobile = useIsMobile()

  const open = search.command_open
  const setOpen = useCallback(
    (val: boolean | ((v: boolean) => boolean)) => {
      if (shouldClearValue) {
        setValue('')
        setShouldClearValue(false)
      }

      const commandOpen = typeof val === 'function' ? val(open) : val
      navigate({
        to: '.',
        search: (old) => ({
          ...old,
          command_open: commandOpen,
        }),
      })
    },
    [navigate, open, shouldClearValue, setValue, setShouldClearValue],
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  const handleSelect = (opts: LinkOptions) => {
    navigate(opts)
    setShouldClearValue(true)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput
          id={String(open) + String(random())}
          placeholder="Type a command or search..."
          value={value}
          onValueChange={setValue}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigate">
            <CommandItem
              onSelect={() =>
                handleSelect({
                  to: '/household/$householdId/transactions',
                  params: { householdId },
                  search: (prev) => ({
                    ...prev,
                    command_open: false,
                  }),
                })
              }
            >
              Transactions
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect({
                  to: '/household/$householdId/accounts',
                  params: { householdId },
                  search: (prev) => ({
                    ...prev,
                    command_open: false,
                  }),
                })
              }
            >
              Accounts
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect({
                  to: '/household/$householdId/investments',
                  params: { householdId },
                  search: (prev) => ({
                    ...prev,
                    command_open: false,
                  }),
                })
              }
            >
              Investments
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect({
                  to: '/household/$householdId/categories',
                  params: { householdId },
                  search: (prev) => ({
                    ...prev,
                    command_open: false,
                  }),
                })
              }
            >
              Categories
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect({
                  to: '/household/$householdId/subscriptions',
                  params: { householdId },
                  search: (prev) => ({
                    ...prev,
                    command_open: false,
                  }),
                })
              }
            >
              Subscriptions
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Create">
            <CommandItem
              onSelect={() =>
                handleSelect({
                  to: isMobile
                    ? '/household/$householdId/transactions/new'
                    : '.',
                  params: { householdId },
                  search: (prev) => ({
                    ...prev,
                    command_open: false,
                    log_type: 'expense',
                  }),
                })
              }
            >
              New Transaction
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect({
                  to: '/household/$householdId/accounts/new',
                  params: { householdId },
                  search: (prev) => ({
                    ...prev,
                    command_open: false,
                  }),
                })
              }
            >
              New Account
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect({
                  to: '/household/$householdId/investments/new',
                  params: { householdId },
                  search: (prev) => ({
                    ...prev,
                    command_open: false,
                  }),
                })
              }
            >
              New Investment
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect({
                  to: '/household/$householdId/categories/new',
                  params: { householdId },
                  search: (prev) => ({
                    ...prev,
                    command_open: false,
                  }),
                })
              }
            >
              New Category
            </CommandItem>
            <CommandItem
              onSelect={() =>
                handleSelect({
                  to: '/household/$householdId/subscriptions/new',
                  params: { householdId },
                  search: (prev) => ({
                    ...prev,
                    command_open: false,
                  }),
                })
              }
            >
              New Subscription
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
