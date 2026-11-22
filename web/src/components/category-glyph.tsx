import { Icon as AstryxIcon, type IconSize } from '@astryxdesign/core/Icon'
import { Icon, type IconNode } from 'lucide-react'
import { type IconName } from 'lucide-react/dynamic'
import { useSyncExternalStore, type ReactNode, type SVGProps } from 'react'

const icons = new Map<IconName, IconNode>()
const pending = new Map<IconName, Promise<void>>()
const listeners = new Map<IconName, Set<() => void>>()

export function CategoryGlyph({
  name,
  fallback,
  size,
  className: _className,
}: {
  name: IconName
  fallback: ReactNode
  size?: IconSize
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
      loadIcon(name)
      return () => {
        subscribers.delete(listener)
        if (!subscribers.size) listeners.delete(name)
      }
    },
    () => icons.get(name),
  )

  const ResolvedIcon = (props: SVGProps<SVGSVGElement>) =>
    iconNode ? <Icon iconNode={iconNode} {...props} /> : null

  return (
    <span aria-hidden="true">
      {iconNode ? <AstryxIcon icon={ResolvedIcon} size={size} /> : fallback}
    </span>
  )
}

function loadIcon(name: IconName) {
  if (icons.has(name) || pending.has(name)) return
  const request = import('lucide-react/dynamic')
    .then(({ dynamicIconImports }) =>
      Object.hasOwn(dynamicIconImports, name)
        ? dynamicIconImports[name]()
        : null,
    )
    .then((module) => {
      if (!module) return
      icons.set(name, module.__iconNode)
      listeners.get(name)?.forEach((listener) => listener())
    })
    .catch(() => {
      /* Retain the category fallback if loading fails. */
    })
    .finally(() => pending.delete(name))
  pending.set(name, request)
}
