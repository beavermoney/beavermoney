import { Button, type ButtonProps } from '@astryxdesign/core/Button'
import { useRouter, type LinkOptions } from '@tanstack/react-router'

export function RouterButton({
  to,
  params,
  search,
  from,
  ...props
}: ButtonProps & LinkOptions) {
  const router = useRouter()
  const location = router.buildLocation({ to, params, search, from })
  return (
    <Button
      {...props}
      href={location.href}
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
          void router.navigate({ to, params, search, from })
        }
      }}
    />
  )
}
