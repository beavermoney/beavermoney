import { useHotkeySequence } from '@tanstack/react-hotkeys'
import { useNavigate } from '@tanstack/react-router'
import { identity } from 'lodash-es'
import { useLogTransaction } from '@/hooks/use-log-transaction'

const Hotkeys = () => {
  const navigate = useNavigate()
  const { open } = useLogTransaction()

  useHotkeySequence(['N', 'E'], () => {
    open('expense')
  })

  useHotkeySequence(['N', 'I'], () => {
    open('income')
  })

  useHotkeySequence(['N', 'T'], () => {
    open('transfer')
  })

  useHotkeySequence(['N', 'B'], () => {
    open('buy')
  })

  useHotkeySequence(['N', 'S'], () => {
    open('sell')
  })

  useHotkeySequence(['N', 'M'], () => {
    open('move')
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

  useHotkeySequence(['G', ','], () => {
    navigate({
      from: '/household/$householdId',
      to: '/household/$householdId/settings/general',
      search: identity,
    })
  })

  return null
}

export default Hotkeys
