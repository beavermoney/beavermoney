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
  return <Link {...props} ref={ref} to={href ?? to ?? ''} />
})

export function AstryxRouterProvider({ children }: { children: ReactNode }) {
  return <LinkProvider component={AstryxRouterLink}>{children}</LinkProvider>
}
