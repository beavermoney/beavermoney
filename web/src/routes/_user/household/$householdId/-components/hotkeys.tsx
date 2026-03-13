import { useHotkeySequence } from '@tanstack/react-hotkeys'
import { useNavigate } from '@tanstack/react-router'
import { identity } from 'lodash-es'

const Hotkeys = () => {
  const navigate = useNavigate()

  useHotkeySequence(['N', 'E'], () => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, log_type: 'expense' }),
    })
  })

  useHotkeySequence(['N', 'I'], () => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, log_type: 'income' }),
    })
  })

  useHotkeySequence(['N', 'T'], () => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, log_type: 'transfer' }),
    })
  })

  useHotkeySequence(['N', 'B'], () => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, log_type: 'buy' }),
    })
  })

  useHotkeySequence(['N', 'S'], () => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, log_type: 'sell' }),
    })
  })

  useHotkeySequence(['N', 'M'], () => {
    navigate({
      to: '.',
      search: (prev) => ({ ...prev, log_type: 'move' }),
    })
  })

  useHotkeySequence(['G', 'T'], () => {
    navigate({
      from: '/household/$householdId',
      to: '/household/$householdId/transactions',
      search: identity,
    })
  })

  useHotkeySequence(['G', 'A'], () => {
    navigate({
      from: '/household/$householdId',
      to: '/household/$householdId/accounts',
      search: identity,
    })
  })

  useHotkeySequence(['G', 'C'], () => {
    navigate({
      from: '/household/$householdId',
      to: '/household/$householdId/categories',
      search: identity,
    })
  })

  useHotkeySequence(['G', 'I'], () => {
    navigate({
      from: '/household/$householdId',
      to: '/household/$householdId/investments',
      search: identity,
    })
  })

  useHotkeySequence(['G', 'S'], () => {
    navigate({
      from: '/household/$householdId',
      to: '/household/$householdId/subscriptions',
      search: identity,
    })
  })

  return null
}

export default Hotkeys
