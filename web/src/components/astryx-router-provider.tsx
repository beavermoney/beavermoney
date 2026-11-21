import { LinkProvider } from '@astryxdesign/core/Link'
import { Link } from '@tanstack/react-router'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'

// Astryx's inner anchors must use the router too: row-level onClick does not
// intercept clicks on the link inside ListItem.
const AstryxRouterLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<'a'> & { to?: string }
>(function AstryxRouterLink({ href, to, ...props }, ref) {
  const destination = href ?? to ?? ''
  // Astryx supplies a complete URL. `to` treats its query as path text and can
  // append route defaults a second time; `href` parses the path/search/hash.
  // Keep external destinations on Link's native external-link path.
  const external = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(destination)
  return (
    <Link
      {...props}
      ref={ref}
      {...(external ? { to: destination } : { href: destination })}
    />
  )
})

export function AstryxRouterProvider({ children }: { children: ReactNode }) {
  return <LinkProvider component={AstryxRouterLink}>{children}</LinkProvider>
}
