import { Icon as AstryxIcon } from '@astryxdesign/core/Icon'
import { Icon, type IconNode } from 'lucide-react'
import { dynamicIconImports, type IconName } from 'lucide-react/dynamic'
import {
  useEffect,
  useSyncExternalStore,
  type ReactNode,
  type SVGProps,
} from 'react'

const icons = new Map<IconName, IconNode>()
const pending = new Map<IconName, Promise<void>>()
const listeners = new Map<IconName, Set<() => void>>()

export function CategoryGlyph({
  name,
  fallback,
  className: _className,
}: {
  name: IconName
  fallback: ReactNode
  className?: string
}) {
  const iconNode = useSyncExternalStore(
    (listener) => {
      let subscribers = listeners.get(name)
      if (!subscribers) {
        subscribers = new Set()
        listeners.set(name, subscribers)
      }
      subscribers.add(listener)
      return () => {
        subscribers.delete(listener)
        if (!subscribers.size) listeners.delete(name)
      }
    },
    () => icons.get(name),
  )

  useEffect(() => {
    if (icons.has(name) || pending.has(name)) return
    const request = dynamicIconImports[name]()
      .then((module) => {
        icons.set(name, module.__iconNode)
        listeners.get(name)?.forEach((listener) => listener())
      })
      .catch(() => {
        /* Keep the transaction-type fallback if the icon cannot load. */
      })
      .finally(() => pending.delete(name))
    pending.set(name, request)
  }, [name])

  const ResolvedIcon = (props: SVGProps<SVGSVGElement>) =>
    iconNode ? <Icon iconNode={iconNode} {...props} /> : null

  return (
    <span aria-hidden="true">
      {iconNode ? <AstryxIcon icon={ResolvedIcon} /> : fallback}
    </span>
  )
}
