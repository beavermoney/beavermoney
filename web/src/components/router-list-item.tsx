import { ListItem, type ListItemProps } from '@astryxdesign/core/List'
import {
  useRouter,
  useRouterState,
  type LinkOptions,
} from '@tanstack/react-router'

export function RouterListItem({
  to,
  from,
  params,
  search,
  ...props
}: ListItemProps & LinkOptions) {
  const router = useRouter()
  useRouterState({ select: (s) => s.location.href })
  const destination = { to, from, params, search }
  return (
    <ListItem
      {...props}
      href={router.buildLocation(destination).href}
      onClick={(event) => {
        props.onClick?.(event)
        if (
          !event.defaultPrevented &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault()
          void router.navigate(destination)
        }
      }}
    />
  )
}
