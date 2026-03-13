import { useHotkeySequence } from '@tanstack/react-hotkeys'
import { useNavigate } from '@tanstack/react-router'

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

  return null
}

export default Hotkeys
