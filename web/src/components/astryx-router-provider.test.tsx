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
import { RouterListItem } from './router-list-item'
import { Link as AstryxLink } from '@astryxdesign/core/Link'
import { z } from 'zod'
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

it('preserves a fully built row href with date filters instead of appending a second query', async () => {
  const root = createRootRoute({
    component: () => (
      <AstryxRouterProvider>
        <Outlet />
      </AstryxRouterProvider>
    ),
  })
  const merchants = createRoute({
    getParentRoute: () => root,
    path: '/household/$householdId/merchants',
    validateSearch: z.object({
      start: z.string().default('2026-11-01'),
      end: z.string().default('2026-11-30'),
    }),
    component: Outlet,
  })
  const list = createRoute({
    getParentRoute: () => merchants,
    path: '/',
    component: () => (
      <List>
        <RouterListItem
          to="/household/$householdId/merchants/unassigned"
          params={{ householdId: 'household' }}
          search={{ start: '2026-09-01', end: '2026-09-30' }}
          label="Unassigned"
        />
      </List>
    ),
  })
  const detail = createRoute({
    getParentRoute: () => merchants,
    path: '/unassigned',
    component: () => (
      <>
        <p>Unassigned detail</p>
        <AstryxLink href="/household/household/merchants?start=2026-08-01&end=2026-08-31#history">
          August merchants
        </AstryxLink>
        <AstryxLink
          href="https://example.com/report?month=9#summary"
          isExternalLink
        >
          External report
        </AstryxLink>
      </>
    ),
  })
  const router = createRouter({
    routeTree: root.addChildren([merchants.addChildren([list, detail])]),
    history: createMemoryHistory({
      initialEntries: [
        '/household/household/merchants?start=2026-09-01&end=2026-09-30',
      ],
    }),
  })
  render(<RouterProvider router={router} />)
  const link = await screen.findByRole('link', { name: 'Unassigned' })
  expect(link.getAttribute('href')).toBe(
    '/household/household/merchants/unassigned?start=2026-09-01&end=2026-09-30',
  )
  fireEvent.click(link, { button: 0 })
  await screen.findByText('Unassigned detail')
  expect(router.state.location.href).toBe(
    '/household/household/merchants/unassigned?start=2026-09-01&end=2026-09-30',
  )
  expect(router.state.location.search).toEqual({
    start: '2026-09-01',
    end: '2026-09-30',
  })
  expect(
    screen.getByRole('link', { name: /External report/ }).getAttribute('href'),
  ).toBe('https://example.com/report?month=9#summary')
  fireEvent.click(screen.getByRole('link', { name: 'August merchants' }), {
    button: 0,
  })
  await waitFor(() =>
    expect(router.state.location.href).toBe(
      '/household/household/merchants?start=2026-08-01&end=2026-08-31#history',
    ),
  )
})
