import { Collapsible } from '@astryxdesign/core/Collapsible'
import type { ComponentProps } from 'react'
import { useHistoryState } from '@/hooks/use-history-state'

export function HistoryCollapsible({
  historyId,
  defaultIsOpen = true,
  ...props
}: Omit<ComponentProps<typeof Collapsible>, 'isOpen' | 'onOpenChange'> & {
  historyId: string
}) {
  const [isOpen, setIsOpen] = useHistoryState(
    `group:${historyId}`,
    defaultIsOpen,
  )
  return <Collapsible {...props} isOpen={isOpen} onOpenChange={setIsOpen} />
}
