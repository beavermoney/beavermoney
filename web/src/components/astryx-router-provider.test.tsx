// @vitest-environment jsdom
import '@/test/browser-setup'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { List, ListItem } from '@astryxdesign/core/List'
import { AstryxRouterProvider } from './astryx-router-provider'
import { RouteContentBoundary } from './route-content-boundary'

afterEach(cleanup)

it('routes inner Astryx row links without replacing the shell while detail data loads', async () => {
  let ready = false
  let resolve!: () => void
  const pending = new Promise<void>((done) => {
    resolve = done
  })
  function Detail() {
    if (!ready) throw pending
    return <p>Account detail loaded</p>
  }
  const root = createRootRoute({
    component: () => (
      <AstryxRouterProvider>
        <nav aria-label="Persistent navigation">Accounts</nav>
        <RouteContentBoundary>
          <Outlet />
        </RouteContentBoundary>
      </AstryxRouterProvider>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (
      <List>
        <ListItem href="/account" label="Checking account" />
      </List>
    ),
  })
  const detail = createRoute({
    getParentRoute: () => root,
    path: '/account',
    component: Detail,
  })
  const router = createRouter({
    routeTree: root.addChildren([index, detail]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  render(<RouterProvider router={router} />)
  const link = await screen.findByRole('link', { name: 'Checking account' })
  const navigation = screen.getByRole('navigation')
  // fireEvent returns false only when the browser's default navigation was prevented.
  expect(fireEvent.click(link, { button: 0 })).toBe(false)
  await waitFor(() => expect(router.state.location.pathname).toBe('/account'))
  expect(screen.getByRole('navigation')).toBe(navigation)
  ready = true
  resolve()
  expect(await screen.findByText('Account detail loaded')).toBeTruthy()
  expect(screen.getByRole('navigation')).toBe(navigation)
})
